"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Store, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-border/40 shadow-sm backdrop-blur-md bg-white/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
            <div className="bg-primary p-2 rounded-t-full rounded-b-md group-hover:bg-primary/90 transition-colors">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">UMKM <span className="text-primary">Mojolebak</span></span>
          </Link>

          {/* Logo instansi pendukung: UMG & KKN Kelompok 10 */}
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-border/50">
            <Image src="/logos/logo-umg.png" alt="Logo Universitas Muhammadiyah Gresik" width={92} height={24} className="h-6 w-auto object-contain" />
            <Image src="/logos/logo-kkn.png" alt="Logo KKN Kelompok 10 Desa Mojolebak" width={36} height={36} className="h-9 w-9 object-contain" />
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Beranda</Link>
          <Link href="/cari" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Cari UMKM</Link>
          <Link href="/daftar" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Daftarkan UMKM</Link>
          <Link href="/panduan" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Panduan</Link>
          <Button asChild className="rounded-full shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
            <Link href="/admin">Login Admin</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(prev => !prev)}
          >
            {menuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border/40 bg-white px-4 py-4 flex flex-col gap-1 shadow-sm">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
          >
            Beranda
          </Link>
          <Link
            href="/cari"
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
          >
            Cari UMKM
          </Link>
          <Link
            href="/daftar"
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
          >
            Daftarkan UMKM
          </Link>
          <Link
            href="/panduan"
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
          >
            Panduan
          </Link>
          <Link href="/admin" onClick={() => setMenuOpen(false)} className="mt-1">
            <Button className="w-full rounded-full">Login Admin</Button>
          </Link>

          {/* Logo instansi pendukung */}
          <div className="flex items-center justify-center gap-4 pt-4 mt-2 border-t border-border/40">
            <Image src="/logos/logo-umg.png" alt="Logo Universitas Muhammadiyah Gresik" width={92} height={24} className="h-6 w-auto object-contain" />
            <Image src="/logos/logo-kkn.png" alt="Logo KKN Kelompok 10 Desa Mojolebak" width={32} height={32} className="h-8 w-8 object-contain" />
          </div>
        </div>
      )}
    </nav>
  );
}
