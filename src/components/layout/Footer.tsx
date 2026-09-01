import Link from "next/link";
import { Store, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-t-full rounded-b-md">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">UMKM <span className="text-primary">Mojolebak</span></span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm leading-relaxed">
              Platform direktori untuk memajukan potensi lokal dan menghubungkan UMKM Desa Mojolebak dengan pelanggan yang lebih luas.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">Tautan</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Beranda</Link></li>
              <li><Link href="/daftar" className="text-muted-foreground hover:text-primary transition-colors">Daftarkan UMKM</Link></li>
              <li><Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-foreground">Kontak</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <a
                  href="https://maps.app.goo.gl/SZi5gCveE7dj7oEr8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline transition-colors"
                >
                  Balai Desa Mojolebak
                </a>
              </li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +62 812 3456 7890</li>
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> info@umkmdesa.com</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} KKN Kelompok 10 UMG. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
