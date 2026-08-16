import prisma from '../config/db.js';
import AppError from '../utils/appError.js';
import slugify from '../utils/slugify.js';

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  icon: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      books: true,
    },
  },
};

const normalizeCategory = (category) => ({
  ...category,
  booksCount: category._count?.books ?? 0,
  _count: undefined,
});

const ensureUniqueCategory = async ({ name, slug, excludeId }) => {
  const duplicate = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
      NOT: excludeId ? { id: excludeId } : undefined,
    },
  });

  if (!duplicate) {
    return;
  }

  if (duplicate.name.toLowerCase() === name.toLowerCase()) {
    throw new AppError('Category name already exists', 409);
  }

  throw new AppError('Category slug already exists', 409);
};

export const getCategories = async ({ search } = {}) => {
  const categories = await prisma.category.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { name: 'asc' },
    select: categorySelect,
  });

  return categories.map(normalizeCategory);
};

export const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    select: categorySelect,
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return normalizeCategory(category);
};

export const getCategoryBySlug = async (slug) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: categorySelect,
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return normalizeCategory(category);
};

export const createCategory = async ({ name, slug, description, icon }) => {
  const nextSlug = slug || slugify(name);

  if (!nextSlug) {
    throw new AppError('Category slug could not be generated', 400);
  }

  await ensureUniqueCategory({ name, slug: nextSlug });

  const category = await prisma.category.create({
    data: {
      name,
      slug: nextSlug,
      description: description || null,
      icon: icon || null,
    },
    select: categorySelect,
  });

  return normalizeCategory(category);
};

export const updateCategory = async (id, payload) => {
  const { name, slug, description, icon } = payload;
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  const nextName = name ?? existingCategory.name;
  const nextSlug = slug || (name ? slugify(name) : existingCategory.slug);

  await ensureUniqueCategory({
    name: nextName,
    slug: nextSlug,
    excludeId: id,
  });

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: nextName,
      slug: nextSlug,
      description:
        Object.prototype.hasOwnProperty.call(payload, 'description')
          ? description || null
          : existingCategory.description,
      icon:
        Object.prototype.hasOwnProperty.call(payload, 'icon')
          ? icon || null
          : existingCategory.icon,
    },
    select: categorySelect,
  });

  return normalizeCategory(category);
};

export const deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          books: true,
        },
      },
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  if (category._count.books > 0) {
    throw new AppError('Cannot delete a category that contains books', 400);
  }

  await prisma.category.delete({
    where: { id },
  });
};
