import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { ArrowRight, Store, Map as MapIcon, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSearch from "@/components/HeroSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const prisma = new PrismaClient();

// Supaya statistik & daftar dusun di Beranda selalu ambil data terbaru dari database
// (bukan versi ter-cache), bukan cuma saat build/deploy pertama kali.
export const dynamic = "force-dynamic";

async function getStats() {
  const [totalDusun, totalUmkm] = await Promise.all([
    prisma.dusun.count(),
    prisma.umkm.count({ where: { status: "APPROVED" } }),
  ]);
  return { totalDusun, totalUmkm };
}

async function getDusuns() {
  return await prisma.dusun.findMany({
    include: {
      _count: {
        select: { umkms: { where: { status: "APPROVED" } } }
      },
      umkms: {
        where: { status: "APPROVED" },
        select: { id: true, nama: true, fotoUtama: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: {
      nama: 'asc'
    }
  });
}

export default async function Home() {
  const { totalDusun, totalUmkm } = await getStats();
  const dusuns = await getDusuns();

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pt-24 pb-32">
          {/* Ilustrasi gapura & ladang tebu \u2014 signature visual desa Mojolebak */}
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
            <svg
              viewBox="0 0 1200 500"
              preserveAspectRatio="xMidYMax slice"
              className="absolute inset-0 w-full h-full"
            >
              {/* Siluet gapura besar, tersamar di belakang teks */}
              <path
                d="M 470 500 L 470 210 Q 470 110 600 90 Q 730 110 730 210 L 730 500"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="26"
                opacity="0.06"
              />
              {/* Baris tebu di kaki halaman */}
              {Array.from({ length: 34 }).map((_, i) => {
                const x = 10 + i * 36;
                const h = 60 + (i % 5) * 14;
                const gold = i % 3 === 0;
                return (
                  <g key={i} opacity="0.10">
                    <line x1={x} y1={500} x2={x} y2={500 - h} stroke={gold ? "hsl(var(--accent))" : "hsl(var(--primary))"} strokeWidth="5" strokeLinecap="round" />
                    <path d={`M ${x} ${500 - h} q -10 -14 -18 -26`} stroke={gold ? "hsl(var(--accent))" : "hsl(var(--primary))"} strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d={`M ${x} ${500 - h} q 10 -14 18 -26`} stroke={gold ? "hsl(var(--accent))" : "hsl(var(--primary))"} strokeWidth="4" fill="none" strokeLinecap="round" />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-primary font-medium text-sm mb-8 shadow-sm">
                <Store className="w-4 h-4" />
                <span>Pusat Informasi UMKM</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-foreground mb-6 leading-tight">
                Dukung Produk Lokal <br/>
                <span className="text-primary">
                  Majukan Ekonomi Desa
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                Platform resmi untuk menjelajahi, menemukan, dan mendukung berbagai produk unggulan dari Usaha Mikro Kecil dan Menengah di desa kita.
              </p>

              <HeroSearch />
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild className="rounded-full w-full sm:w-auto px-8 h-14 text-lg shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                  <a href="#dusun">
                    Jelajahi UMKM <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild className="rounded-full w-full sm:w-auto px-8 h-14 text-lg border-2 hover:bg-secondary transition-all">
                  <Link href="/daftar">
                    Daftarkan Usaha Anda
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-6 max-w-lg mx-auto mt-16 pt-12 border-t">
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/20 text-accent-foreground mb-3">
                    <MapIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">{totalDusun}</h3>
                  <p className="text-muted-foreground font-medium mt-1">Dusun Aktif</p>
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">{totalUmkm}</h3>
                  <p className="text-muted-foreground font-medium mt-1">UMKM Terdaftar</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dusun List Section */}
        <section id="dusun" className="py-24 bg-secondary/30 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Wilayah Dusun</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Pilih dusun untuk melihat daftar UMKM dan produk unggulan yang tersedia di wilayah tersebut.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {dusuns.map((dusun) => (
                <Link href={`/dusun/${dusun.id}`} key={dusun.id}>
                  <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white cursor-pointer h-full">
                    <CardContent className="p-6 sm:p-8 flex flex-col h-full items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-secondary/50 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center mb-6 transition-colors duration-300">
                        <MapIcon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{dusun.nama}</h3>
                      <p className="text-muted-foreground mb-8">
                        <span className="font-semibold text-foreground">{dusun._count.umkms}</span> UMKM Terdaftar
                      </p>
                      
                      <div className="mt-auto inline-flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                        Lihat UMKM <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {dusuns.length === 0 && (
              <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-border/50 max-w-2xl mx-auto">
                <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Belum ada data Dusun</h3>
                <p className="text-muted-foreground">Silakan jalankan migrasi dan seed database.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
