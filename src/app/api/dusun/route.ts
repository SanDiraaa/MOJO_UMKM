import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const dusuns = await prisma.dusun.findMany({
      include: {
        _count: {
          select: { umkms: true }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    });
    return NextResponse.json(dusuns);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data dusun" }, { status: 500 });
  }
}
