import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isAdminRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const umkmId = searchParams.get("umkmId") || "";

  const isAdmin = await isAdminRequest();

  if (!umkmId && !isAdmin) {
    return NextResponse.json({ error: "umkmId wajib diisi" }, { status: 400 });
  }

  try {
    // Admin tanpa umkmId -> tampilkan SEMUA ulasan (untuk keperluan moderasi)
    if (!umkmId && isAdmin) {
      const allUlasan = await prisma.ulasan.findMany({
        include: { umkm: { select: { id: true, nama: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ data: allUlasan });
    }

    const ulasan = await prisma.ulasan.findMany({
      where: {
        umkmId,
        ...(!isAdmin && { status: "APPROVED" }),
      },
      orderBy: { createdAt: "desc" },
    });

    const approved = ulasan.filter((u: any) => u.status === "APPROVED");
    const avgRating = approved.length > 0 ? approved.reduce((sum: number, u: any) => sum + u.rating, 0) / approved.length : 0;

    return NextResponse.json({
      data: ulasan,
      avgRating: Math.round(avgRating * 10) / 10,
      totalApproved: approved.length,
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil ulasan" }, { status: 500 });
  }
}

// Batas waktu minimum (ms) antara halaman dimuat dan form disubmit, untuk cegah bot spam.
const MIN_SUBMIT_TIME_MS = 2000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { umkmId, nama, rating, teks, foto, website, formLoadedAt } = body;

    // --- Proteksi anti-spam sederhana (honeypot + time-trap), sama seperti form daftar UMKM ---
    if (website) {
      return NextResponse.json({ error: "Gagal mengirim ulasan" }, { status: 400 });
    }
    if (!formLoadedAt || Date.now() - Number(formLoadedAt) < MIN_SUBMIT_TIME_MS) {
      return NextResponse.json({ error: "Gagal mengirim ulasan" }, { status: 400 });
    }

    if (!umkmId || !nama?.trim() || !teks?.trim()) {
      return NextResponse.json({ error: "Nama dan ulasan wajib diisi" }, { status: 400 });
    }
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating wajib dipilih (1-5)" }, { status: 400 });
    }

    const newUlasan = await prisma.ulasan.create({
      data: {
        umkmId,
        nama: nama.trim(),
        rating: ratingNum,
        teks: teks.trim(),
        foto: foto || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(newUlasan, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengirim ulasan" }, { status: 500 });
  }
}
