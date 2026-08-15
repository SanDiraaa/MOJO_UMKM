import { MapPin, Phone, User, Clock, Store, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PrismaClient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { isAdminRequest } from "@/lib/auth";

const prisma = new PrismaClient();

async function getUmkm(id: string) {
  const umkm = await prisma.umkm.findUnique({
    where: { id },
    include: {
      dusun: true,
      fotoProduk: true,
    },
  });

  if (!umkm) return null;

  // UMKM yang belum disetujui (pending/ditolak) hanya boleh dilihat admin,
  // supaya tidak bisa diakses publik lewat link langsung sebelum di-approve.
  if (umkm.status !== "APPROVED" && !(await isAdminRequest())) {
    return null;
  }

  return umkm;
}

export default async function UmkmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const umkm = await getUmkm(id);

  if (!umkm) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-secondary/20">
          <div className="text-center bg-white p-12 rounded-3xl shadow-sm border">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h1 className="text-2xl font-bold mb-2">UMKM tidak ditemukan</h1>
            <p className="text-muted-foreground mb-6">Data UMKM yang Anda cari tidak tersedia atau telah dihapus.</p>
            <Button asChild>
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Format WhatsApp number to ensure it starts with 62 or numbers only
  let waNumber = umkm.whatsapp.replace(/\D/g, "");
  if (waNumber.startsWith("0")) waNumber = "62" + waNumber.slice(1);
  const waUrl = `https://wa.me/${waNumber}?text=Halo%20Saya%20ingin%20memesan%20produk%20dari%20UMKM%20Anda.`;

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-secondary/10 pb-24">
        {/* Breadcrumb */}
        <div className="bg-white border-b py-4">
          <div className="container mx-auto px-4 flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href={`/dusun/${umkm.dusunId}`} className="hover:text-primary transition-colors">{umkm.dusun.nama}</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-foreground font-medium truncate">{umkm.nama}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-10">
          <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-border">
              {/* Image Gallery */}
              <div className="p-6 lg:p-10 flex flex-col gap-4">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary w-full border">
                  <Image
                    src={umkm.fotoUtama || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"}
                    alt={umkm.nama}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                {umkm.fotoProduk && umkm.fotoProduk.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {umkm.fotoProduk.map((foto, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-secondary border hover:ring-2 ring-primary transition-all cursor-pointer">
                        <Image
                          src={foto.url}
                          alt={`Produk ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6 lg:p-10 flex flex-col">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-semibold w-fit mb-4">
                  {umkm.kategori}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{umkm.nama}</h1>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Pemilik</p>
                      <p>{umkm.pemilik}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Alamat</p>
                      {umkm.mapsUrl ? (
                        <a
                          href={umkm.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline underline-offset-2"
                        >
                          {umkm.alamat}
                        </a>
                      ) : (
                        <p>{umkm.alamat}</p>
                      )}
                      <p className="text-sm mt-0.5">{umkm.dusun.nama}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Jam Operasional</p>
                      <p>{umkm.jamOperasional}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 mb-8 flex-grow">
                  <h3 className="font-semibold text-lg mb-3">Deskripsi Usaha</h3>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {umkm.deskripsi}
                  </p>
                </div>

                <div className="mt-auto">
                  <Button 
                    asChild 
                    size="lg" 
                    className="w-full h-16 text-lg rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1"
                  >
                    <a href={waUrl} target="_blank" rel="noopener noreferrer">
                      <Phone className="w-6 h-6" />
                      Pesan via WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
