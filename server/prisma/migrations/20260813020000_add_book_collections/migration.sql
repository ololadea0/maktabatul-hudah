CREATE TABLE "BookCollection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "description" TEXT,
    "language" TEXT,
    "coverImage" TEXT,
    "coverImagePublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookCollection_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Book" ADD COLUMN "collectionId" TEXT;

CREATE INDEX "BookCollection_title_idx" ON "BookCollection"("title");
CREATE INDEX "BookCollection_author_idx" ON "BookCollection"("author");
CREATE INDEX "Book_collectionId_idx" ON "Book"("collectionId");
CREATE UNIQUE INDEX "Book_collectionId_volumeNumber_key" ON "Book"("collectionId", "volumeNumber");

ALTER TABLE "Book" ADD CONSTRAINT "Book_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "BookCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
