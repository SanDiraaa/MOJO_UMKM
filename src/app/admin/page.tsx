"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Loader2, Store, Users, Map as MapIcon, LogOut, Pencil, Check, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const KATEGORI_LIST = ["Makanan", "Minuman", "Kerajinan", "Jasa", "Pertanian", "Peternakan"];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const [umkms, setUmkms] = useState<any[]>([]);
  const [dusuns, setDusuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDusunId, setEditingDusunId] = useState<string | null>(null);
  const [editingDusunName, setEditingDusunName] = useState("");
  const [savingDusun, setSavingDusun] = useState(false);

  const [editingUmkm, setEditingUmkm] = useState<any | null>(null);
  const [umkmForm, setUmkmForm] = useState({ nama: "", pemilik: "", kategori: "", dusunId: "", alamat: "", mapsUrl: "", whatsapp: "", deskripsi: "" });
  const [savingUmkm, setSavingUmkm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        fetchData();
        toast.success("Login berhasil");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Username atau password salah");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan, coba lagi");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      // abaikan, tetap logout di sisi tampilan
    } finally {
      setIsAuthenticated(false);
      setUsername("");
      setPassword("");
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/admin/session");
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchData();
        }
      } catch (error) {
        // biarkan tampil form login kalau gagal cek sesi
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [umkmRes, dusunRes] = await Promise.all([
        fetch("/api/umkm?pageSize=1000"),
        fetch("/api/dusun")
      ]);
      const umkmResult = await umkmRes.json();
      const dusunData = await dusunRes.json();
      setUmkms(umkmResult.data || []);
      setDusuns(dusunData);
    } catch (error) {
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus UMKM ini?")) return;
    
    try {
      const res = await fetch(`/api/umkm/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("UMKM dihapus");
        setUmkms(umkms.filter(u => u.id !== id));
      } else {
        toast.error("Gagal menghapus UMKM");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [umkmSearch, setUmkmSearch] = useState("");
  const [umkmStatusFilter, setUmkmStatusFilter] = useState("Semua");
  const [umkmDusunFilter, setUmkmDusunFilter] = useState("Semua");
  const [umkmPage, setUmkmPage] = useState(1);
  const UMKM_PAGE_SIZE = 10;

  useEffect(() => {
    setUmkmPage(1);
  }, [umkmSearch, umkmStatusFilter, umkmDusunFilter]);

  const handleStatusChange = async (id: string, status: "APPROVED" | "REJECTED" | "PENDING") => {
    setUpdatingStatusId(id);
    try {
      const res = await fetch(`/api/umkm/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUmkms(umkms.map(u => (u.id === id ? { ...u, status: updated.status } : u)));
        const label = status === "APPROVED" ? "disetujui" : status === "REJECTED" ? "ditolak" : "dikembalikan ke pending";
        toast.success(`UMKM ${label}`);
      } else {
        toast.error("Gagal mengubah status UMKM");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const startEditDusun = (id: string, currentName: string) => {
    setEditingDusunId(id);
    setEditingDusunName(currentName);
  };

  const cancelEditDusun = () => {
    setEditingDusunId(null);
    setEditingDusunName("");
  };

  const saveDusunName = async (id: string) => {
    const nama = editingDusunName.trim();
    if (!nama) {
      toast.error("Nama dusun tidak boleh kosong");
      return;
    }
    setSavingDusun(true);
    try {
      const res = await fetch(`/api/dusun/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDusuns(dusuns.map(d => (d.id === id ? { ...d, nama: updated.nama } : d)));
        setUmkms(umkms.map(u => (u.dusunId === id ? { ...u, dusun: { ...u.dusun, nama: updated.nama } } : u)));
        toast.success("Nama dusun berhasil diubah");
        cancelEditDusun();
      } else {
        toast.error("Gagal mengubah nama dusun");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setSavingDusun(false);
    }
  };

  const openEditUmkm = (umkm: any) => {
    setEditingUmkm(umkm);
    setUmkmForm({
      nama: umkm.nama || "",
      pemilik: umkm.pemilik || "",
      kategori: umkm.kategori || "",
      dusunId: umkm.dusunId || umkm.dusun?.id || "",
      alamat: umkm.alamat || "",
      mapsUrl: umkm.mapsUrl || "",
      whatsapp: umkm.whatsapp || "",
      deskripsi: umkm.deskripsi || "",
    });
  };

  const closeEditUmkm = () => {
    setEditingUmkm(null);
    setUmkmForm({ nama: "", pemilik: "", kategori: "", dusunId: "", alamat: "", mapsUrl: "", whatsapp: "", deskripsi: "" });
  };

  const saveUmkm = async () => {
    if (!editingUmkm) return;
    if (!umkmForm.nama.trim() || !umkmForm.pemilik.trim() || !umkmForm.kategori || !umkmForm.dusunId) {
      toast.error("Semua field wajib diisi");
      return;
    }
    if (umkmForm.whatsapp && !/^[0-9]+$/.test(umkmForm.whatsapp)) {
      toast.error("Nomor WhatsApp hanya boleh berisi angka");
      return;
    }
    setSavingUmkm(true);
    try {
      const res = await fetch(`/api/umkm/${editingUmkm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(umkmForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setUmkms(umkms.map(u => (u.id === updated.id ? updated : u)));
        toast.success("Data UMKM berhasil diubah");
        closeEditUmkm();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Gagal mengubah data UMKM");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setSavingUmkm(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20 p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border max-w-md w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-2">Login untuk mengelola UMKM Mojolebak</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              placeholder="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="h-12 rounded-xl"
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="h-12 rounded-xl"
            />
            <Button type="submit" disabled={loggingIn} className="w-full h-12 rounded-xl text-lg">
              {loggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const getStats = () => {
    const totalUmkm = umkms.length;
    const totalDusun = dusuns.length;
    const kategoriCount: Record<string, number> = {};
    umkms.forEach(u => {
      kategoriCount[u.kategori] = (kategoriCount[u.kategori] || 0) + 1;
    });
    return { totalUmkm, totalDusun, kategoriCount };
  };

  const stats = getStats();

  // Filter + pagination untuk tabel Daftar UMKM (dihitung dari data yang sudah di-fetch)
  const filteredUmkms = umkms.filter(u => {
    const matchSearch = u.nama.toLowerCase().includes(umkmSearch.toLowerCase()) || u.pemilik.toLowerCase().includes(umkmSearch.toLowerCase());
    const matchStatus = umkmStatusFilter === "Semua" || u.status === umkmStatusFilter;
    const matchDusun = umkmDusunFilter === "Semua" || u.dusunId === umkmDusunFilter;
    return matchSearch && matchStatus && matchDusun;
  });
  const umkmTotalPages = Math.max(1, Math.ceil(filteredUmkms.length / UMKM_PAGE_SIZE));
  const paginatedUmkms = filteredUmkms.slice((umkmPage - 1) * UMKM_PAGE_SIZE, umkmPage * UMKM_PAGE_SIZE);

  return (
    <div className="min-h-screen bg-secondary/10 flex flex-col">
      <nav className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl text-white">
            <Store className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl">Admin Panel</span>
        </div>
        <Button variant="ghost" onClick={handleLogout} disabled={loggingOut} className="text-muted-foreground hover:text-destructive">
          {loggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />} Logout
        </Button>
      </nav>

      <div className="flex-grow p-6 md:p-10 container mx-auto max-w-6xl">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Total UMKM</p>
              <h3 className="text-3xl font-bold">{stats.totalUmkm}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-xl flex items-center justify-center shrink-0">
              <MapIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Total Dusun</p>
              <h3 className="text-3xl font-bold">{stats.totalDusun}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <p className="text-sm text-muted-foreground font-medium mb-3">Distribusi Kategori</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.kategoriCount).map(([cat, count]) => (
                <span key={cat} className="text-xs bg-secondary px-2.5 py-1 rounded-full font-medium">
                  {cat}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dusun Table */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden mb-10">
          <div className="p-6 border-b flex items-center justify-between bg-white">
            <h2 className="text-xl font-bold text-foreground">Daftar Dusun</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama Dusun</th>
                  <th className="px-6 py-4 font-semibold">Jumlah UMKM</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Memuat data...
                    </td>
                  </tr>
                ) : dusuns.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                      Belum ada dusun terdaftar
                    </td>
                  </tr>
                ) : (
                  dusuns.map((dusun) => (
                    <tr key={dusun.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {editingDusunId === dusun.id ? (
                          <Input
                            autoFocus
                            value={editingDusunName}
                            onChange={e => setEditingDusunName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") saveDusunName(dusun.id);
                              if (e.key === "Escape") cancelEditDusun();
                            }}
                            className="h-9 rounded-lg max-w-[220px]"
                          />
                        ) : (
                          dusun.nama
                        )}
                      </td>
                      <td className="px-6 py-4">{dusun._count?.umkms ?? 0}</td>
                      <td className="px-6 py-4 text-right">
                        {editingDusunId === dusun.id ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={savingDusun}
                              onClick={() => saveDusunName(dusun.id)}
                              className="text-primary hover:bg-primary/10 transition-colors"
                            >
                              {savingDusun ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={savingDusun}
                              onClick={cancelEditDusun}
                              className="text-muted-foreground hover:bg-secondary transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditDusun(dusun.id, dusun.nama)}
                            className="text-muted-foreground hover:bg-secondary/60 transition-colors"
                          >
                            <Pencil className="w-4 h-4 mr-1.5" /> Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* UMKM Table */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-white space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-xl font-bold text-foreground">Daftar UMKM Terdaftar</h2>
              {umkms.filter(u => u.status === "PENDING").length > 0 && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {umkms.filter(u => u.status === "PENDING").length} menunggu persetujuan
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Cari nama UMKM atau pemilik..."
                value={umkmSearch}
                onChange={e => setUmkmSearch(e.target.value)}
                className="rounded-lg sm:max-w-xs"
              />
              <Select value={umkmDusunFilter} onValueChange={setUmkmDusunFilter}>
                <SelectTrigger className="rounded-lg w-full sm:w-48">
                  <SelectValue placeholder="Semua Dusun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Dusun</SelectItem>
                  {dusuns.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={umkmStatusFilter} onValueChange={setUmkmStatusFilter}>
                <SelectTrigger className="rounded-lg w-full sm:w-48">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama UMKM</th>
                  <th className="px-6 py-4 font-semibold">Pemilik</th>
                  <th className="px-6 py-4 font-semibold">Dusun</th>
                  <th className="px-6 py-4 font-semibold">Kategori</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredUmkms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      {umkms.length === 0 ? "Belum ada UMKM terdaftar" : "Tidak ada UMKM yang cocok dengan pencarian/filter"}
                    </td>
                  </tr>
                ) : (
                  paginatedUmkms.map((umkm) => (
                    <tr key={umkm.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{umkm.nama}</td>
                      <td className="px-6 py-4">{umkm.pemilik}</td>
                      <td className="px-6 py-4">{umkm.dusun?.nama}</td>

                      <td className="px-6 py-4">
                        <span className="bg-accent/20 text-accent-foreground px-2 py-1 rounded-md text-xs font-semibold">
                          {umkm.kategori}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {umkm.status === "APPROVED" && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-semibold">Disetujui</span>
                        )}
                        {umkm.status === "PENDING" && (
                          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-xs font-semibold">Menunggu</span>
                        )}
                        {umkm.status === "REJECTED" && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-semibold">Ditolak</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end flex-wrap gap-1">
                          {umkm.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={updatingStatusId === umkm.id}
                                onClick={() => handleStatusChange(umkm.id, "APPROVED")}
                                className="text-green-700 hover:bg-green-100 transition-colors"
                              >
                                {updatingStatusId === umkm.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Setujui
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={updatingStatusId === umkm.id}
                                onClick={() => handleStatusChange(umkm.id, "REJECTED")}
                                className="text-red-700 hover:bg-red-100 transition-colors"
                              >
                                <X className="w-4 h-4 mr-1" /> Tolak
                              </Button>
                            </>
                          )}
                          {umkm.status === "REJECTED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={updatingStatusId === umkm.id}
                              onClick={() => handleStatusChange(umkm.id, "APPROVED")}
                              className="text-green-700 hover:bg-green-100 transition-colors"
                            >
                              {updatingStatusId === umkm.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Setujui
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditUmkm(umkm)}
                            className="text-muted-foreground hover:bg-secondary/60 transition-colors"
                          >
                            <Pencil className="w-4 h-4 mr-1.5" /> Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(umkm.id)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" /> Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && filteredUmkms.length > 0 && (
            <div className="px-6 pb-6">
              <p className="text-xs text-muted-foreground text-center mb-2">
                Menampilkan {paginatedUmkms.length} dari {filteredUmkms.length} UMKM
              </p>
              <Pagination page={umkmPage} totalPages={umkmTotalPages} onPageChange={setUmkmPage} />
            </div>
          )}
        </div>
      </div>

      {/* Edit UMKM Modal */}
      {editingUmkm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl shadow-lg border w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Edit UMKM</h3>
              <Button variant="ghost" size="sm" onClick={closeEditUmkm} className="hover:bg-secondary/60">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="umkm-nama">Nama UMKM</Label>
                <Input
                  id="umkm-nama"
                  value={umkmForm.nama}
                  onChange={e => setUmkmForm({ ...umkmForm, nama: e.target.value })}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-pemilik">Pemilik</Label>
                <Input
                  id="umkm-pemilik"
                  value={umkmForm.pemilik}
                  onChange={e => setUmkmForm({ ...umkmForm, pemilik: e.target.value })}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-whatsapp">Nomor WhatsApp</Label>
                <Input
                  id="umkm-whatsapp"
                  value={umkmForm.whatsapp}
                  onChange={e => setUmkmForm({ ...umkmForm, whatsapp: e.target.value.replace(/[^0-9]/g, "") })}
                  placeholder="Contoh: 6281234567890"
                  inputMode="numeric"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-alamat">Alamat</Label>
                <Input
                  id="umkm-alamat"
                  value={umkmForm.alamat}
                  onChange={e => setUmkmForm({ ...umkmForm, alamat: e.target.value })}
                  placeholder="Contoh: Jl. Mawar No. 12, Dusun Mojo"
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-deskripsi">Deskripsi</Label>
                <Textarea
                  id="umkm-deskripsi"
                  value={umkmForm.deskripsi}
                  onChange={e => setUmkmForm({ ...umkmForm, deskripsi: e.target.value })}
                  placeholder="Ceritakan singkat tentang usaha dan produk yang dijual..."
                  className="rounded-lg min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="umkm-mapsurl">Link Google Maps (opsional)</Label>
                <Input
                  id="umkm-mapsurl"
                  value={umkmForm.mapsUrl}
                  onChange={e => setUmkmForm({ ...umkmForm, mapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/... atau https://goo.gl/maps/..."
                  className="rounded-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Kalau diisi, alamat di halaman UMKM akan bisa diklik dan langsung membuka lokasi ini di Google Maps.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Dusun</Label>
                <Select
                  value={umkmForm.dusunId}
                  onValueChange={value => setUmkmForm({ ...umkmForm, dusunId: value })}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Pilih dusun" />
                  </SelectTrigger>
                  <SelectContent>
                    {dusuns.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select
                  value={umkmForm.kategori}
                  onValueChange={value => setUmkmForm({ ...umkmForm, kategori: value })}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_LIST.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <Button variant="ghost" onClick={closeEditUmkm} disabled={savingUmkm}>
                Batal
              </Button>
              <Button onClick={saveUmkm} disabled={savingUmkm} className="min-w-[110px]">
                {savingUmkm ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
