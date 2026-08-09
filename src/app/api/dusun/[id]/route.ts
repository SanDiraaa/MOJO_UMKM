import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isAdminRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Tidak diizinkan. Silakan login sebagai admin." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const nama = typeof body.nama === "string" ? body.nama.trim() : "";

    if (!nama) {
      return NextResponse.json(
        { error: "Nama dusun tidak boleh kosong" },
        { status: 400 }
      );
    }

    const dusun = await prisma.dusun.update({
      where: { id },
      data: { nama },
    });

    return NextResponse.json(dusun);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengubah nama dusun" },
      { status: 500 }
    );
  }
}
