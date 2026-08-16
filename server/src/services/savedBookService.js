import prisma from '../config/db.js';
import AppError from '../utils/appError.js';

const savedBookSelect = {
  id: true,
  title: true,
  slug: true,
  author: true,
  coverImage: true,
  language: true,
  pages: true,
  volumeNumber: true,
  totalVolumes: true,
  downloads: true,
  fileSize: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  collection: {
    select: {
      id: true,
      title: true,
      author: true,
      coverImage: true,
    },
  },
};

const ensureBookExists = async (bookId) => {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true },
  });

  if (!book) {
    throw new AppError('Book not found', 404);
  }

  return book;
};

export const saveBook = async ({ userId, bookId }) => {
  await ensureBookExists(bookId);

  return prisma.savedBook.upsert({
    where: {
      userId_bookId: {
        userId,
        bookId,
      },
    },
    update: {},
    create: {
      userId,
      bookId,
    },
    select: {
      id: true,
      bookId: true,
      createdAt: true,
    },
  });
};

export const unsaveBook = async ({ userId, bookId }) => {
  const savedBook = await prisma.savedBook.findUnique({
    where: {
      userId_bookId: {
        userId,
        bookId,
      },
    },
    select: { id: true },
  });

  if (!savedBook) {
    return null;
  }

  await prisma.savedBook.delete({
    where: { id: savedBook.id },
  });

  return savedBook;
};

export const getSaveStatus = async ({ userId, bookId }) => {
  await ensureBookExists(bookId);

  const savedBook = await prisma.savedBook.findUnique({
    where: {
      userId_bookId: {
        userId,
        bookId,
      },
    },
    select: { id: true },
  });

  return { saved: Boolean(savedBook) };
};

export const getSavedBooks = async (userId) => {
  const savedBooks = await prisma.savedBook.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      createdAt: true,
      book: {
        select: savedBookSelect,
      },
    },
  });

  return savedBooks.map((savedBook) => ({
    ...savedBook.book,
    savedAt: savedBook.createdAt,
  }));
};
