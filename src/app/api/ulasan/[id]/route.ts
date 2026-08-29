import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isAdminRequest } from "@/lib/auth";

const prisma = new PrismaClient();

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Tidak diizinkan. Silakan login sebagai admin." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const updated = await prisma.ulasan.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengubah status ulasan" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Tidak diizinkan. Silakan login sebagai admin." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.ulasan.delete({ where: { id } });
    return NextResponse.json({ message: "Ulasan berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus ulasan" }, { status: 500 });
  }
}
