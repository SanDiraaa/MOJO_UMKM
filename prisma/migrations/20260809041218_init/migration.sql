-- CreateTable
CREATE TABLE "Dusun" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Dusun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Umkm" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "pemilik" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "mapsUrl" TEXT,
    "jamOperasional" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "fotoUtama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dusunId" TEXT NOT NULL,

    CONSTRAINT "Umkm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoProduk" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "umkmId" TEXT NOT NULL,

    CONSTRAINT "FotoProduk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Umkm" ADD CONSTRAINT "Umkm_dusunId_fkey" FOREIGN KEY ("dusunId") REFERENCES "Dusun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoProduk" ADD CONSTRAINT "FotoProduk_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "Umkm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
