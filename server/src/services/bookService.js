import prisma from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import {
  createSignedObjectUrl,
  deleteObject,
  uploadObject,
} from '../config/supabaseStorage.js';
import AppError from '../utils/appError.js';
import slugify from '../utils/slugify.js';
import { getPdfPageCount } from './pdfService.js';

const bookSelect = {
  id: true,
  title: true,
  slug: true,
  author: true,
  description: true,
  about: true,
  isbn: true,
  coverImage: true,
  coverImagePublicId: true,
  fileUrl: true,
  filePublicId: true,
  language: true,
  publisher: true,
  publicationYear: true,
  pages: true,
  volumeSet: true,
  volumeNumber: true,
  totalVolumes: true,
  fileSize: true,
  downloads: true,
  isPublished: true,
  processingStatus: true,
  collectionId: true,
  categoryId: true,
  uploadedById: true,
  createdAt: true,
  updatedAt: true,
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
  uploadedBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
};

const isSupabasePdfPath = (path) => path?.startsWith('books/');

const getBookPdfUrl = async (book) => {
  if (isSupabasePdfPath(book.filePublicId)) {
    return createSignedObjectUrl(book.filePublicId);
  }

  return book.fileUrl;
};

const normalizeBook = async (book) => ({
  ...book,
  pdfUrl: await getBookPdfUrl(book),
  fileUrl: undefined,
  coverImagePublicId: undefined,
  filePublicId: undefined,
});

const cleanNullableString = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  return value;
};

const cleanNullableInt = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  return Number(value);
};

const cleanOptionalBoolean = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
};

const ensureCategoryExists = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }
};

const ensureCollectionExists = async (collectionId) => {
  if (!collectionId) {
    return null;
  }

  const collection = await prisma.bookCollection.findUnique({
    where: { id: collectionId },
    select: {
      id: true,
      title: true,
      author: true,
      coverImage: true,
    },
  });

  if (!collection) {
    throw new AppError('Collection not found', 404);
  }

  return collection;
};

const ensureUniqueCollectionVolume = async ({ collectionId, volumeNumber, excludeId }) => {
  if (!collectionId || !volumeNumber) {
    return;
  }

  const duplicate = await prisma.book.findFirst({
    where: {
      collectionId,
      volumeNumber,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new AppError('This volume number already exists in the collection', 409);
  }
};

const ensureUniqueBook = async ({
  title,
  author,
  slug,
  isbn,
  volumeSet,
  volumeNumber,
  excludeId,
}) => {
  const filters = [{ slug }];

  if (isbn) {
    filters.push({ isbn });
  }

  if (title && author && !volumeNumber) {
    filters.push({
      AND: [
        { title: { equals: title, mode: 'insensitive' } },
        { author: { equals: author, mode: 'insensitive' } },
      ],
    });
  }

  if (title && author && volumeNumber) {
    filters.push({
      AND: [
        { title: { equals: title, mode: 'insensitive' } },
        { author: { equals: author, mode: 'insensitive' } },
        { volumeNumber },
        volumeSet
          ? { volumeSet: { equals: volumeSet, mode: 'insensitive' } }
          : { volumeSet: null },
      ],
    });
  }

  const duplicate = await prisma.book.findFirst({
    where: {
      OR: filters,
      NOT: excludeId ? { id: excludeId } : undefined,
    },
  });

  if (!duplicate) {
    return;
  }

  if (duplicate.slug === slug) {
    throw new AppError('Book slug already exists', 409);
  }

  if (
    title &&
    author &&
    duplicate.title.toLowerCase() === title.toLowerCase() &&
    duplicate.author.toLowerCase() === author.toLowerCase() &&
    duplicate.volumeNumber === volumeNumber
  ) {
    throw new AppError('This book volume already exists for this author', 409);
  }

  if (
    title &&
    author &&
    !volumeNumber &&
    duplicate.title.toLowerCase() === title.toLowerCase() &&
    duplicate.author.toLowerCase() === author.toLowerCase()
  ) {
    throw new AppError('Book already exists for this author', 409);
  }

  throw new AppError('Book ISBN already exists', 409);
};

const getFileExtension = (filename = '') =>
  filename.split('.').pop()?.toLowerCase() || 'pdf';

const sanitizeFileName = (filename = 'book.pdf') => {
  const extension = getFileExtension(filename);
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const safeBaseName = slugify(baseName) || 'book';

  return `${safeBaseName}.${extension}`;
};

const uploadCoverToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'al-ilm-library/books/covers',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          coverImage: result.secure_url,
          coverImagePublicId: result.public_id,
        });
      },
    );

    uploadStream.end(file.buffer);
  });

const uploadPdfToSupabase = async (file, bookId) => {
  const path = bookId
    ? `books/${bookId}/original.pdf`
    : `books/${Date.now()}-${sanitizeFileName(file.originalname)}`;
  const uploaded = await uploadObject({
    path,
    buffer: file.buffer,
    contentType: file.mimetype,
  });

  return {
    pdfUrl: uploaded.path,
    filePublicId: uploaded.path,
    fileSize: file.size,
  };
};

const getCloudinaryPublicIdFromUrl = (url, resourceType) => {
  if (!url) {
    return null;
  }

  try {
    const { pathname } = new URL(url);
    const segments = pathname.split('/').filter(Boolean);
    const uploadIndex = segments.indexOf('upload');

    if (uploadIndex === -1) {
      return null;
    }

    const publicIdSegments = segments.slice(uploadIndex + 1);

    if (publicIdSegments[0]?.match(/^v\d+$/)) {
      publicIdSegments.shift();
    }

    const publicId = decodeURIComponent(publicIdSegments.join('/'));

    if (resourceType === 'image') {
      return publicId.replace(/\.[^/.]+$/, '');
    }

    return publicId;
  } catch (_error) {
    return null;
  }
};

const deleteCloudinaryFile = async ({ publicId, url, resourceType }) => {
  const nextPublicId = publicId || getCloudinaryPublicIdFromUrl(url, resourceType);

  if (!nextPublicId) {
    return;
  }

  await cloudinary.uploader.destroy(nextPublicId, {
    resource_type: resourceType,
  });
};

const deletePdfFile = async (book) => {
  if (!book.filePublicId && !book.fileUrl) {
    return;
  }

  if (isSupabasePdfPath(book.filePublicId)) {
    await deleteObject(book.filePublicId);
    return;
  }

  await deleteCloudinaryFile({
    publicId: book.filePublicId,
    url: book.fileUrl,
    resourceType: 'raw',
  });
};

const shouldDeletePreviousPdf = (existingBook, nextFilePublicId) =>
  nextFilePublicId && existingBook.filePublicId !== nextFilePublicId;

const deleteBookFiles = async (book) => {
  await Promise.all([
    deleteCloudinaryFile({
      publicId: book.coverImagePublicId,
      url: book.coverImage,
      resourceType: 'image',
    }),
    deletePdfFile(book),
  ]);
};

const buildBookData = (payload, uploaded = {}, existingBook) => {
  const data = {};

  const setIfPresent = (field, value) => {
    if (value !== undefined) {
      data[field] = value;
    }
  };

  setIfPresent('title', payload.title);
  setIfPresent('author', payload.author);
  setIfPresent('description', cleanNullableString(payload.description));
  setIfPresent('about', cleanNullableString(payload.about));
  setIfPresent('isbn', cleanNullableString(payload.isbn));
  setIfPresent('coverImage', uploaded.coverImage || cleanNullableString(payload.coverImage));
  setIfPresent('coverImagePublicId', uploaded.coverImagePublicId);
  setIfPresent('fileUrl', uploaded.pdfUrl || cleanNullableString(payload.pdfUrl));
  setIfPresent('filePublicId', uploaded.filePublicId);
  setIfPresent('language', payload.language);
  setIfPresent('publisher', cleanNullableString(payload.publisher));
  setIfPresent('publicationYear', cleanNullableInt(payload.publicationYear));
  setIfPresent('pages', cleanNullableInt(payload.pages));
  setIfPresent('volumeSet', cleanNullableString(payload.volumeSet));
  setIfPresent('volumeNumber', cleanNullableInt(payload.volumeNumber));
  setIfPresent('totalVolumes', cleanNullableInt(payload.totalVolumes));
  setIfPresent('collectionId', cleanNullableString(payload.collectionId));
  setIfPresent('fileSize', uploaded.fileSize || cleanNullableInt(payload.fileSize));
  setIfPresent('isPublished', payload.isPublished);
  setIfPresent('categoryId', payload.categoryId);

  const titleForSlug = payload.title ?? existingBook?.title;
  const volumeNumberForSlug =
    cleanNullableInt(payload.volumeNumber) ?? existingBook?.volumeNumber;
  const generatedSlug = titleForSlug
    ? slugify(
        volumeNumberForSlug
          ? `${titleForSlug} volume ${volumeNumberForSlug}`
          : titleForSlug,
      )
    : undefined;
  const nextSlug = payload.slug || (payload.title || payload.volumeNumber ? generatedSlug : existingBook?.slug);
  setIfPresent('slug', nextSlug || generatedSlug);

  return data;
};

export const getBooks = async ({
  search,
  categoryId,
  categorySlug,
  author,
  language,
  isPublished,
  includeCollectionVolumes,
  page = 1,
  limit = 10,
} = {}) => {
  const currentPage = Number(page) || 1;
  const perPage = Number(limit) || 10;
  const skip = (currentPage - 1) * perPage;
  const includeVolumes = cleanOptionalBoolean(includeCollectionVolumes) === true;
  const where = {
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { author: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { isbn: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(categorySlug ? { category: { is: { slug: categorySlug } } } : {}),
    ...(author ? { author: { contains: author, mode: 'insensitive' } } : {}),
    ...(language ? { language: { equals: language, mode: 'insensitive' } } : {}),
    ...(isPublished !== undefined
      ? { isPublished: cleanOptionalBoolean(isPublished) }
      : {}),
  };

  if (!includeVolumes) {
    const bookWhere = {
      ...where,
      collectionId: null,
    };
    const collectionWhere = {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { author: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              {
                books: {
                  some: {
                    OR: [
                      { title: { contains: search, mode: 'insensitive' } },
                      { author: { contains: search, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
      books: {
        some: {
          ...(categoryId ? { categoryId } : {}),
          ...(categorySlug ? { category: { is: { slug: categorySlug } } } : {}),
          ...(author ? { author: { contains: author, mode: 'insensitive' } } : {}),
          ...(language ? { language: { equals: language, mode: 'insensitive' } } : {}),
          ...(isPublished !== undefined
            ? { isPublished: cleanOptionalBoolean(isPublished) }
            : {}),
        },
      },
    };

    const [standaloneBooks, collections] = await prisma.$transaction([
      prisma.book.findMany({
        where: bookWhere,
        orderBy: { createdAt: 'desc' },
        select: bookSelect,
      }),
      prisma.bookCollection.findMany({
        where: collectionWhere,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          author: true,
          description: true,
          language: true,
          coverImage: true,
          createdAt: true,
          updatedAt: true,
          books: {
            where: {
              ...(categoryId ? { categoryId } : {}),
              ...(categorySlug ? { category: { is: { slug: categorySlug } } } : {}),
              ...(author ? { author: { contains: author, mode: 'insensitive' } } : {}),
              ...(language ? { language: { equals: language, mode: 'insensitive' } } : {}),
              ...(isPublished !== undefined
                ? { isPublished: cleanOptionalBoolean(isPublished) }
                : {}),
            },
            orderBy: [{ volumeNumber: 'asc' }, { title: 'asc' }],
            select: {
              id: true,
              category: { select: { id: true, name: true, slug: true } },
              downloads: true,
              pages: true,
              isPublished: true,
            },
          },
        },
      }),
    ]);

    const normalizedBooks = await Promise.all(standaloneBooks.map(normalizeBook));
    const collectionCards = collections.map((collection) => {
      const firstVolume = collection.books[0];
      return {
        type: 'collection',
        id: collection.id,
        title: collection.title,
        author: collection.author || firstVolume?.author || 'Unknown Author',
        description: collection.description,
        language: collection.language,
        coverImage: collection.coverImage,
        volumesCount: collection.books.length,
        category: firstVolume?.category || null,
        downloads: collection.books.reduce((total, book) => total + (book.downloads || 0), 0),
        pages: collection.books.reduce((total, book) => total + (book.pages || 0), 0),
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      };
    });
    const combined = [...collectionCards, ...normalizedBooks].sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt),
    );
    const total = combined.length;
    const paged = combined.slice(skip, skip + perPage);
    const totalPages = Math.ceil(total / perPage);

    return {
      books: paged,
      pagination: {
        total,
        page: currentPage,
        limit: perPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }

  const [total, books] = await prisma.$transaction([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      select: bookSelect,
    }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return {
    books: await Promise.all(books.map(normalizeBook)),
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
};

export const getLibraryStats = async () => {
  const [books, categories, downloads, authors] = await prisma.$transaction([
    prisma.book.count({ where: { isPublished: true } }),
    prisma.category.count(),
    prisma.book.aggregate({
      where: { isPublished: true },
      _sum: {
        downloads: true,
      },
    }),
    prisma.book.findMany({
      where: { isPublished: true },
      distinct: ['author'],
      select: {
        author: true,
      },
    }),
  ]);

  return {
    books,
    categories,
    authors: authors.length,
    downloads: downloads._sum.downloads ?? 0,
  };
};

export const getBookById = async (id) => {
  const book = await prisma.book.findUnique({
    where: { id },
    select: bookSelect,
  });

  if (!book) {
    throw new AppError('Book not found', 404);
  }

  return normalizeBook(book);
};

export const getBookBySlug = async (slug) => {
  const book = await prisma.book.findUnique({
    where: { slug },
    select: bookSelect,
  });

  if (!book) {
    throw new AppError('Book not found', 404);
  }

  return normalizeBook(book);
};

export const createBook = async (payload, files, uploadedById) => {
  await ensureCategoryExists(payload.categoryId);
  const collection = await ensureCollectionExists(payload.collectionId);

  if (collection && !payload.slug) {
    payload.slug = slugify(
      payload.volumeNumber
        ? `${collection.title} ${payload.title} volume ${payload.volumeNumber}`
        : `${collection.title} ${payload.title}`,
    );
  }

  const data = buildBookData(payload);

  if (!data.slug) {
    throw new AppError('Book slug could not be generated', 400);
  }

  await ensureUniqueBook({
    title: data.title,
    author: data.author,
    slug: data.slug,
    isbn: data.isbn,
    volumeSet: data.volumeSet,
    volumeNumber: data.volumeNumber,
  });
  await ensureUniqueCollectionVolume({
    collectionId: data.collectionId,
    volumeNumber: data.volumeNumber,
  });

  const uploadedCover = files?.coverImage?.[0]
    ? await uploadCoverToCloudinary(files.coverImage[0])
    : {};
  Object.assign(data, buildBookData(payload, uploadedCover));

  const book = await prisma.book.create({
    data: {
      ...data,
      uploadedById,
      processingStatus: files?.pdf?.[0] ? 'PROCESSING' : 'PENDING',
    },
    select: bookSelect,
  });

  if (files?.pdf?.[0]) {
    const uploadedPdf = await uploadPdfToSupabase(files.pdf[0], book.id);
    const pageCount = await getPdfPageCount(files.pdf[0].buffer);
    await prisma.book.update({
      where: { id: book.id },
      data: {
        fileUrl: uploadedPdf.pdfUrl,
        filePublicId: uploadedPdf.filePublicId,
        fileSize: uploadedPdf.fileSize,
        pages: pageCount,
        processingStatus: 'READY',
      },
    });
  }

  const createdBook = await prisma.book.findUnique({
    where: { id: book.id },
    select: bookSelect,
  });

  return normalizeBook(createdBook);
};

export const updateBook = async (id, payload, files) => {
  const existingBook = await prisma.book.findUnique({
    where: { id },
  });

  if (!existingBook) {
    throw new AppError('Book not found', 404);
  }

  if (payload.categoryId && payload.categoryId !== existingBook.categoryId) {
    await ensureCategoryExists(payload.categoryId);
  }

  const nextCollectionId =
    payload.collectionId === undefined ? existingBook.collectionId : payload.collectionId;
  const collection = await ensureCollectionExists(nextCollectionId);

  if (collection && !payload.slug && (payload.title || payload.volumeNumber)) {
    payload.slug = slugify(
      (payload.volumeNumber ?? existingBook.volumeNumber)
        ? `${collection.title} ${payload.title ?? existingBook.title} volume ${
            payload.volumeNumber ?? existingBook.volumeNumber
          }`
        : `${collection.title} ${payload.title ?? existingBook.title}`,
    );
  }

  const data = buildBookData(payload, {}, existingBook);

  await ensureUniqueBook({
    title: data.title ?? existingBook.title,
    author: data.author ?? existingBook.author,
    slug: data.slug ?? existingBook.slug,
    isbn: data.isbn === undefined ? existingBook.isbn : data.isbn,
    volumeSet: data.volumeSet === undefined ? existingBook.volumeSet : data.volumeSet,
    volumeNumber:
      data.volumeNumber === undefined ? existingBook.volumeNumber : data.volumeNumber,
    excludeId: id,
  });
  await ensureUniqueCollectionVolume({
    collectionId: data.collectionId === undefined ? existingBook.collectionId : data.collectionId,
    volumeNumber:
      data.volumeNumber === undefined ? existingBook.volumeNumber : data.volumeNumber,
    excludeId: id,
  });

  const uploadedCover = files?.coverImage?.[0]
    ? await uploadCoverToCloudinary(files.coverImage[0])
    : {};
  const uploadedPdf = files?.pdf?.[0]
    ? await uploadPdfToSupabase(files.pdf[0], id)
    : {};
  Object.assign(data, buildBookData(payload, { ...uploadedCover, ...uploadedPdf }, existingBook));

  if (files?.pdf?.[0]) {
    data.pages = await getPdfPageCount(files.pdf[0].buffer);
    data.processingStatus = 'READY';
  }

  const book = await prisma.book.update({
    where: { id },
    data,
    select: bookSelect,
  });

  await Promise.all([
    data.coverImagePublicId
      ? deleteCloudinaryFile({
          publicId: existingBook.coverImagePublicId,
          url: existingBook.coverImage,
          resourceType: 'image',
        })
      : undefined,
    data.filePublicId
      ? shouldDeletePreviousPdf(existingBook, data.filePublicId)
        ? deletePdfFile(existingBook)
        : undefined
      : undefined,
  ]);

  const updatedBook = await prisma.book.findUnique({
    where: { id },
    select: bookSelect,
  });

  return normalizeBook(updatedBook);
};

export const deleteBook = async (id) => {
  const book = await prisma.book.findUnique({
    where: { id },
  });

  if (!book) {
    throw new AppError('Book not found', 404);
  }

  await prisma.book.delete({
    where: { id },
  });

  await deleteBookFiles(book);
};

export const getBookPdfSource = async (id) => {
  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      filePublicId: true,
      fileSize: true,
      isPublished: true,
    },
  });

  if (!book) {
    throw new AppError('Book not found', 404);
  }

  if (!book.isPublished) {
    throw new AppError('You are not authorized to read this book', 403);
  }

  if (!book.filePublicId && !book.fileUrl) {
    throw new AppError('No readable PDF is available for this book yet', 404);
  }

  const isStoredPdf = isSupabasePdfPath(book.filePublicId);

  return {
    id: book.id,
    title: book.title,
    fileSize: book.fileSize,
    storagePath: isStoredPdf ? book.filePublicId : null,
    externalUrl: isStoredPdf ? null : book.fileUrl,
  };
};

export const registerBookDownload = async (id) => {
  const existingBook = await prisma.book.findUnique({
    where: { id },
    select: { id: true, fileUrl: true, filePublicId: true },
  });

  if (!existingBook) {
    throw new AppError('Book not found', 404);
  }

  if (!existingBook.fileUrl && !existingBook.filePublicId) {
    throw new AppError('PDF file is not available for this book', 404);
  }

  const book = await prisma.book.update({
    where: { id },
    data: {
      downloads: {
        increment: 1,
      },
    },
    select: bookSelect,
  });

  return normalizeBook(book);
};
