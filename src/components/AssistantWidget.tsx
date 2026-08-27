"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X, Send, Store, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_WHATSAPP = "6281335977513";

type UmkmResult = { id: string; nama: string; kategori: string; dusun?: { nama: string } };

interface Message {
  role: "bot" | "user";
  text?: string;
  results?: UmkmResult[];
  link?: { label: string; href: string };
}

const QUICK_REPLIES = ["Cara daftar UMKM", "Nomor WA admin", "Cari UMKM"];

const INITIAL_MESSAGE: Message = {
  role: "bot",
  text: "Halo! 👋 Saya asisten singkat website UMKM Mojolebak. Saya bisa bantu jawab soal cara pendaftaran, nomor WA admin, atau mencari UMKM yang sudah terdaftar. Ada yang bisa dibantu?",
};

function matchIntent(input: string): "panduan" | "kontak" | "cari" | "sapa" | "makasih" | "unknown" {
  const t = input.toLowerCase();
  if (/(cara|gimana|bagaimana|langkah).*(daftar|mendaftar|registrasi)|panduan/.test(t)) return "panduan";
  if (/(nomor|no\.?|kontak).*(wa|whatsapp|admin)|(wa|whatsapp|hubungi|kontak).*admin/.test(t)) return "kontak";
  if (/^(cari|carikan|ada umkm|nyari|search)\b/.test(t) || /\bumkm\b.*\bnama\b/.test(t)) return "cari";
  if (/^(halo|hai|hi|pagi|siang|sore|malam)\b/.test(t)) return "sapa";
  if (/(makasih|terima kasih|thanks)/.test(t)) return "makasih";
  return "unknown";
}

function extractSearchTerm(input: string): string {
  return input
    .toLowerCase()
    .replace(/^(cari|carikan|nyari|search)\b/, "")
    .replace(/\b(umkm|usaha|toko|dong|ya|nama)\b/g, "")
    .trim();
}

export default function AssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Jangan tampilkan di halaman admin
  if (pathname?.startsWith("/admin")) return null;

  const pushBotMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

  const handleSend = async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    const intent = matchIntent(text);

    if (intent === "sapa") {
      pushBotMessage({ role: "bot", text: "Halo juga! Ada yang bisa saya bantu? Kamu bisa tanya soal pendaftaran, nomor admin, atau cari UMKM tertentu." });
      return;
    }

    if (intent === "makasih") {
      pushBotMessage({ role: "bot", text: "Sama-sama! Kalau ada pertanyaan lain, tanya saja lagi ya 🙂" });
      return;
    }

    if (intent === "panduan") {
      pushBotMessage({
        role: "bot",
        text: "Untuk mendaftarkan UMKM, isi form di halaman Daftarkan UMKM: nama usaha, kategori, alamat, jam operasional, nomor WA, dan foto usaha. Setelah kirim, data akan ditinjau admin dulu sebelum tampil publik. Panduan lengkapnya ada di sini:",
        link: { label: "📖 Buka Panduan Pendaftaran", href: "/panduan" },
      });
      return;
    }

    if (intent === "kontak") {
      pushBotMessage({
        role: "bot",
        text: "Kamu bisa hubungi admin desa lewat WhatsApp di nomor 0813-3597-7513, atau klik tombol di bawah ini untuk langsung chat:",
        link: { label: "💬 Chat Admin di WhatsApp", href: `https://wa.me/${ADMIN_WHATSAPP}` },
      });
      return;
    }

    if (intent === "cari") {
      const term = extractSearchTerm(text);
      if (!term) {
        pushBotMessage({ role: "bot", text: "UMKM apa yang mau kamu cari? Coba ketik misalnya \"cari warung sembako\"." });
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/umkm?search=${encodeURIComponent(term)}&pageSize=5`);
        const result = await res.json();
        const items: UmkmResult[] = result.data || [];
        if (items.length === 0) {
          pushBotMessage({
            role: "bot",
            text: `Tidak ditemukan UMKM dengan nama mengandung "${term}". Coba kata kunci lain, atau jelajahi semua UMKM di sini:`,
            link: { label: "🔍 Buka Halaman Cari UMKM", href: "/cari" },
          });
        } else {
          pushBotMessage({ role: "bot", text: `Ditemukan ${items.length} UMKM yang cocok:`, results: items });
        }
      } catch {
        pushBotMessage({ role: "bot", text: "Maaf, terjadi kesalahan saat mencari. Coba lagi sebentar lagi ya." });
      } finally {
        setLoading(false);
      }
      return;
    }

    pushBotMessage({
      role: "bot",
      text: "Maaf, saya belum mengerti pertanyaan itu. Saya baru bisa bantu soal cara pendaftaran, nomor WA admin, atau pencarian UMKM. Coba salah satu tombol di bawah ini:",
    });
  };

  return (
    <>
      {/* Tombol mengambang */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup asisten" : "Buka asisten"}
        className="fixed bottom-5 right-5 z-40 bg-primary hover:bg-primary/90 text-primary-foreground rounded-t-full rounded-b-2xl w-14 h-14 flex items-center justify-center shadow-lg shadow-primary/30 transition-transform hover:scale-105"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Panel chat */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-sm bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden" style={{ height: "min(70vh, 560px)" }}>
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2">
            <div className="bg-white/20 rounded-full p-1.5">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-tight">Asisten UMKM Mojolebak</p>
              <p className="text-xs text-primary-foreground/80 leading-tight">Jawaban singkat & otomatis</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-white border rounded-bl-sm text-foreground"
                  }`}
                >
                  {msg.text && <p>{msg.text}</p>}

                  {msg.results && (
                    <div className="mt-2 space-y-1.5">
                      {msg.results.map((u) => (
                        <Link
                          key={u.id}
                          href={`/umkm/${u.id}`}
                          className="flex items-center gap-2 bg-secondary/60 hover:bg-secondary rounded-lg px-2.5 py-2 transition-colors"
                        >
                          <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{u.nama}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {u.dusun?.nama} · {u.kategori}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {msg.link && (
                    <a
                      href={msg.link.href}
                      target={msg.link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-primary font-medium underline underline-offset-2"
                    >
                      {msg.link.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-muted-foreground">
                  Mencari...
                </div>
              </div>
            )}
          </div>

          <div className="px-4 pt-2 pb-1 flex gap-1.5 overflow-x-auto">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="shrink-0 text-xs bg-secondary hover:bg-secondary/70 text-foreground px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t flex gap-2 bg-white"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan..."
              className="rounded-full h-10"
            />
            <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0" disabled={loading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
