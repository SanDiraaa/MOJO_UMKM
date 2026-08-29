"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Loader2, MessageSquareText, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { StarDisplay, StarInput } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface UlasanItem {
  id: string;
  nama: string;
  rating: number;
  teks: string;
  foto?: string | null;
  createdAt: string;
}

export default function UlasanSection({ umkmId }: { umkmId: string }) {
  const [ulasan, setUlasan] = useState<UlasanItem[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [loading, setLoading] = useState(true);

  const [nama, setNama] = useState("");
  const [rating, setRating] = useState(0);
  const [teks, setTeks] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [formLoadedAt] = useState(() => Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUlasan();
  }, [umkmId]);

  async function fetchUlasan() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ulasan?umkmId=${umkmId}`);
      const result = await res.json();
      setUlasan(result.data || []);
      setAvgRating(result.avgRating || 0);
      setTotalApproved(result.totalApproved || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFotoUrl(data.url);
    } catch {
      toast.error("Gagal mengunggah foto");
    } finally {
      setUploadingFoto(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim() || !teks.trim() || rating === 0) {
      toast.error("Nama, rating, dan ulasan wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ulasan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ umkmId, nama, rating, teks, foto: fotoUrl, website: honeypot, formLoadedAt }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setNama("");
      setRating(0);
      setTeks("");
      setFotoUrl(null);
      toast.success("Ulasan berhasil dikirim!", { description: "Akan tampil setelah ditinjau admin." });
    } catch {
      toast.error("Gagal mengirim ulasan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <MessageSquareText className="w-5 h-5 text-primary" /> Rating & Ulasan
        </h2>
        {totalApproved > 0 && (
          <div className="flex items-center gap-2">
            <StarDisplay rating={avgRating} size={20} />
            <span className="font-bold text-lg text-foreground">{avgRating}</span>
            <span className="text-sm text-muted-foreground">({totalApproved} ulasan)</span>
          </div>
        )}
      </div>

      {/* Daftar ulasan */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : ulasan.length === 0 ? (
        <p className="text-muted-foreground text-sm mb-8">Belum ada ulasan. Jadilah yang pertama memberi ulasan!</p>
      ) : (
        <div className="space-y-5 mb-8">
          {ulasan.map((u) => (
            <div key={u.id} className="border-b border-border/50 pb-5 last:border-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-semibold text-foreground">{u.nama}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <StarDisplay rating={u.rating} size={14} />
              <p className="text-muted-foreground mt-2 leading-relaxed">{u.teks}</p>
              {u.foto && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden mt-3 border">
                  <Image src={u.foto} alt={`Foto dari ${u.nama}`} fill className="object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form kirim ulasan */}
      <div className="border-t border-border/50 pt-6">
        <h3 className="font-display font-bold text-foreground mb-4">Tulis Ulasan Anda</h3>

        {submitted ? (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
            Terima kasih! Ulasan Anda akan tampil setelah ditinjau admin.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot anti-spam, disembunyikan dari manusia */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}>
              <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Rating Anda</label>
              <StarInput value={rating} onChange={setRating} />
            </div>

            <Input
              placeholder="Nama Anda"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="rounded-xl h-12"
            />

            <Textarea
              placeholder="Bagaimana pengalaman Anda dengan UMKM ini?"
              value={teks}
              onChange={(e) => setTeks(e.target.value)}
              className="rounded-xl min-h-[100px] resize-none"
            />

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFotoChange}
              />
              {fotoUrl ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border">
                  <Image src={fotoUrl} alt="Preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setFotoUrl(null)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFoto}
                  className="flex items-center gap-2 text-sm text-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-xl px-4 py-2.5"
                >
                  {uploadingFoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  {uploadingFoto ? "Mengunggah..." : "Tambah Foto (opsional)"}
                </button>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="rounded-full px-8 h-12">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Ulasan"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
