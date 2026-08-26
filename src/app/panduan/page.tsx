import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  MapPin,
  Clock,
  Phone,
  ImageIcon,
  CheckCircle2,
  Search,
  Pencil,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "Panduan Pendaftaran UMKM - UMKM Mojolebak",
  description: "Panduan singkat cara mendaftarkan dan mengelola usaha Anda di platform UMKM Mojolebak.",
};

const steps = [
  {
    icon: ClipboardList,
    title: "1. Isi Formulir Pendaftaran",
    desc: "Buka halaman \"Daftarkan UMKM\", lalu isi nama usaha, nama pemilik, kategori, deskripsi singkat, dan pilih dusun tempat usaha Anda berada.",
  },
  {
    icon: MapPin,
    title: "2. Isi Alamat & Link Google Maps",
    desc: "Tuliskan alamat lengkap usaha. Untuk link Google Maps: buka Google Maps, cari lokasi usaha Anda, tekan tombol Bagikan, lalu Salin Link, dan tempel di kolom yang tersedia. Ini opsional, tapi sangat membantu pelanggan menemukan lokasi Anda.",
  },
  {
    icon: Clock,
    title: "3. Pilih Jam Operasional",
    desc: "Pilih jam buka dan jam tutup usaha Anda dari daftar pilihan, atau centang \"Buka 24 Jam\" kalau usaha Anda buka sepanjang hari. Pilih juga hari operasionalnya.",
  },
  {
    icon: Phone,
    title: "4. Isi Nomor WhatsApp",
    desc: "Masukkan nomor WhatsApp aktif tanpa spasi atau tanda baca, contoh: 6281234567890. Nomor ini akan digunakan pelanggan untuk menghubungi Anda langsung dari website.",
  },
  {
    icon: ImageIcon,
    title: "5. Unggah Foto",
    desc: "Unggah satu foto utama yang mewakili usaha Anda (foto toko atau produk andalan). Anda juga bisa menambahkan beberapa foto produk lainnya secara opsional.",
  },
  {
    icon: CheckCircle2,
    title: "6. Kirim & Tunggu Persetujuan",
    desc: "Setelah semua terisi, klik tombol Daftar. Data Anda akan ditinjau oleh admin desa terlebih dahulu sebelum tampil ke publik \u2014 biasanya untuk memastikan data valid. Setelah disetujui, usaha Anda otomatis muncul di website.",
  },
];

export default function PanduanPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-secondary/20">
        {/* Hero */}
        <div className="bg-white border-b pt-16 pb-12">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-primary font-medium text-sm mb-6">
              <BookOpen className="w-4 h-4" />
              <span>Panduan Penggunaan</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Cara Mendaftarkan UMKM Anda
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Panduan singkat langkah demi langkah untuk mendaftarkan dan mengelola usaha Anda di platform UMKM Mojolebak.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="container mx-auto px-4 py-14 max-w-3xl">
          <div className="space-y-5">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border p-6 flex gap-5 items-start shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-primary/10 text-primary rounded-full p-3 shrink-0">
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-1.5">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Setelah mendaftar */}
          <div className="mt-10 bg-accent/15 border border-accent/30 rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg text-foreground mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Setelah Mendaftar
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Data usaha Anda <strong className="text-foreground">tidak langsung tampil ke publik</strong>. Admin desa akan meninjau pendaftaran terlebih dahulu untuk memastikan data valid. Setelah disetujui, usaha Anda otomatis muncul di Beranda, halaman dusun, dan bisa ditemukan lewat pencarian. Kalau setelah beberapa hari belum juga muncul, silakan hubungi admin desa.
            </p>
          </div>

          {/* Mencari UMKM lain */}
          <div className="mt-6 bg-white border rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg text-foreground mb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" /> Mencari UMKM Lain
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Gunakan kotak pencarian di Beranda atau menu <strong className="text-foreground">"Cari UMKM"</strong> untuk menemukan usaha lain di seluruh desa, atau jelajahi berdasarkan dusun lewat bagian "Wilayah Dusun". Klik salah satu usaha untuk melihat detail lengkap \u2014 foto bisa diklik untuk diperbesar, dan tersedia tombol hubungi langsung lewat WhatsApp.
            </p>
          </div>

          {/* Mengubah data */}
          <div className="mt-6 bg-white border rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg text-foreground mb-2 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" /> Ingin Mengubah Data yang Sudah Terdaftar?
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Saat ini pelaku UMKM belum bisa mengedit sendiri data yang sudah didaftarkan. Kalau ada perubahan (nomor WhatsApp baru, jam operasional berubah, dll), silakan hubungi admin desa untuk dibantu memperbarui data Anda.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="rounded-full h-14 px-8 shadow-md shadow-primary/20">
              <Link href="/daftar">
                Daftarkan UMKM Sekarang <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
