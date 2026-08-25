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
5. **Setup upload foto (WAJIB agar foto UMKM tersimpan permanen):**
   - Buka project kamu di dashboard Vercel > tab **Storage** > **Create Database** > pilih **Blob**.
   - Ikuti langkah pembuatan, lalu hubungkan (connect) Blob Storage itu ke project kamu.
   - Vercel otomatis menambahkan environment variable `BLOB_READ_WRITE_TOKEN` ke project — tidak perlu isi manual.
   - Redeploy project (Deployments > titik tiga > Redeploy) supaya environment variable baru terbaca.
6. Setelah deploy pertama selesai, jalankan migrasi database ke production sekali dari komputer kamu (arahkan `DATABASE_URL` di `.env` lokal ke database production, lalu jalankan):
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```
   Setelah itu, setiap kali ada perubahan skema (`prisma/schema.prisma`), jalankan `npx prisma migrate dev --name <nama_perubahan>` secara lokal, commit folder `prisma/migrations` yang baru, push, lalu jalankan `npx prisma migrate deploy` ke database production.

## Deploy ke Hostinger (paket dengan dukungan Node.js App)

Project ini juga bisa dijalankan di Hostinger, selama paketmu punya fitur **Node.js App** di hPanel (cek di Advanced > Node.js).

**Penting:** database TETAP disarankan pakai PostgreSQL eksternal (Neon/Supabase/dsb) seperti sebelumnya — bukan MySQL bawaan Hostinger — supaya tidak perlu ubah skema Prisma. Hostinger di sini hanya menjalankan proses Next.js-nya saja.

1. **Buat Node.js App di hPanel**
   - Buka hPanel > Website (pilih domainmu) > Advanced > Node.js > Create Application.
   - Pilih versi Node.js terbaru yang tersedia (minimal Node 20).
   - Application root: folder tempat kode akan diletakkan (misal `mojolebak-app`).
   - Application URL: pilih domain `.site` kamu.
   - Application startup file: isi `server.js`.

2. **Upload kode ke server**
   - Cara termudah: hubungkan lewat Git langsung dari GitHub (hPanel > Advanced > Git, isi URL repo GitHub kamu) supaya sinkron tinggal `git pull` tiap update.
   - Alternatif: zip project ini (tanpa `node_modules`, `.next`, `.env`), upload lewat File Manager, lalu extract ke Application root.

3. **Set Environment Variables**
   Di halaman pengaturan Node.js App tadi, biasanya ada bagian "Environment Variables". Tambahkan:
   - `DATABASE_URL` — connection string PostgreSQL kamu (boleh sama dengan yang dipakai di Vercel)
   - `ADMIN_USER`, `ADMIN_PASS`, `SESSION_SECRET`
   - `NODE_ENV` = `production`
   - **Jangan** isi `BLOB_READ_WRITE_TOKEN` — biar upload foto otomatis pakai penyimpanan lokal (`public/uploads`), yang di Hostinger AMAN dipakai karena servernya menyala terus-menerus (beda dengan Vercel yang serverless/sementara).

4. **Install & build lewat terminal SSH**
   Buka SSH (hPanel > Advanced > SSH Access) atau tombol "Run NPM Install" kalau tersedia di panel Node.js App, lalu jalankan di folder Application root:
   ```bash
   npm install
   npm run build
   ```
   **Wajib dijalankan langsung di server Hostinger** (bukan di komputer kamu lalu di-upload), supaya Prisma men-generate binary yang cocok dengan sistem operasi server.

5. **Jalankan migrasi database (kalau database belum pernah di-migrate)**
   Kalau `DATABASE_URL` sama dengan yang sudah dipakai di Vercel, lewati langkah ini (tabel sudah ada). Kalau database baru:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

6. **Start aplikasi**
   Di hPanel Node.js App, klik **Restart** (atau ubah startup command jadi `node server.js` kalau diminta). Setelah aktif, akses domain `.site` kamu untuk cek.

## Tech Stack

- [Next.js](https://nextjs.org)
- [Prisma ORM](https://www.prisma.io) + PostgreSQL
- [Vercel Blob](https://vercel.com/storage/blob) — penyimpanan foto UMKM
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
