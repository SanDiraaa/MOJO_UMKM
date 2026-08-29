"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X, Send, Store, MapPin, Sparkles } from "lucide-react";
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
  text: "Halo! 👋 Saya Mas Lucky, asisten singkat website UMKM Mojolebak. Tanya-tanya aja soal cara daftar, kontak admin, atau langsung sebutkan nama/jenis UMKM yang kamu cari — saya bantu carikan.",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Kata-kata umum yang tidak relevan untuk dijadikan kata kunci pencarian UMKM.
// Dengan membuang kata-kata ini, pengguna tidak perlu menulis "cari" secara eksplisit —
// sisa katanya (biasanya nama usaha/produk) langsung dipakai untuk mencari ke database.
const STOPWORDS = [
  "cari", "carikan", "carilah", "nyari", "mencari", "search", "tolong", "bisa", "boleh", "bantu",
  "ada", "adakah", "apakah", "apa", "dimana", "di", "mana", "gimana", "bagaimana",
  "tau", "tahu", "nggak", "gak", "enggak", "ga", "kah", "dong", "ya", "sih", "deh", "nih", "itu", "ini",
  "umkm", "usaha", "toko", "warung", "jual", "jualan", "yang", "punya", "nama", "namanya",
  "mau", "pengen", "ingin", "saya", "aku", "kamu", "kah", "kalau", "kalo", "ada", "gak", "kak", "min",
];

function matchIntent(input: string): "panduan" | "kontak" | "sapa" | "makasih" | "search" {
  const t = input.toLowerCase();
  if (/(cara|gimana|bagaimana|langkah).*(daftar|mendaftar|registrasi)|^panduan\b|\bpanduan\b.*(daftar|umkm)/.test(t)) return "panduan";
  if (/(nomor|no\.?|kontak).*(wa|whatsapp|admin)|(wa|whatsapp|hubungi|kontak).*admin/.test(t)) return "kontak";
  if (/^(halo|hai|hi|pagi|siang|sore|malam|assalamualaikum)\b/.test(t) && t.length < 20) return "sapa";
  if (/(makasih|terima ?kasih|thanks|thx)/.test(t)) return "makasih";
  return "search";
}

function extractSearchTerm(input: string): string {
  const words = input
    .toLowerCase()
    .replace(/[?!.,]/g, "")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.includes(w));
  return words.join(" ").trim();
}

const BUBBLE_MARGIN = 8;

export default function AssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // --- Drag-to-move untuk bubble chat ---
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const draggedRef = useRef(false);
  const dragInfoRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, width: 56, height: 56 });

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("mojo_bubble_pos");
      if (saved) setPosition(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    const onResize = () => {
      setPosition((prev) => (prev ? clampToViewport(prev, dragInfoRef.current.width, dragInfoRef.current.height) : prev));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function clampToViewport(pos: { x: number; y: number }, width: number, height: number) {
    const maxX = window.innerWidth - width - BUBBLE_MARGIN;
    const maxY = window.innerHeight - height - BUBBLE_MARGIN;
    return { x: Math.min(Math.max(BUBBLE_MARGIN, pos.x), Math.max(BUBBLE_MARGIN, maxX)), y: Math.min(Math.max(BUBBLE_MARGIN, pos.y), Math.max(BUBBLE_MARGIN, maxY)) };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    draggingRef.current = true;
    draggedRef.current = false;
    dragInfoRef.current = { startX: e.clientX, startY: e.clientY, origX: rect.left, origY: rect.top, width: rect.width, height: rect.height };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!draggingRef.current) return;
    const { startX, startY, origX, origY, width, height } = dragInfoRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) draggedRef.current = true;
    if (draggedRef.current) {
      setPosition(clampToViewport({ x: origX + dx, y: origY + dy }, width, height));
    }
  }

  function handlePointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (draggedRef.current) {
      setPosition((prev) => {
        if (!prev) return prev;
        // Menempel otomatis ke tepi kiri/kanan terdekat
        const { width, height } = dragInfoRef.current;
        const snapX = prev.x + width / 2 < window.innerWidth / 2 ? BUBBLE_MARGIN : window.innerWidth - width - BUBBLE_MARGIN;
        const snapped = clampToViewport({ x: snapX, y: prev.y }, width, height);
        try {
          sessionStorage.setItem("mojo_bubble_pos", JSON.stringify(snapped));
        } catch {}
        return snapped;
      });
    }
  }

  function handleButtonClick() {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    setOpen((v) => !v);
  }

  function getPanelStyle(): React.CSSProperties {
    if (!position) return { position: "fixed", bottom: "96px", right: "20px" };
    const { width, height } = dragInfoRef.current;
    const centerX = position.x + width / 2;
    const centerY = position.y + height / 2;
    const style: React.CSSProperties = { position: "fixed" };
    if (centerY > window.innerHeight / 2) {
      style.bottom = window.innerHeight - position.y + 12;
    } else {
      style.top = position.y + height + 12;
    }
    if (centerX < window.innerWidth / 2) {
      style.left = position.x;
    } else {
      style.right = window.innerWidth - (position.x + width);
    }
    return style;
  }

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
      pushBotMessage({
        role: "bot",
        text: pick([
          "Halo juga! Ada yang bisa saya bantu? Coba tanya soal pendaftaran, kontak admin, atau sebutkan nama UMKM yang kamu cari.",
          "Hai! 😊 Mau tanya soal cara daftar, nomor admin, atau lagi nyari UMKM tertentu?",
          "Halo! Ada yang bisa dibantu hari ini?",
        ]),
      });
      return;
    }

    if (intent === "makasih") {
      pushBotMessage({
        role: "bot",
        text: pick([
          "Sama-sama! Kalau ada pertanyaan lain, tanya saja lagi ya 🙂",
          "Siap, senang bisa bantu! Jangan sungkan tanya lagi kalau butuh sesuatu.",
          "Sama-sama 🙌",
        ]),
      });
      return;
    }

    if (intent === "panduan") {
      pushBotMessage({
        role: "bot",
        text: pick([
          "Gampang kok! Isi form di halaman Daftarkan UMKM: nama usaha, kategori, alamat, jam operasional, nomor WA, dan foto usaha. Setelah dikirim, admin akan meninjau dulu sebelum tampil ke publik. Panduan lengkapnya di sini:",
          "Untuk daftar, tinggal buka halaman pendaftaran dan isi data usahamu (nama, kategori, alamat, jam buka, WA, foto). Nanti ditinjau admin dulu ya sebelum muncul di website. Detail langkah-langkahnya bisa dibaca di sini:",
        ]),
        link: { label: "📖 Buka Panduan Pendaftaran", href: "/panduan" },
      });
      return;
    }

    if (intent === "kontak") {
      pushBotMessage({
        role: "bot",
        text: pick([
          "Admin desa bisa dihubungi lewat WhatsApp di 0813-3597-7513, atau langsung klik tombol ini:",
          "Ini kontak admin desa ya, bisa langsung chat lewat tombol di bawah:",
        ]),
        link: { label: "💬 Chat Admin di WhatsApp", href: `https://wa.me/${ADMIN_WHATSAPP}` },
      });
      return;
    }

    // Default: anggap ini pertanyaan mencari UMKM, tanpa perlu kata pemicu seperti "cari"
    const term = extractSearchTerm(text);

    if (!term || term.length < 2) {
      pushBotMessage({
        role: "bot",
        text: pick([
          "Hmm, saya belum menangkap maksudnya. Coba sebutkan nama usaha atau jenis produk yang kamu cari, misalnya \"warung sembako\" atau \"kerupuk pasir\". Atau tanya soal pendaftaran/kontak admin ya.",
          "Boleh diperjelas lagi? Kamu bisa langsung sebut nama UMKM atau jenis usahanya, atau tanya soal cara daftar & kontak admin.",
        ]),
      });
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
          text: pick([
            `Belum ketemu UMKM yang cocok dengan "${term}" nih. Coba kata kunci lain, atau lihat semua UMKM di sini:`,
            `Hmm, tidak ada hasil untuk "${term}". Mungkin salah ketik atau belum terdaftar. Coba jelajahi semua UMKM di sini:`,
          ]),
          link: { label: "🔍 Buka Halaman Cari UMKM", href: "/cari" },
        });
      } else {
        pushBotMessage({
          role: "bot",
          text: pick([
            `Nah, ini ${items.length} UMKM yang cocok:`,
            `Ketemu ${items.length} UMKM yang sesuai:`,
            `Ini yang saya temukan:`,
          ]),
          results: items,
        });
      }
    } catch {
      pushBotMessage({ role: "bot", text: "Waduh, ada gangguan saat mencari. Coba lagi sebentar ya." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Tombol mengambang \u2014 bisa digeser (drag) */}
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label={open ? "Tutup asisten" : "Chat dengan Mas Lucky (bisa digeser)"}
        style={position ? { position: "fixed", left: position.x, top: position.y, right: "auto", bottom: "auto" } : undefined}
        className={`${position ? "" : "fixed bottom-5 right-5"} z-40 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 flex items-center touch-none cursor-grab active:cursor-grabbing select-none ${
          open ? "rounded-t-full rounded-b-2xl w-14 h-14 justify-center" : "rounded-full h-14 pl-4 pr-5 gap-2"
        }`}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <span className="relative">
              <MessageCircle className="w-6 h-6" />
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </span>
            <span className="text-sm font-semibold whitespace-nowrap">Tanya Mas Lucky</span>
          </>
        )}
      </button>

      {/* Panel chat */}
      {open && (
        <div className="z-40 w-[calc(100vw-2.5rem)] max-w-sm bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden" style={{ ...getPanelStyle(), height: "min(70vh, 560px)" }}>
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2">
            <div className="bg-white/20 rounded-full p-1.5">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-tight">Mas Lucky</p>
              <p className="text-xs text-primary-foreground/80 leading-tight">Asisten Virtual UMKM Mojolebak</p>
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
