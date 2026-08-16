import prisma from '../config/db.js';
import { createSignedObjectUrl } from '../config/supabaseStorage.js';
import env from '../config/env.js';
import AppError from '../utils/appError.js';

const canReadBook = (book, user) => book?.isPublished || user?.role === 'ADMIN';

const ensureReadableBook = async (bookId, user) => {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      title: true,
      pages: true,
      isPublished: true,
      processingStatus: true,
      filePublicId: true,
      fileSize: true,
      author: true,
    },
  });

  if (!book) {
    throw new AppError('Book not found', 404);
  }

  if (!canReadBook(book, user)) {
    throw new AppError('You are not authorized to read this book', 403);
  }

  return book;
};

export const getReaderInfo = async (bookId, user) => {
  const book = await ensureReadableBook(bookId, user);
  const progress = await prisma.readingProgress.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId,
      },
    },
  });

  if (!book.filePublicId?.startsWith('books/')) {
    throw new AppError('No private PDF is available for this book yet', 404);
  }

  const signedUrl = await createSignedObjectUrl(book.filePublicId);
  const expiresIn = Number(env.supabaseSignedUrlExpiresIn) || 300;

  return {
    bookId: book.id,
    title: book.title,
    author: book.author,
    pageCount: book.pages || 0,
    processingStatus: 'READY',
    fileSize: book.fileSize || null,
    pdfUrl: signedUrl,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    progress: {
      currentPage: progress?.currentPage || 1,
      zoom: progress?.zoom || 1,
      progress: progress?.progress || 0,
      lastReadAt: progress?.lastReadAt || null,
    },
    watermark: 'Maktabatul Huda',
  };
};

export const getReadingProgress = async ({ bookId, user }) => {
  await ensureReadableBook(bookId, user);

  const progress = await prisma.readingProgress.findUnique({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId,
      },
    },
  });

  return {
    currentPage: progress?.currentPage || 1,
    zoom: progress?.zoom || 1,
    progress: progress?.progress || 0,
    lastReadAt: progress?.lastReadAt || null,
  };
};

export const saveReadingProgress = async ({ bookId, currentPage, zoom, user }) => {
  const book = await ensureReadableBook(bookId, user);

  if (
    !Number.isInteger(currentPage) ||
    currentPage < 1 ||
    (book.pages && currentPage > book.pages)
  ) {
    throw new AppError('Invalid page number', 400);
  }

  const nextZoom = Number.isFinite(zoom) ? zoom : 1;
  const progress = book.pages
    ? Number(((currentPage / book.pages) * 100).toFixed(2))
    : 0;

  return prisma.readingProgress.upsert({
    where: {
      userId_bookId: {
        userId: user.id,
        bookId,
      },
    },
    update: {
      currentPage,
      zoom: nextZoom,
      progress,
    },
    create: {
      userId: user.id,
      bookId,
      currentPage,
      zoom: nextZoom,
      progress,
    },
    select: {
      currentPage: true,
      zoom: true,
      progress: true,
      lastReadAt: true,
    },
  });
};
