"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Store, Menu, X, Home, Search, ClipboardList, BookOpen, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/cari", label: "Cari UMKM", icon: Search },
  { href: "/daftar", label: "Daftarkan UMKM", icon: ClipboardList },
  { href: "/panduan", label: "Panduan", icon: BookOpen },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const showBackButton = pathname !== "/";

  return (
    <header className="sticky top-0 z-50">
      {/* Bar institusi — tipis, khusus identitas program */}
      <div className="hidden sm:block bg-primary text-primary-foreground/90">
        <div className="container mx-auto px-4 h-9 flex items-center justify-between text-xs">
          <span className="opacity-90">Program Kerja KKN Kelompok 10 · Universitas Muhammadiyah Gresik</span>
          <div className="flex items-center gap-2 bg-white/95 rounded-full pl-3 pr-1.5 py-1">
            <Image src="/logos/logo-umg.png" alt="Logo Universitas Muhammadiyah Gresik" width={72} height={18} className="h-[18px] w-auto object-contain" />
            <span className="w-px h-4 bg-border" />
            <Image src="/logos/logo-kkn.png" alt="Logo KKN Kelompok 10 Desa Mojolebak" width={22} height={22} className="h-[22px] w-[22px] object-contain rounded-full" />
          </div>
        </div>
      </div>

      {/* Bar navigasi utama */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                aria-label="Kembali ke halaman sebelumnya"
                className="flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary/60 transition-colors shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
              <div className="bg-primary p-2 rounded-t-full rounded-b-md group-hover:bg-primary/90 transition-colors">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl text-foreground tracking-tight whitespace-nowrap">
                UMKM <span className="text-primary">Mojolebak</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-primary hover:bg-secondary/60"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute left-3.5 right-3.5 -bottom-[1px] h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block shrink-0">
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
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border/40 bg-white px-4 py-4 flex flex-col gap-1 shadow-sm">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "text-primary bg-primary/8" : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="mt-1">
              <Button className="w-full rounded-full">Login Admin</Button>
            </Link>

            {/* Identitas program — versi mobile */}
            <div className="pt-4 mt-2 border-t border-border/40 text-center">
              <p className="text-xs text-muted-foreground mb-3">Program Kerja KKN Kelompok 10 · UMG</p>
              <div className="flex items-center justify-center gap-4">
                <Image src="/logos/logo-umg.png" alt="Logo Universitas Muhammadiyah Gresik" width={92} height={24} className="h-6 w-auto object-contain" />
                <Image src="/logos/logo-kkn.png" alt="Logo KKN Kelompok 10 Desa Mojolebak" width={32} height={32} className="h-8 w-8 object-contain" />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
