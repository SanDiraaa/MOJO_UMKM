import Link from "next/link";
import Image from "next/image";
import { MapPin, User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UmkmCardProps {
  umkm: {
    id: string;
    nama: string;
    pemilik: string;
    kategori: string;
    alamat: string;
    mapsUrl?: string | null;
    fotoUtama: string;
  };
}

export default function UmkmCard({ umkm }: UmkmCardProps) {
  return (
    <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white h-full flex flex-col rounded-2xl">
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-secondary">
        <Image
          src={umkm.fotoUtama || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"}
          alt={umkm.nama}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
          {umkm.kategori}
        </div>
      </div>
      
      <CardContent className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {umkm.nama}
        </h3>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <User className="w-4 h-4 mr-1.5 shrink-0" />
          <span className="line-clamp-1">{umkm.pemilik}</span>
        </div>
        
        <div className="flex items-start text-sm text-muted-foreground mb-6">
          <MapPin className="w-4 h-4 mr-1.5 shrink-0 mt-0.5" />
          {umkm.mapsUrl ? (
            <a
              href={umkm.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="line-clamp-2 hover:text-primary hover:underline transition-colors"
            >
              {umkm.alamat}
            </a>
          ) : (
            <span className="line-clamp-2">{umkm.alamat}</span>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t">
          <Button asChild className="w-full rounded-xl group-hover:bg-primary transition-colors">
            <Link href={`/umkm/${umkm.id}`}>
              Detail UMKM <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
