import cloudinary from '../config/cloudinary.js';
import prisma from '../config/db.js';
import AppError from '../utils/appError.js';

const collectionSelect = {
  id: true,
  title: true,
  author: true,
  description: true,
  about: true,
  language: true,
  coverImage: true,
  coverImagePublicId: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      books: true,
    },
  },
};

const volumeSelect = {
  id: true,
  title: true,
  slug: true,
  author: true,
  description: true,
  coverImage: true,
  language: true,
  pages: true,
  volumeNumber: true,
  fileSize: true,
  downloads: true,
  isPublished: true,
  processingStatus: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

const normalizeCollection = (collection) => ({
  ...collection,
  volumesCount: collection._count?.books ?? collection.volumes?.length ?? 0,
  coverImagePublicId: undefined,
  _count: undefined,
});

const uploadCollectionCover = (file) =>
  new Promise((resolve, reject) => {
    if (!file)
    {
      resolve({});
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'al-ilm-library/collections/covers',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error)
        {
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

const deleteCollectionCover = async (publicId) => {
  if (publicId)
  {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  }
};

export const getCollections = async ({ search, includeUnpublished = false } = {}) => {
  const collections = await prisma.bookCollection.findMany({
    where: {
      ...(search
        ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { author: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            {
              books: {
                some: {
                  title: { contains: search, mode: 'insensitive' },
                },
              },
            },
          ],
        }
        : {}),
      ...(includeUnpublished
        ? {}
        : {
          books: {
            some: {
              isPublished: true,
            },
          },
        }),
    },
    orderBy: { title: 'asc' },
    select: collectionSelect,
  });

  return collections.map(normalizeCollection);
};

export const getCollectionById = async (id, { includeUnpublished = false } = {}) => {
  const collection = await prisma.bookCollection.findUnique({
    where: { id },
    select: {
      ...collectionSelect,
      books: {
        where: includeUnpublished ? undefined : { isPublished: true },
        orderBy: [{ volumeNumber: 'asc' }, { title: 'asc' }],
        select: volumeSelect,
      },
    },
  });

  if (!collection)
  {
    throw new AppError('Collection not found', 404);
  }

  const volumes = collection.books.map((book) => ({
    ...book,
    pageCount: book.pages,
    coverImage: book.coverImage || collection.coverImage,
  }));

  return normalizeCollection({
    ...collection,
    books: undefined,
    volumes,
  });
};

export const getCollectionBooks = async (id, options) => {
  const collection = await getCollectionById(id, options);
  return collection.volumes;
};

export const createCollection = async (payload, files) => {
  const uploadedCover = await uploadCollectionCover(files?.coverImage?.[0]);
  const collection = await prisma.bookCollection.create({
    data: {
      title: payload.title,
      author: payload.author || null,
      description: payload.description || null,
      about: payload.about || null,
      language: payload.language || null,
      coverImage: uploadedCover.coverImage || payload.coverImage || null,
      coverImagePublicId: uploadedCover.coverImagePublicId || null,
    },
    select: collectionSelect,
  });

  return normalizeCollection(collection);
};

export const updateCollection = async (id, payload, files) => {
  const existing = await prisma.bookCollection.findUnique({ where: { id } });

  if (!existing)
  {
    throw new AppError('Collection not found', 404);
  }

  const uploadedCover = await uploadCollectionCover(files?.coverImage?.[0]);
  const collection = await prisma.bookCollection.update({
    where: { id },
    data: {
      title: payload.title ?? existing.title,
      author:
        Object.prototype.hasOwnProperty.call(payload, 'author')
          ? payload.author || null
          : existing.author,
      description:
        Object.prototype.hasOwnProperty.call(payload, 'description')
          ? payload.description || null
          : existing.description,
      about:
        Object.prototype.hasOwnProperty.call(payload, 'about')
          ? payload.about || null
          : existing.about,
      language:
        Object.prototype.hasOwnProperty.call(payload, 'language')
          ? payload.language || null
          : existing.language,
      coverImage: uploadedCover.coverImage || payload.coverImage || existing.coverImage,
      coverImagePublicId: uploadedCover.coverImagePublicId || existing.coverImagePublicId,
    },
    select: collectionSelect,
  });

  if (uploadedCover.coverImagePublicId)
  {
    await deleteCollectionCover(existing.coverImagePublicId);
  }

  return normalizeCollection(collection);
};

export const deleteCollection = async (id) => {
  const existing = await prisma.bookCollection.findUnique({ where: { id } });

  if (!existing)
  {
    throw new AppError('Collection not found', 404);
  }

  await prisma.book.updateMany({
    where: { collectionId: id },
    data: { collectionId: null },
  });
  await prisma.bookCollection.delete({ where: { id } });
  await deleteCollectionCover(existing.coverImagePublicId);
};
