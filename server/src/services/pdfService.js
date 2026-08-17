import { PDFDocument } from 'pdf-lib';
import AppError from '../utils/appError.js';

const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

const countWithPdfLib = async (pdfBuffer) => {
  const pdf = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  return pdf.getPageCount();
};

const countWithPdfJs = async (pdfBuffer) => {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
  const loadingTask = getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  await pdf.destroy();

  return pageCount;
};

const countWithRegexHeuristic = (pdfBuffer) => {
  const text = pdfBuffer.toString('latin1');
  const countMatches = [...text.matchAll(/\/Count\s+(\d+)/g)];

  if (countMatches.length) {
    const counts = countMatches
      .map((match) => Number(match[1]))
      .filter((count) => count > 0 && count < 100000);

    if (counts.length) {
      return Math.max(...counts);
    }
  }

  const pageTypeMatches = text.match(/\/Type\s*\/Page\b(?!s)/g);

  if (pageTypeMatches?.length) {
    return pageTypeMatches.length;
  }

  return null;
};

/**
 * Detect page count from a PDF buffer, then fall back to a manual value.
 * Returns null when detection fails and no valid manual count was provided.
 */
export const resolvePdfPageCount = async (pdfBuffer, manualPages) => {
  const strategies = [
    () => countWithPdfLib(pdfBuffer),
    () => countWithPdfJs(pdfBuffer),
    async () => countWithRegexHeuristic(pdfBuffer),
  ];

  for (const strategy of strategies) {
    try {
      const count = await strategy();

      if (isPositiveInt(count)) {
        return count;
      }
    } catch {
      // Try the next strategy.
    }
  }

  if (isPositiveInt(manualPages)) {
    return manualPages;
  }

  return null;
};

/** @deprecated Prefer resolvePdfPageCount — throws when count cannot be resolved. */
export const getPdfPageCount = async (pdfBuffer) => {
  const count = await resolvePdfPageCount(pdfBuffer);

  if (count === null) {
    throw new AppError(
      'Could not determine PDF page count. Enter the number of pages in the form and try again.',
      400,
    );
  }

  return count;
};
