# UMKM Mojo

Website pendataan UMKM per dusun, dibangun dengan Next.js, Prisma, dan PostgreSQL.

## Menjalankan di Lokal

1. Install dependencies:
   ```bash
   npm install
   ```

2. Siapkan database PostgreSQL (gratis via [Neon](https://neon.tech), [Supabase](https://supabase.com), atau [Vercel Postgres](https://vercel.com/storage/postgres)).

3. Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL` dengan connection string database kamu:
   ```bash
   cp .env.example .env
   ```

4. Buat tabel di database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. (Opsional) Isi data awal dusun:
   ```bash
   npx prisma db seed
   ```

6. Jalankan server development:
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000). Halaman admin ada di `/admin` (login default: `admin` / `admin123`, bisa diganti lewat `ADMIN_USER` / `ADMIN_PASS` di `.env`).

## Deploy ke Vercel

1. Push project ini ke repository GitHub kamu.
2. Buka [vercel.com/new](https://vercel.com/new), import repository tersebut.
3. Di step konfigurasi, buka **Environment Variables**, tambahkan:
   - `DATABASE_URL` — connection string PostgreSQL production kamu
   - `ADMIN_USER` — username login admin
   - `ADMIN_PASS` — password login admin
4. Klik **Deploy**.
5. Setelah deploy pertama selesai, jalankan migrasi database ke production sekali dari komputer kamu (arahkan `DATABASE_URL` di `.env` lokal ke database production, lalu jalankan):
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
   Setelah itu, setiap kali ada perubahan skema (`prisma/schema.prisma`), jalankan `npx prisma migrate dev --name <nama_perubahan>` secara lokal, commit folder `prisma/migrations` yang baru, push, lalu jalankan `npx prisma migrate deploy` ke database production.

## Tech Stack

- [Next.js](https://nextjs.org)
- [Prisma ORM](https://www.prisma.io) + PostgreSQL
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
