"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function HeroSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    router.push(query ? `/cari?search=${encodeURIComponent(query)}` : "/cari");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-10">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari nama UMKM di seluruh desa..."
          className="pl-12 h-14 rounded-full border-border/60 bg-secondary/30 focus-visible:ring-primary text-base"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button type="submit" size="lg" className="rounded-full h-14 px-8 shadow-md shadow-primary/20">
        Cari
      </Button>
    </form>
  );
}
