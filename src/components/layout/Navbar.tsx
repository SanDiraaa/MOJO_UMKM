import Link from "next/link";
import { Store, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-border/40 shadow-sm backdrop-blur-md bg-white/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl group-hover:bg-primary/90 transition-colors">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">UMKM <span className="text-primary">Desa</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Beranda</Link>
          <Link href="/daftar" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Daftarkan UMKM</Link>
          <Button asChild className="rounded-full shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
            <Link href="/admin">Login Admin</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6 text-foreground" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
