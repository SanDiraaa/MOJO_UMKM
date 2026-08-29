import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isAdminRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const kategori = searchParams.get("kategori") || "Semua";
  const dusunId = searchParams.get("dusunId") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 12));

  const isAdmin = await isAdminRequest();

  const where = {
    nama: { contains: search, mode: "insensitive" as const },
    ...(kategori !== "Semua" && { kategori }),
    ...(dusunId && { dusunId }),
    // Pengunjung publik hanya melihat UMKM yang sudah disetujui admin.
    // Admin yang sudah login bisa melihat semua status (termasuk yang masih menunggu).
    ...(!isAdmin && { status: "APPROVED" as const }),
  };

  try {
    const [umkms, total] = await Promise.all([
      prisma.umkm.findMany({
        where,
        include: {
          dusun: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.umkm.count({ where }),
    ]);

    // Hitung rata-rata rating & jumlah ulasan (yang sudah disetujui) untuk tiap UMKM di halaman ini
    const umkmIds = umkms.map((u: any) => u.id);
    const ratingGroups = umkmIds.length
      ? await prisma.ulasan.groupBy({
          by: ["umkmId"],
          where: { umkmId: { in: umkmIds }, status: "APPROVED" },
          _avg: { rating: true },
          _count: { rating: true },
        })
      : [];
    const ratingMap = new Map<string, { avgRating: number; reviewCount: number }>(
      ratingGroups.map((g: any) => [g.umkmId, { avgRating: g._avg.rating || 0, reviewCount: g._count.rating }])
    );

    const umkmsWithRating = umkms.map((u: any) => ({
      ...u,
      avgRating: Math.round((ratingMap.get(u.id)?.avgRating || 0) * 10) / 10,
      reviewCount: ratingMap.get(u.id)?.reviewCount || 0,
    }));

    return NextResponse.json({
      data: umkmsWithRating,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data UMKM" }, { status: 500 });
  }
}

// Batas waktu minimum (ms) antara halaman form dimuat dan disubmit.
// Bot biasanya submit dalam hitungan milidetik, manusia butuh waktu untuk mengisi form.
const MIN_SUBMIT_TIME_MS = 3000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, pemilik, kategori, deskripsi, alamat, mapsUrl, jamOperasional, whatsapp, fotoUtama, dusunId, fotoProduk, website, formLoadedAt } = body;

    // --- Proteksi anti-spam sederhana (honeypot + time-trap) ---
    // 1. Honeypot: field "website" seharusnya selalu kosong untuk manusia (disembunyikan dari tampilan).
    //    Bot yang otomatis mengisi semua field biasanya ikut mengisi field ini.
    if (website) {
      return NextResponse.json({ error: "Gagal menyimpan data UMKM" }, { status: 400 });
    }
    // 2. Time-trap: kalau form disubmit terlalu cepat dari waktu halaman dimuat, kemungkinan besar bot.
    if (!formLoadedAt || Date.now() - Number(formLoadedAt) < MIN_SUBMIT_TIME_MS) {
      return NextResponse.json({ error: "Gagal menyimpan data UMKM" }, { status: 400 });
    }

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
        status: "PENDING",
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
