import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 jam

function getSecret(): string {
  // Sebaiknya set SESSION_SECRET di environment variable.
  // Kalau tidak di-set, fallback pakai ADMIN_PASS supaya tetap aman & tidak menambah langkah setup wajib.
  return process.env.SESSION_SECRET || process.env.ADMIN_PASS || "umkm-mojo-fallback-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/**
 * Membuat nilai token sesi yang ditandatangani (signed), berisi username & waktu kedaluwarsa.
 */
export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${username}.${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

/**
 * Memverifikasi token sesi: cek tanda tangan valid & belum kedaluwarsa.
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 3) return false;
    const [username, expiresAtStr, signature] = parts;
    const payload = `${username}.${expiresAtStr}`;
    const expectedSignature = sign(payload);

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length) return false;
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false;

    const expiresAt = Number(expiresAtStr);
    if (!expiresAt || Date.now() > expiresAt) return false;

    return true;
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;

/**
 * Helper untuk dipakai di dalam API Route Handler (server-side) guna mengecek
 * apakah request datang dari admin yang sudah login. Return true/false.
 */
export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
