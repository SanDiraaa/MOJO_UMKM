"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Store, Loader2, BookOpen, CheckCircle2, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ImageUploader from "@/components/ImageUploader";
import OperatingHoursPicker from "@/components/OperatingHoursPicker";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  nama: z.string().min(2, "Nama UMKM minimal 2 karakter."),
  pemilik: z.string().min(2, "Nama pemilik minimal 2 karakter."),
  kategori: z.string().min(1, "Kategori wajib dipilih."),
  dusunId: z.string().min(1, "Dusun wajib dipilih."),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter."),
  alamat: z.string().min(5, "Alamat wajib diisi dengan jelas."),
  mapsUrl: z.string().url("Link Google Maps tidak valid.").optional().or(z.literal("")),
  jamOperasional: z.string().min(3, "Contoh: 08:00 - 20:00"),
  whatsapp: z.string().regex(/^[0-9]+$/, "Nomor WhatsApp hanya boleh berisi angka.").min(9, "Nomor WA tidak valid"),
  fotoUtama: z.string().min(1, "Foto Utama wajib diunggah."),
  fotoProduk: z.array(z.string()).optional(),
});

const KATEGORI = ["Makanan", "Minuman", "Kerajinan", "Jasa", "Pertanian", "Peternakan"];

// Nomor WhatsApp admin desa untuk konfirmasi pendaftaran UMKM baru
const ADMIN_WHATSAPP = "6281335977513";

export default function DaftarPage() {
  const router = useRouter();
  const [dusuns, setDusuns] = useState<{id: string, nama: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formLoadedAt] = useState(() => Date.now());
  const [honeypot, setHoneypot] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submittedNama, setSubmittedNama] = useState("");

  useEffect(() => {
    fetch("/api/dusun")
      .then(res => res.json())
      .then(data => setDusuns(data))
      .catch(console.error);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      pemilik: "",
      kategori: "",
      dusunId: "",
      deskripsi: "",
      alamat: "",
      mapsUrl: "",
      jamOperasional: "",
      whatsapp: "",
      fotoUtama: "",
      fotoProduk: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/umkm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, website: honeypot, formLoadedAt }),
      });

      if (!res.ok) throw new Error("Gagal mendaftar");

      setSubmittedNama(values.nama);
      setShowConfirmDialog(true);
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const waMessage = encodeURIComponent(
    `Halo Admin, saya baru saja mendaftarkan UMKM "${submittedNama}" di website. Mohon bantu ditinjau ya. Terima kasih.`
  );
  const waLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${waMessage}`;

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-secondary/10 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-3xl shadow-sm border p-6 md:p-10">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/50">
              <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Daftarkan UMKM Anda</h1>
                <p className="text-muted-foreground mt-1">Lengkapi form berikut untuk mempromosikan usaha Anda.</p>
              </div>
            </div>

            <Link
              href="/panduan"
              className="flex items-center gap-2 text-sm text-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-xl px-4 py-3 mb-6 w-fit"
            >
              <BookOpen className="w-4 h-4" />
              Bingung cara mengisi? Lihat panduan pendaftaran
            </Link>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Honeypot anti-spam: field ini disembunyikan dari pengguna manusia lewat CSS,
                    tapi bot yang mengisi semua field secara otomatis biasanya ikut mengisi ini. */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
                  <label htmlFor="website">Jangan isi field ini</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={e => setHoneypot(e.target.value)}
                  />
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama UMKM</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Kripik Pisang Mpok Nur" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pemilik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Pemilik</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama Lengkap" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="kategori"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {KATEGORI.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dusunId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lokasi Dusun</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue placeholder="Pilih Dusun" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dusuns.map(d => (
                              <SelectItem key={d.id} value={d.id}>{d.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="alamat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Lengkap</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Jl. Raya Desa No. 123, RT 01/RW 02..." className="resize-none rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mapsUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Google Maps (opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://maps.app.goo.gl/..." className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deskripsi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Usaha & Produk</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Jelaskan tentang usaha dan produk yang dijual..." className="min-h-[120px] rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jamOperasional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam Operasional</FormLabel>
                      <FormControl>
                        <OperatingHoursPicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor WhatsApp (Hanya Angka)</FormLabel>
                      <FormControl>
                        <Input placeholder="081234567890" className="h-12 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t border-border/50 space-y-6">
                  <FormField
                    control={form.control}
                    name="fotoUtama"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUploader 
                            label="Foto Utama UMKM (Wajib)" 
                            maxFiles={1} 
                            onUploadSuccess={(urls) => field.onChange(urls[0])} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fotoProduk"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUploader 
                            label="Galeri Produk (Maks 5 Foto)" 
                            maxFiles={5} 
                            onUploadSuccess={(urls) => field.onChange(urls)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6">
                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg rounded-xl shadow-md shadow-primary/20">
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...</>
                    ) : (
                      "Daftarkan UMKM"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal konfirmasi setelah berhasil daftar */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl shadow-lg border w-full max-w-md p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              UMKM Berhasil Didaftarkan!
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Data usaha <strong className="text-foreground">"{submittedNama}"</strong> akan ditinjau admin terlebih dahulu sebelum tampil ke publik. Untuk mempercepat proses, silakan konfirmasi ke admin lewat WhatsApp.
            </p>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20BD5C] text-white font-medium transition-colors mb-3"
            >
              <MessageCircle className="w-5 h-5" />
              Konfirmasi ke Admin via WhatsApp
            </a>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setShowConfirmDialog(false);
                router.push("/");
              }}
            >
              Nanti Saja, Kembali ke Beranda
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
