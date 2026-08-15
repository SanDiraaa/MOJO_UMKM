"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UmkmCard from "@/components/UmkmCard";
import Pagination from "@/components/Pagination";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const KATEGORI = ["Semua", "Makanan", "Minuman", "Kerajinan", "Jasa", "Pertanian", "Peternakan"];
const PAGE_SIZE = 12;

function CariContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [umkms, setUmkms] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [dusuns, setDusuns] = useState<{ id: string; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeKategori, setActiveKategori] = useState("Semua");
  const [activeDusunId, setActiveDusunId] = useState("Semua");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/dusun")
      .then(res => res.json())
      .then(data => setDusuns(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, activeKategori, activeDusunId]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.append("search", search);
        if (activeKategori !== "Semua") query.append("kategori", activeKategori);
        if (activeDusunId !== "Semua") query.append("dusunId", activeDusunId);
        query.append("page", String(page));
        query.append("pageSize", String(PAGE_SIZE));

        const res = await fetch(`/api/umkm?${query.toString()}`);
        const result = await res.json();
        setUmkms(result.data || []);
        setTotal(result.total || 0);
        setTotalPages(result.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch", error);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, activeKategori, activeDusunId, page]);

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-secondary/20 min-h-screen pb-24">
        <div className="bg-white border-b pt-12 pb-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cari <span className="text-primary">UMKM</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
              Temukan UMKM dari seluruh dusun berdasarkan nama, kategori, atau wilayah.
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari nama UMKM..."
                    className="pl-10 h-12 rounded-xl border-border/60 bg-secondary/30 focus-visible:ring-primary"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <Select value={activeDusunId} onValueChange={setActiveDusunId}>
                  <SelectTrigger className="h-12 rounded-xl w-full sm:w-56">
                    <SelectValue placeholder="Semua Dusun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Dusun</SelectItem>
                    {dusuns.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        <div className="container mx-auto px-4 pt-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p>Mencari UMKM...</p>
            </div>
          ) : umkms.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Menampilkan {umkms.length} dari {total} UMKM
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {umkms.map((umkm) => (
                  <UmkmCard key={umkm.id} umkm={umkm} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-border/60 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Tidak ada UMKM ditemukan</h3>
              <p className="text-muted-foreground max-w-md">
                Coba sesuaikan kata kunci pencarian atau filter untuk menemukan apa yang Anda cari.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CariPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <CariContent />
    </Suspense>
  );
}
