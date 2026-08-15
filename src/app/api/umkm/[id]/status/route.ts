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

    const updated = await prisma.umkm.update({
      where: { id },
      data: { status },
      include: { dusun: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengubah status UMKM" }, { status: 500 });
  }
}
