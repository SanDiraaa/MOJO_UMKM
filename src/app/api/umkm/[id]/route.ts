import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const umkm = await prisma.umkm.findUnique({
      where: { id },
      include: {
        dusun: true,
        fotoProduk: true,
      },
    });

    if (!umkm) {
      return NextResponse.json({ error: "UMKM tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(umkm);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil detail UMKM" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nama, pemilik, kategori, deskripsi, alamat, mapsUrl, jamOperasional, whatsapp, fotoUtama, dusunId } = body;

    if (!nama?.trim() || !pemilik?.trim() || !kategori || !dusunId) {
      return NextResponse.json(
        { error: "Nama, pemilik, kategori, dan dusun wajib diisi" },
        { status: 400 }
      );
    }

    const updated = await prisma.umkm.update({
      where: { id },
      data: {
        nama: nama.trim(),
        pemilik: pemilik.trim(),
        kategori,
        dusunId,
        ...(deskripsi !== undefined && { deskripsi }),
        ...(alamat !== undefined && { alamat }),
        ...(mapsUrl !== undefined && { mapsUrl: mapsUrl?.trim() || null }),
        ...(jamOperasional !== undefined && { jamOperasional }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(fotoUtama !== undefined && { fotoUtama }),
      },
      include: { dusun: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengubah data UMKM" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.umkm.delete({
      where: { id },
    });
    return NextResponse.json({ message: "UMKM berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus UMKM" }, { status: 500 });
  }
}
