"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UmkmCard from "@/components/UmkmCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const KATEGORI = ["Semua", "Makanan", "Minuman", "Kerajinan", "Jasa", "Pertanian", "Peternakan"];

export default function DusunPage() {
  const params = useParams();
  const dusunId = params.id as string;
  
  const [umkms, setUmkms] = useState<any[]>([]);
  const [dusunName, setDusunName] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [activeKategori, setActiveKategori] = useState("Semua");
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch dusun name
        const dusunRes = await fetch('/api/dusun');
        const dusuns = await dusunRes.json();
        const currentDusun = dusuns.find((d: any) => d.id === dusunId);
        if (currentDusun) setDusunName(currentDusun.nama);

        // Fetch umkm
        const query = new URLSearchParams();
        query.append("dusunId", dusunId);
        if (search) query.append("search", search);
        if (activeKategori !== "Semua") query.append("kategori", activeKategori);
        
        const res = await fetch(`/api/umkm?${query.toString()}`);
        const data = await res.json();
        setUmkms(data);
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setLoading(false);
      }
    }
    
    // Simple debounce for search
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [dusunId, search, activeKategori]);

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-secondary/20 min-h-screen pb-24">
        {/* Header Section */}
        <div className="bg-white border-b pt-12 pb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              UMKM di <span className="text-primary">{dusunName || "Memuat..."}</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
              Temukan berbagai produk dan layanan terbaik dari UMKM lokal di wilayah ini.
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col gap-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Cari nama UMKM..." 
                  className="pl-10 h-12 rounded-xl border-border/60 bg-secondary/30 focus-visible:ring-primary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex w-max space-x-3">
                  {KATEGORI.map((cat) => (
                    <Badge
                      key={cat}
                      variant={activeKategori === cat ? "default" : "secondary"}
                      className={`px-4 py-2 text-sm cursor-pointer rounded-full transition-all ${
                        activeKategori === cat 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                          : "bg-white border border-border/50 hover:bg-secondary text-foreground font-medium"
                      }`}
                      onClick={() => setActiveKategori(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 pt-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p>Mencari UMKM...</p>
            </div>
          ) : umkms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {umkms.map((umkm) => (
                <UmkmCard key={umkm.id} umkm={umkm} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-border/60 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Tidak ada UMKM ditemukan</h3>
              <p className="text-muted-foreground max-w-md">
                Coba sesuaikan kata kunci pencarian atau filter kategori untuk menemukan apa yang Anda cari.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
