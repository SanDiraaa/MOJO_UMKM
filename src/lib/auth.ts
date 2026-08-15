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

// --- Proteksi brute-force login ---
export const LOGIN_ATTEMPTS_COOKIE_NAME = "login_attempts";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 menit

interface LoginAttemptState {
  count: number;
  windowStart: number;
}

/**
 * Membuat nilai cookie percobaan login yang ditandatangani (supaya tidak bisa
 * diubah/reset paksa oleh pengguna dari sisi browser).
 */
export function createAttemptsToken(state: LoginAttemptState): string {
  const payload = `${state.count}.${state.windowStart}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

/**
 * Membaca & memverifikasi state percobaan login dari cookie. Kalau tidak ada,
 * tidak valid, atau sudah lewat jendela waktu 15 menit, mulai hitungan baru dari 0.
 */
export function readAttemptsState(token: string | undefined | null): LoginAttemptState {
  const fresh: LoginAttemptState = { count: 0, windowStart: Date.now() };
  if (!token) return fresh;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 3) return fresh;
    const [countStr, windowStartStr, signature] = parts;
    const payload = `${countStr}.${windowStartStr}`;
    const expectedSignature = sign(payload);

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length) return fresh;
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return fresh;

    const count = Number(countStr);
    const windowStart = Number(windowStartStr);
    if (!windowStart || Date.now() - windowStart > LOCKOUT_WINDOW_MS) return fresh;

    return { count, windowStart };
  } catch {
    return fresh;
  }
}

export function isLockedOut(state: LoginAttemptState): boolean {
  return state.count >= MAX_LOGIN_ATTEMPTS && Date.now() - state.windowStart <= LOCKOUT_WINDOW_MS;
}

export function getLockoutMinutesLeft(state: LoginAttemptState): number {
  const msLeft = LOCKOUT_WINDOW_MS - (Date.now() - state.windowStart);
  return Math.max(1, Math.ceil(msLeft / 60000));
}

export const LOGIN_ATTEMPTS_MAX_AGE_SECONDS = Math.ceil(LOCKOUT_WINDOW_MS / 1000);

/**
 * Helper untuk dipakai di dalam API Route Handler (server-side) guna mengecek
 * apakah request datang dari admin yang sudah login. Return true/false.
 */
export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
