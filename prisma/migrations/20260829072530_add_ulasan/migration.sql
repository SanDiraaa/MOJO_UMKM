-- CreateEnum
CREATE TYPE "UlasanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Ulasan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "teks" TEXT NOT NULL,
    "foto" TEXT,
    "status" "UlasanStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "umkmId" TEXT NOT NULL,

    CONSTRAINT "Ulasan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ulasan" ADD CONSTRAINT "Ulasan_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "Umkm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
