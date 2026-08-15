-- CreateEnum
CREATE TYPE "UmkmStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Umkm" ADD COLUMN     "status" "UmkmStatus" NOT NULL DEFAULT 'APPROVED';
