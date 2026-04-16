"use client";

import { useState } from "react";
import useSWR from "swr";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PenggunaPage() {
  const { data, isLoading, mutate } = useSWR("/api/admin/pengguna", fetcher);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    nimNip: "",
    peran: "MAHASISWA",
    uidKartu: ""
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        mutate();
        setIsAddOpen(false);
        setFormData({ nama: "", nimNip: "", peran: "MAHASISWA", uidKartu: "" });
      }
    } catch (error) {
      console.error("Add user error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "AKTIF" ? "NONAKTIF" : "AKTIF";
    try {
      await fetch(`/api/admin/pengguna/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      mutate();
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
            <p className="text-slate-500">Kelola data mahasiswa/staf dan kartu RFID mereka.</p>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
              <UserPlus className="w-4 h-4 mr-2" /> Tambah Pengguna
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Lengkap</label>
                  <Input 
                    required
                    placeholder="Contoh: Andi Wijaya" 
                    value={formData.nama}
                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">NIM / NIP</label>
                  <Input 
                    required
                    placeholder="Contoh: 2021009" 
                    value={formData.nimNip}
                    onChange={e => setFormData({ ...formData, nimNip: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Peran</label>
                  <Select 
                    value={formData.peran} 
                    onValueChange={(value) => setFormData({ ...formData, peran: value ?? "MAHASISWA" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAHASISWA">Mahasiswa</SelectItem>
                      <SelectItem value="DOSEN">Dosen</SelectItem>
                      <SelectItem value="STAF">Staf</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">UID Kartu RFID</label>
                  <Input 
                    required
                    placeholder="Contoh: AA:BB:CC:DD" 
                    value={formData.uidKartu}
                    onChange={e => setFormData({ ...formData, uidKartu: e.target.value })}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Batal</Button>
                  <Button type="submit" className="bg-blue-600" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Pengguna"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-md border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NIM/NIP</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>UID Kartu</TableHead>
                <TableHead>Status User</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  </TableCell>
                </TableRow>
              ) : data?.length > 0 ? (
                data.map((user: { id: string; nama: string; nimNip: string; peran: string; status: string; kartuRfid?: { uidKartu: string }[] }) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nama}</TableCell>
                    <TableCell>{user.nimNip}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.peran}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {user.kartuRfid?.[0]?.uidKartu || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "AKTIF" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleStatus(user.id, user.status)}
                          className={user.status === "AKTIF" ? "text-amber-600" : "text-green-600"}
                        >
                          {user.status === "AKTIF" ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                    Belum ada data pengguna.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
  );
}
