import { PDFDocument } from 'pdf-lib';
import AppError from '../utils/appError.js';

export const getPdfPageCount = async (pdfBuffer) => {
  try {
    const pdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
    return pdf.getPageCount();
  } catch (_error) {
    throw new AppError('Unable to read PDF page count', 400);
  }
};
