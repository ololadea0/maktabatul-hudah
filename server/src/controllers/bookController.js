import * as bookService from '../services/bookService.js';
import * as bookPageService from '../services/bookPageService.js';
import { Readable } from 'node:stream';
import {
  fetchObjectRange,
  getObjectMetadata,
} from '../config/supabaseStorage.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import AppError from '../utils/appError.js';

const PDF_CHUNK_SIZE = 1024 * 1024;

const parseContentRangeTotal = (contentRange) => {
  const match = contentRange?.match(/\/(\d+)$/);
  return match ? Number(match[1]) : null;
};

const parseRange = ({ rangeHeader, totalSize }) => {
  if (!rangeHeader) {
    return {
      start: 0,
      end: totalSize
        ? Math.min(PDF_CHUNK_SIZE - 1, totalSize - 1)
        : PDF_CHUNK_SIZE - 1,
    };
  }

  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) {
    throw new AppError('Invalid range request', 416);
  }

  const [, rawStart, rawEnd] = match;

  if (!rawStart && !rawEnd) {
    throw new AppError('Invalid range request', 416);
  }

  if (!rawStart) {
    if (!totalSize) {
      throw new AppError('Suffix range requires a known file size', 416);
    }

    const suffixLength = Number(rawEnd);
    const start = Math.max(totalSize - suffixLength, 0);
    return { start, end: totalSize - 1 };
  }

  const start = Number(rawStart);
  const requestedEnd = rawEnd ? Number(rawEnd) : start + PDF_CHUNK_SIZE - 1;
  const end = totalSize
    ? Math.min(requestedEnd, totalSize - 1)
    : requestedEnd;

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start > end ||
    (totalSize && start >= totalSize)
  ) {
    throw new AppError('Requested range is not satisfiable', 416);
  }

  return { start, end };
};

const getExternalMetadata = async (url, fallbackSize) => {
  const response = await fetch(url, { method: 'HEAD' });

  if (!response.ok) {
    throw new AppError('Unable to read PDF metadata', 502);
  }

  return {
    contentLength: Number(response.headers.get('content-length')) || fallbackSize || null,
    contentType: response.headers.get('content-type') || 'application/pdf',
    etag: response.headers.get('etag'),
    lastModified: response.headers.get('last-modified'),
  };
};

const fetchExternalRange = async ({ url, range }) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Range: range },
  });

  if (response.status !== 206) {
    throw new AppError('The PDF host does not support byte-range reading', 502);
  }

  return response;
};

const setPdfHeaders = ({ res, range, totalSize, metadata, upstream }) => {
  const upstreamContentRange = upstream.headers.get('content-range');
  const upstreamTotal = parseContentRangeTotal(upstreamContentRange);
  const resolvedTotal = totalSize || upstreamTotal;
  const contentLength =
    Number(upstream.headers.get('content-length')) ||
    range.end - range.start + 1;

  res.status(206);
  res.set({
    'Accept-Ranges': 'bytes',
    'Content-Type': metadata.contentType || 'application/pdf',
    'Content-Length': String(contentLength),
    'Content-Disposition': 'inline',
    'Cache-Control': 'private, no-store',
    'Content-Range': `bytes ${range.start}-${range.end}/${resolvedTotal || '*'}`,
  });

  if (metadata.etag) {
    res.set('ETag', metadata.etag);
  }

  if (metadata.lastModified) {
    res.set('Last-Modified', metadata.lastModified);
  }
};

export const getBooks = asyncHandler(async (req, res) => {
  const { books, pagination } = await bookService.getBooks({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    categoryId: req.query.categoryId,
    categorySlug: req.query.categorySlug,
    author: req.query.author,
    language: req.query.language,
    isPublished: req.query.isPublished,
    includeCollectionVolumes: req.query.includeCollectionVolumes,
  });

  return successResponse(res, 200, 'Books retrieved successfully', {
    books,
    pagination,
  });
});

export const getLibraryStats = asyncHandler(async (_req, res) => {
  const stats = await bookService.getLibraryStats();

  return successResponse(res, 200, 'Library stats retrieved successfully', {
    stats,
  });
});

export const getBookById = asyncHandler(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);

  return successResponse(res, 200, 'Book retrieved successfully', {
    book,
  });
});

export const getBookBySlug = asyncHandler(async (req, res) => {
  const book = await bookService.getBookBySlug(req.params.slug);

  return successResponse(res, 200, 'Book retrieved successfully', {
    book,
  });
});

export const createBook = asyncHandler(async (req, res) => {
  const book = await bookService.createBook(req.body, req.files, req.user.id);

  return successResponse(res, 201, 'Book created successfully', {
    book,
  });
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await bookService.updateBook(req.params.id, req.body, req.files);

  return successResponse(res, 200, 'Book updated successfully', {
    book,
  });
});

export const deleteBook = asyncHandler(async (req, res) => {
  await bookService.deleteBook(req.params.id);

  return successResponse(res, 200, 'Book deleted successfully');
});

export const downloadBook = asyncHandler(async (req, res) => {
  const book = await bookService.registerBookDownload(req.params.id);

  return successResponse(res, 200, 'Book download registered successfully', {
    pdfUrl: book.pdfUrl,
    book,
  });
});

export const getReaderInfo = asyncHandler(async (req, res) => {
  const reader = await bookPageService.getReaderInfo(req.params.id, req.user);

  return successResponse(res, 200, 'Reader info retrieved successfully', reader);
});

export const streamBookPdf = asyncHandler(async (req, res) => {
  const source = await bookService.getBookPdfSource(req.params.id);
  const metadata = source.storagePath
    ? await getObjectMetadata(source.storagePath)
    : await getExternalMetadata(source.externalUrl, source.fileSize);
  const totalSize = metadata.contentLength || source.fileSize || null;
  const range = parseRange({
    rangeHeader: req.headers.range,
    totalSize,
  });
  const upstreamRange = `bytes=${range.start}-${range.end}`;
  const upstream = source.storagePath
    ? await fetchObjectRange({
        path: source.storagePath,
        range: upstreamRange,
      })
    : await fetchExternalRange({
        url: source.externalUrl,
        range: upstreamRange,
      });

  if (upstream.status !== 206) {
    throw new AppError('The PDF source does not support byte-range reading', 502);
  }

  setPdfHeaders({ res, range, totalSize, metadata, upstream });
  Readable.fromWeb(upstream.body).pipe(res);
});

export const getReadingProgress = asyncHandler(async (req, res) => {
  const progress = await bookPageService.getReadingProgress({
    bookId: req.params.id,
    user: req.user,
  });

  return successResponse(res, 200, 'Reading progress retrieved successfully', progress);
});

export const saveReadingProgress = asyncHandler(async (req, res) => {
  const progress = await bookPageService.saveReadingProgress({
    bookId: req.params.id,
    currentPage: Number(req.body.currentPage),
    zoom: Number(req.body.zoom),
    user: req.user,
  });

  return successResponse(res, 200, 'Reading progress saved successfully', progress);
});
