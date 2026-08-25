import type { Metadata } from "next";
import { Poppins, Bitter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const bitter = Bitter({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-bitter",
});

export const metadata: Metadata = {
  title: "UMKM Mojolebak - Jelajahi Potensi Lokal Desa Mojolebak",
  description: "Platform direktori dan pendaftaran UMKM Desa Mojolebak, Kecamatan Jetis, Kabupaten Mojokerto. Temukan berbagai produk makanan, minuman, kerajinan, dan jasa dari warga desa kami.",
  openGraph: {
    title: "UMKM Mojolebak",
    description: "Jelajahi berbagai potensi dan produk unggulan dari UMKM Desa Mojolebak.",
    url: "https://mojo-umkm.vercel.app",
    siteName: "UMKM Mojolebak",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${poppins.variable} ${bitter.variable} font-sans antialiased bg-secondary/20 min-h-screen flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
