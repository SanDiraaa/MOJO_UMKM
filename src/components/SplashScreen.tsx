"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Store, MousePointerClick } from "lucide-react";

const SESSION_KEY = "mojo_splash_seen";
const DISPLAY_DURATION = 10000;
const FADE_DURATION = 400;

export default function SplashScreen() {
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "visible" | "fading" | "hidden">("checking");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname !== "/") {
      setStatus("hidden");
      return;
    }
    const alreadySeen = sessionStorage.getItem(SESSION_KEY);
    if (alreadySeen) {
      setStatus("hidden");
      return;
    }
    setStatus("visible");
    timerRef.current = setTimeout(dismiss, DISPLAY_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function dismiss() {
    if (timerRef.current) clearTimeout(timerRef.current);
    sessionStorage.setItem(SESSION_KEY, "1");
    setStatus("fading");
    setTimeout(() => setStatus("hidden"), FADE_DURATION);
  }

  if (status === "checking" || status === "hidden") return null;

  return (
    <div
      onClick={dismiss}
      className={`fixed inset-0 z-[200] bg-primary flex flex-col items-center justify-center cursor-pointer select-none transition-opacity duration-[400ms] overflow-hidden ${
        status === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Foto Balai Desa Mojolebak sebagai latar belakang */}
      <div className="absolute inset-x-0 bottom-0 h-[78%] sm:h-[90%] pointer-events-none select-none" aria-hidden="true">
        <Image
          src="/images/balai-desa.png"
          alt=""
          fill
          className="object-contain object-bottom opacity-[0.32] mix-blend-luminosity"
          priority
        />
      </div>

      {/* Motif dekoratif ringan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full">
          <path
            d="M 470 800 L 470 380 Q 470 260 600 235 Q 730 260 730 380 L 730 800"
            fill="none"
            stroke="white"
            strokeWidth="30"
            opacity="0.06"
          />
        </svg>
      </div>

      {/* Logo instansi pendukung — ditempatkan di paling atas */}
      <div className="absolute top-5 sm:top-8 flex items-center gap-3 bg-white/95 rounded-full px-4 py-2 shadow-lg animate-in fade-in zoom-in-95 duration-500">
        <Image src="/logos/logo-umg.png" alt="Logo Universitas Muhammadiyah Gresik" width={78} height={20} className="h-5 w-auto object-contain" />
        <span className="w-px h-5 bg-border" />
        <Image src="/logos/logo-kkn.png" alt="Logo KKN Kelompok 10" width={26} height={26} className="h-[26px] w-[26px] object-contain rounded-full" />
        <span className="w-px h-5 bg-border" />
        <Image src="/logos/logo-desa.png" alt="Logo Pemerintah Desa Mojolebak" width={22} height={28} className="h-7 w-auto object-contain" />
      </div>

      <div className="relative flex flex-col items-center text-center px-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white/15 backdrop-blur-sm rounded-t-full rounded-b-2xl p-5 mb-6">
          <Store className="w-10 h-10 text-white" />
        </div>
        <p className="text-primary-foreground/80 text-sm sm:text-base font-medium tracking-wide mb-2 uppercase">
          Selamat Datang di Website
        </p>
        <h1 className="font-display font-bold text-4xl sm:text-6xl text-white tracking-tight leading-tight">
          UMKM Mojolebak
        </h1>
        <p className="text-primary-foreground/70 text-sm sm:text-base mt-4 max-w-sm">
          Menjelajahi dan mendukung potensi usaha lokal Desa Mojolebak
        </p>
      </div>

      <div className="absolute bottom-8 flex items-center gap-2 bg-white/15 hover:bg-white/20 backdrop-blur-sm text-white text-sm sm:text-base font-medium px-5 py-2.5 rounded-full border border-white/30 animate-pulse">
        <MousePointerClick className="w-4 h-4" />
        Ketuk di mana saja untuk melewati
      </div>
    </div>
  );
}
