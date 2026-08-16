import prisma from '../config/db.js';

export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalCategories,
    totalBooks,
    publishedBooks,
    unpublishedBooks,
    downloads,
    recentBooks,
    popularBooks,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.category.count(),
    prisma.book.count(),
    prisma.book.count({ where: { isPublished: true } }),
    prisma.book.count({ where: { isPublished: false } }),
    prisma.book.aggregate({
      _sum: {
        downloads: true,
      },
    }),
    prisma.book.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        author: true,
        coverImage: true,
        downloads: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.book.findMany({
      take: 5,
      orderBy: { downloads: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        author: true,
        coverImage: true,
        downloads: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  return {
    totals: {
      users: totalUsers,
      categories: totalCategories,
      books: totalBooks,
      publishedBooks,
      unpublishedBooks,
      downloads: downloads._sum.downloads ?? 0,
    },
    recentBooks,
    popularBooks,
  };
};
