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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, differenceInMinutes } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LogPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const query = new URLSearchParams({
    page: page.toString(),
    status: statusFilter,
    tanggal: dateFilter,
  }).toString();

  const { data, isLoading } = useSWR(`/api/admin/log?${query}`, fetcher);

  const getDuration = (start: string, end: string | null) => {
    if (!end) return "-";
    const mins = differenceInMinutes(new Date(end), new Date(start));
    if (mins < 60) return `${mins} mnt`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours} jam ${remainingMins} mnt`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log Parkir</h1>
          <p className="text-slate-500">Riwayat akses masuk dan keluar kendaraan.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 px-1">Filter Status</label>
            <Select onValueChange={(value) => setStatusFilter(value ?? "")} value={statusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="MASUK">Di Dalam</SelectItem>
                <SelectItem value="KELUAR">Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 px-1">Filter Tanggal</label>
            <Input 
              type="date" 
              className="w-44" 
              onChange={(e) => setDateFilter(e.target.value)}
              value={dateFilter}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu Masuk</TableHead>
              <TableHead>Nama / Identitas</TableHead>
              <TableHead>Gate (Masuk/Keluar)</TableHead>
              <TableHead>Waktu Keluar</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                </TableCell>
              </TableRow>
            ) : data?.data?.length > 0 ? (
              data.data.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.waktuMasuk), "dd/MM/yyyy", { locale: id })}
                    <div className="text-xs font-bold text-blue-600">
                      {format(new Date(log.waktuMasuk), "HH:mm:ss", { locale: id })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold">{log.nama}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                       {log.nimNip} <Badge variant="outline" className="text-[9px] py-0 px-1">{log.peran}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-400">IN: {log.gateMasuk || "-"}</div>
                    <div className="text-xs text-slate-400">OUT: {log.gateKeluar || "-"}</div>
                  </TableCell>
                  <TableCell>
                    {log.waktuKeluar ? (
                      <div className="text-xs font-bold text-slate-600">
                        {format(new Date(log.waktuKeluar), "HH:mm:ss", { locale: id })}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {getDuration(log.waktuMasuk, log.waktuKeluar)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={log.status === "MASUK" ? "default" : "outline"}
                      className={log.status === "MASUK" ? "bg-blue-600" : "bg-green-50 text-green-700 border-green-200"}
                    >
                      {log.status === "MASUK" ? "Di Dalam" : "Sudah Keluar"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Sheet>
                      <SheetTrigger render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0" />}>
                        <Eye className="w-4 h-4" />
                      </SheetTrigger>
                      <SheetContent className="w-[400px]">
                        <SheetHeader>
                          <SheetTitle>Detail Log Parkir</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-sm font-bold uppercase text-slate-400">Pengguna</h4>
                            <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="font-bold">{log.nama}</p>
                              <p className="text-sm text-slate-500">{log.nimNip} — {log.peran}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-bold uppercase text-slate-400">Foto Masuk</h4>
                              <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400">
                                {log.fotoMasuk ? <img src={log.fotoMasuk} className="rounded-lg object-cover" /> : "Tidak ada foto"}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-bold uppercase text-slate-400">Foto Keluar</h4>
                              <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400">
                                {log.fotoKeluar ? <img src={log.fotoKeluar} className="rounded-lg object-cover" /> : "Tidak ada foto"}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-bold uppercase text-slate-400">Metadata</h4>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-500">ID Transaksi</span>
                                <span className="font-mono text-[10px]">{log.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Sumber Data</span>
                                <Badge variant="outline">{log.sumber}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                  Tidak ditemukan data log yang sesuai filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, data?.total || 0)} dari {data?.total || 0} data
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Prev
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={!data || page >= data.totalPages}
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
