import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
  LOGIN_ATTEMPTS_COOKIE_NAME,
  LOGIN_ATTEMPTS_MAX_AGE_SECONDS,
  readAttemptsState,
  createAttemptsToken,
  isLockedOut,
  getLockoutMinutesLeft,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const attemptsToken = cookieStore.get(LOGIN_ATTEMPTS_COOKIE_NAME)?.value;
    const attemptsState = readAttemptsState(attemptsToken);

    if (isLockedOut(attemptsState)) {
      const minutesLeft = getLockoutMinutesLeft(attemptsState);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${minutesLeft} menit.` },
        { status: 429 }
      );
    }

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
      const token = createSessionToken(username);
      const response = NextResponse.json({ success: true });
      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_COOKIE_MAX_AGE,
      });
      // Login berhasil -> reset hitungan percobaan gagal.
      response.cookies.set(LOGIN_ATTEMPTS_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    // Login gagal -> tambah hitungan percobaan.
    const newState = { count: attemptsState.count + 1, windowStart: attemptsState.windowStart };
    const remaining = Math.max(0, 5 - newState.count);
    const response = NextResponse.json(
      {
        error:
          remaining > 0
            ? `Username atau password salah. Sisa ${remaining} percobaan sebelum akun dikunci sementara.`
            : "Username atau password salah. Percobaan login dikunci sementara selama 15 menit.",
      },
      { status: 401 }
    );
    response.cookies.set(LOGIN_ATTEMPTS_COOKIE_NAME, createAttemptsToken(newState), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: LOGIN_ATTEMPTS_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
