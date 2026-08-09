import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const adminUser = process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASS;

    if (!adminUser || !adminPass) {
      return NextResponse.json(
        { error: "ADMIN_USER / ADMIN_PASS belum di-set di environment variable" },
        { status: 500 }
      );
    }

    if (username === adminUser && password === adminPass) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
