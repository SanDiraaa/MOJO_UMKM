"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_WHATSAPP = "6281335977513";

interface ChatLink {
  label: string;
  href: string;
}

interface ChatMessage {
  role: "user" | "bot";
  text: string;
  links?: ChatLink[];
}

const STOPWORDS = [
  "cari", "carikan", "ada", "adakah", "apakah", "gak", "ga", "nggak", "tidak", "enggak",
  "umkm", "toko", "warung", "usaha", "dong", "min", "kak", "tolong", "coba", "saya",
  "mau", "ingin", "cari", "gaada", "punya", "yang", "jual", "dimana", "di", "mana",
];

function extractKeyword(input: string): string {
  const words = input
    .toLowerCase()
    .replace(/[?.,!]/g, "")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.includes(w));
  return words.join(" ").trim();
}

async function generateReply(input: string): Promise<ChatMessage> {
  const lower = input.toLowerCase();

  // Sapaan
  if (/^(hai|halo|hi|hey|pagi|siang|sore|malam)\b/.test(lower)) {
    return {
      role: "bot",
      text: "Halo! Saya asisten UMKM Mojolebak. Saya bisa bantu jawab soal cara mendaftar, nomor WA admin, atau mencarikan UMKM yang sudah terdaftar. Mau tanya apa?",
    };
  }

  // Panduan pendaftaran
  if (/(cara daftar|panduan|daftar umkm|mendaftar|cara mendaftar|registrasi)/.test(lower)) {
    return {
      role: "bot",
      text: "Untuk mendaftarkan UMKM: buka halaman Daftarkan UMKM, isi formulir (nama usaha, kategori, alamat, jam operasional, nomor WA, dan foto), lalu kirim. Data akan ditinjau admin dulu sebelum tampil ke publik.",
      links: [
        { label: "Lihat Panduan Lengkap", href: "/panduan" },
        { label: "Daftarkan UMKM Sekarang", href: "/daftar" },
      ],
    };
  }

  // Nomor WA admin
  if (/(nomor wa|whatsapp admin|kontak admin|hubungi admin|nomor admin|no wa)/.test(lower)) {
    return {
      role: "bot",
      text: "Ini nomor WhatsApp admin desa untuk konfirmasi atau pertanyaan lain: 0813-3597-7513",
      links: [
        { label: "Chat Admin di WhatsApp", href: `https://wa.me/${ADMIN_WHATSAPP}` },
      ],
    };
  }

  // Daftar dusun
  if (/(dusun apa saja|daftar dusun|ada dusun|berapa dusun)/.test(lower)) {
    try {
      const res = await fetch("/api/dusun");
      const dusuns = await res.json();
      if (Array.isArray(dusuns) && dusuns.length > 0) {
        return {
          role: "bot",
          text: `Desa Mojolebak punya ${dusuns.length} dusun: ${dusuns.map((d: any) => d.nama).join(", ")}.`,
          links: [{ label: "Jelajahi per Dusun", href: "/" }],
        };
      }
    } catch {
      // fallthrough ke default di bawah
    }
  }

  // Pencarian UMKM
  if (/(cari|ada ga|ada gak|ada nggak|adakah|dimana|jual)/.test(lower)) {
    const keyword = extractKeyword(input);
    try {
      const query = new URLSearchParams();
      if (keyword) query.append("search", keyword);
      query.append("pageSize", "4");
      const res = await fetch(`/api/umkm?${query.toString()}`);
      const result = await res.json();
      const items = result.data || [];

      if (items.length > 0) {
        return {
          role: "bot",
          text: keyword
            ? `Saya menemukan ${result.total} UMKM yang cocok dengan "${keyword}":`
            : `Berikut beberapa UMKM yang terdaftar:`,
          links: [
            ...items.map((u: any) => ({ label: `${u.nama} (${u.dusun?.nama})`, href: `/umkm/${u.id}` })),
            { label: "Lihat Semua Hasil Pencarian", href: `/cari${keyword ? `?search=${encodeURIComponent(keyword)}` : ""}` },
          ],
        };
      }

      return {
        role: "bot",
        text: keyword
          ? `Belum ada UMKM yang cocok dengan "${keyword}". Coba kata kunci lain, atau lihat semua daftar UMKM.`
          : "Belum ada UMKM yang bisa ditampilkan saat ini.",
        links: [{ label: "Cari UMKM", href: "/cari" }],
      };
    } catch {
      return {
        role: "bot",
        text: "Maaf, saya sedang tidak bisa mengambil data UMKM. Coba lagi sebentar, atau cari langsung di halaman Cari UMKM.",
        links: [{ label: "Cari UMKM", href: "/cari" }],
      };
    }
  }

  // Fallback
  return {
    role: "bot",
    text: "Maaf, saya belum paham pertanyaan itu. Saya bisa bantu soal: cara mendaftar UMKM, nomor WA admin, atau mencari UMKM tertentu (contoh: \"ada warung bakso?\").",
    links: [
      { label: "Panduan Pendaftaran", href: "/panduan" },
      { label: "Cari UMKM", href: "/cari" },
    ],
  };
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Halo! Saya asisten UMKM Mojolebak 👋 Ada yang bisa saya bantu? Coba tanya soal cara daftar, nomor WA admin, atau cari UMKM tertentu.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    const reply = await generateReply(text);
    setMessages((prev) => [...prev, reply]);
    setLoading(false);
  };

  return (
    <>
      {/* Tombol mengambang */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup asisten" : "Buka asisten"}
        className="fixed bottom-5 right-5 z-40 bg-primary text-primary-foreground rounded-full p-4 shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Panel chat */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2.5rem)] max-w-sm h-[28rem] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-display font-semibold">Asisten UMKM Mojolebak</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-secondary/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-white border rounded-bl-sm text-foreground"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {msg.links.map((link, i) => (
                        <Link
                          key={i}
                          href={link.href}
                          target={link.href.startsWith("http") ? "_blank" : undefined}
                          className="text-xs font-medium bg-secondary hover:bg-secondary/70 text-primary rounded-lg px-3 py-1.5 transition-colors"
                        >
                          {link.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t flex gap-2 bg-white">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tulis pertanyaan Anda..."
              className="rounded-full h-10"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="rounded-full h-10 w-10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
