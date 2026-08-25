"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoGalleryProps {
  mainImage: string;
  productImages: { url: string }[];
  alt: string;
}

export default function PhotoGallery({ mainImage, productImages, alt }: PhotoGalleryProps) {
  const images = [
    mainImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    ...productImages.map((f) => f.url),
  ];

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const closeLightbox = useCallback(() => setOpen(false), []);
  const showPrev = useCallback(
    () => setActiveIndex((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const showNext = useCallback(
    () => setActiveIndex((i) => (i + 1) % images.length),
    [images.length]
  );

  // Navigasi keyboard: Escape untuk tutup, panah kiri/kanan untuk geser foto
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    // Kunci scroll body selagi lightbox terbuka
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, closeLightbox, showPrev, showNext]);

  return (
    <>
      <div
        className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary w-full border cursor-pointer group"
        onClick={() => openLightbox(0)}
      >
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover group-hover:brightness-90 transition-all"
          priority
        />
      </div>

      {productImages.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-2">
          {productImages.map((foto, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(idx + 1)}
              className="relative aspect-square rounded-xl overflow-hidden bg-secondary border hover:ring-2 ring-primary transition-all cursor-pointer"
            >
              <Image src={foto.url} alt={`Produk ${idx + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            aria-label="Tutup"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="Foto sebelumnya"
                className="absolute left-2 sm:left-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="Foto berikutnya"
                className="absolute right-2 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 sm:p-3 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-4xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`${alt} - foto ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
