import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const kategori = searchParams.get("kategori") || "Semua";
  const dusunId = searchParams.get("dusunId") || "";

  try {
    const umkms = await prisma.umkm.findMany({
      where: {
        nama: { contains: search, mode: "insensitive" },
        ...(kategori !== "Semua" && { kategori }),
        ...(dusunId && { dusunId }),
      },
      include: {
        dusun: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(umkms);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data UMKM" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, pemilik, kategori, deskripsi, alamat, mapsUrl, jamOperasional, whatsapp, fotoUtama, dusunId, fotoProduk } = body;

    const newUmkm = await prisma.umkm.create({
      data: {
        nama,
        pemilik,
        kategori,
        deskripsi,
        alamat,
        mapsUrl,
        jamOperasional,
        whatsapp,
        fotoUtama,
        dusunId,
        fotoProduk: {
          create: fotoProduk?.map((url: string) => ({ url })) || [],
        },
      },
    });

    return NextResponse.json(newUmkm, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menyimpan data UMKM" }, { status: 500 });
  }
}
