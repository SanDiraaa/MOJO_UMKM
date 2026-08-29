/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // Optimasi gambar otomatis dimatikan supaya gambar tetap tampil normal
    // baik di Vercel maupun di hosting custom seperti Hostinger (yang mungkin
    // tidak punya library "sharp" untuk optimasi gambar server-side).
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

module.exports = nextConfig;
