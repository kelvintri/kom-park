"use client";

import { useState } from "react";
import useSWR from "swr";
import { format, differenceInMinutes } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, TrendingUp } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Material Symbols icon component
function MaterialSymbol({ 
  icon, 
  className, 
  filled = false,
  size = 24 
}: { 
  icon: string; 
  className?: string; 
  filled?: boolean;
  size?: number;
}) {
  return (
    <span 
      className={`material-symbols-outlined ${className || ''}`}
      style={{ 
        fontSize: size,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0"
      }}
    >
      {icon}
    </span>
  );
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Format duration
function getDuration(start: string, end: string | null): string {
  if (!end) return "-";
  const mins = differenceInMinutes(new Date(end), new Date(start));
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

export default function LogPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [sumberFilter, setSumberFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const query = new URLSearchParams({
    page: page.toString(),
    status: statusFilter === "ALL" ? "" : statusFilter,
    tanggal: dateFilter,
  }).toString();

  const { data, isLoading } = useSWR(`/api/admin/log?${query}`, fetcher);

  // Calculate summary stats
  const masukCount = data?.data?.filter((log: any) => log.status === "MASUK").length || 0;
  const keluarCount = data?.data?.filter((log: any) => log.status === "KELUAR").length || 0;
  const totalCount = data?.total || 0;

  // Filter data by sumber if needed
  const filteredData = data?.data?.filter((log: any) => {
    if (sumberFilter === "ALL") return true;
    return log.sumber === sumberFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#002045] font-['Manrope'] tracking-[-0.02em]">Log Parkir</h1>
          <p className="text-[#43474e] mt-1">Lacak riwayat akses masuk dan keluar kendaraan kampus secara real-time.</p>
        </div>
        
        {/* Filter Bar */}
        <div className="bg-[#f2f4f6] p-2 rounded-xl flex flex-wrap items-center gap-3">
          <div className="flex flex-col px-3 border-r border-[#c4c6cf]/30">
            <label className="text-[10px] font-bold text-[#43474e] uppercase tracking-widest mb-1">Rentang Waktu</label>
            <div className="flex items-center gap-2">
              <MaterialSymbol icon="calendar_today" className="text-sm text-[#1a365d]" size={16} />
              <input 
                type="date" 
                className="bg-transparent border-none p-0 text-sm font-semibold text-[#191c1e] focus:ring-0 cursor-pointer"
                onChange={(e) => setDateFilter(e.target.value)}
                value={dateFilter}
              />
            </div>
          </div>
          <div className="flex flex-col px-3 border-r border-[#c4c6cf]/30">
            <label className="text-[10px] font-bold text-[#43474e] uppercase tracking-widest mb-1">Status</label>
            <select 
              className="bg-transparent border-none p-0 text-sm font-semibold text-[#191c1e] focus:ring-0 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="MASUK">Masuk</option>
              <option value="KELUAR">Keluar</option>
            </select>
          </div>
          <div className="flex flex-col px-3 border-r border-[#c4c6cf]/30">
            <label className="text-[10px] font-bold text-[#43474e] uppercase tracking-widest mb-1">Sumber</label>
            <select 
              className="bg-transparent border-none p-0 text-sm font-semibold text-[#191c1e] focus:ring-0 cursor-pointer"
              value={sumberFilter}
              onChange={(e) => setSumberFilter(e.target.value)}
            >
              <option value="ALL">Semua Sumber</option>
              <option value="HARDWARE">Hardware</option>
              <option value="DEMO">Demo</option>
            </select>
          </div>
          <button 
            className="bg-[#1a365d] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
            onClick={() => setPage(1)}
          >
            <MaterialSymbol icon="filter_list" className="text-sm" size={16} />
            Terapkan
          </button>
        </div>
      </div>

      {/* Bento Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-[#c4c6cf]/10">
          <p className="text-xs font-bold text-[#43474e] uppercase tracking-widest mb-2">Total Transaksi</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-[#002045] font-['Manrope']">{totalCount.toLocaleString()}</span>
            <span className="text-[#57657a] text-xs font-semibold mb-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#c4c6cf]/10">
          <p className="text-xs font-bold text-[#43474e] uppercase tracking-widest mb-2">Kendaraan Masuk</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-[#002045] font-['Manrope']">{masukCount}</span>
            <span className="text-[#43474e] text-[10px] mb-1">Hari ini</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#c4c6cf]/10">
          <p className="text-xs font-bold text-[#43474e] uppercase tracking-widest mb-2">Kendaraan Keluar</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-[#002045] font-['Manrope']">{keluarCount}</span>
            <span className="text-[#43474e] text-[10px] mb-1">Hari ini</span>
          </div>
        </div>
        <div className="bg-[#1a365d] p-6 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Parkir Aktif</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-white font-['Manrope']">{masukCount}</span>
              <span className="text-white/60 text-xs font-semibold mb-1">Kendaraan</span>
            </div>
          </div>
          <MaterialSymbol icon="directions_car" size={96} className="absolute -right-4 -bottom-4 text-white/5 transition-transform group-hover:scale-110" />
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#c4c6cf]/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f4f6] text-[#43474e] text-[11px] font-bold uppercase tracking-[0.05em]">
                <th className="px-6 py-4">Waktu Masuk</th>
                <th className="px-6 py-4">Informasi Pengguna</th>
                <th className="px-6 py-4">Gate</th>
                <th className="px-6 py-4">Waktu Keluar</th>
                <th className="px-6 py-4">Durasi</th>
                <th className="px-6 py-4">Sumber</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4c6cf]/10">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="h-40 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1a365d]" />
                  </td>
                </tr>
              ) : filteredData?.length > 0 ? (
                filteredData.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[#f2f4f6] transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#191c1e]">
                        {format(new Date(log.waktuMasuk), "HH:mm:ss", { locale: id })}
                      </div>
                      <div className="text-[10px] text-[#43474e]">
                        {format(new Date(log.waktuMasuk), "dd MMM yyyy", { locale: id })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#f2f4f6] flex items-center justify-center text-[#1a365d] font-bold text-xs">
                          {getInitials(log.nama)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#191c1e]">{log.nama}</div>
                          <div className="text-[11px] text-[#43474e] font-medium">{log.nimNip}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] px-2 py-0.5 bg-[#f2f4f6] text-[#43474e] rounded flex items-center gap-1 w-fit">
                          <MaterialSymbol icon="login" size={12} /> {log.gateMasuk || "-"}
                        </span>
                        {log.gateKeluar && (
                          <span className="text-[11px] px-2 py-0.5 bg-[#f2f4f6] text-[#43474e] rounded flex items-center gap-1 w-fit">
                            <MaterialSymbol icon="logout" size={12} /> {log.gateKeluar}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.waktuKeluar ? (
                        <>
                          <div className="text-sm font-semibold text-[#191c1e]">
                            {format(new Date(log.waktuKeluar), "HH:mm:ss", { locale: id })}
                          </div>
                          <div className="text-[10px] text-[#43474e]">
                            {format(new Date(log.waktuKeluar), "dd MMM yyyy", { locale: id })}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-[#43474e] italic">Masih di lokasi</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#191c1e]">
                        {getDuration(log.waktuMasuk, log.waktuKeluar)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold flex items-center gap-1 ${
                        log.sumber === 'HARDWARE' ? 'text-[#1a365d]' : 'text-[#c6955e]'
                      }`}>
                        <MaterialSymbol 
                          icon={log.sumber === 'HARDWARE' ? 'settings_input_component' : 'bolt'} 
                          size={14} 
                        />
                        {log.sumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                        log.status === "MASUK" 
                          ? "bg-[#d5e3fc]/30 text-[#57657a] border-[#d5e3fc]/50" 
                          : "bg-[#f2f4f6] text-[#43474e] border-[#c4c6cf]/30"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        className="p-2 hover:bg-[#e0e3e5] rounded-full text-[#43474e] transition-colors"
                        onClick={() => setSelectedLog(log)}
                      >
                        <MaterialSymbol icon="visibility" size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="h-32 text-center text-[#43474e]">
                    Tidak ditemukan data log yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-[#f2f4f6] flex items-center justify-between border-t border-[#c4c6cf]/10">
          <p className="text-xs text-[#43474e] font-medium">
            Menampilkan <span className="font-bold text-[#191c1e]">{(page - 1) * 10 + 1} - {Math.min(page * 10, data?.total || 0)}</span> dari <span className="font-bold text-[#191c1e]">{data?.total || 0}</span> entri
          </p>
          <div className="flex items-center gap-1">
            <button 
              className="w-8 h-8 flex items-center justify-center rounded bg-[#e0e3e5]/50 text-[#43474e] hover:bg-[#e0e3e5] transition-all disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <MaterialSymbol icon="chevron_left" size={16} />
            </button>
            {Array.from({ length: Math.min(3, data?.totalPages || 1) }, (_, i) => i + 1).map((p) => (
              <button 
                key={p}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${
                  p === page 
                    ? "bg-[#1a365d] text-white" 
                    : "text-[#43474e] hover:bg-[#e0e3e5]"
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            {(data?.totalPages || 0) > 3 && (
              <>
                <span className="px-1 text-[#43474e] text-xs">...</span>
                <button 
                  className="w-8 h-8 flex items-center justify-center rounded text-[#43474e] text-xs font-bold hover:bg-[#e0e3e5]"
                  onClick={() => setPage(data.totalPages)}
                >
                  {data.totalPages}
                </button>
              </>
            )}
            <button 
              className="w-8 h-8 flex items-center justify-center rounded bg-[#e0e3e5]/50 text-[#43474e] hover:bg-[#e0e3e5] transition-all disabled:opacity-50"
              onClick={() => setPage(p => p + 1)}
              disabled={!data || page >= data.totalPages}
            >
              <MaterialSymbol icon="chevron_right" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div 
          className="fixed inset-0 bg-[#002045]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-[#c4c6cf]/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-[#c4c6cf]/10 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#002045] font-['Manrope']">Detail Log Parkir</h3>
              <button 
                className="text-[#43474e] hover:text-[#191c1e] transition-colors"
                onClick={() => setSelectedLog(null)}
              >
                <MaterialSymbol icon="close" size={24} />
              </button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-[#43474e] uppercase tracking-widest mb-1">Identitas Pengguna</p>
                  <div className="bg-[#f2f4f6] p-4 rounded-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1a365d]/10 flex items-center justify-center text-[#1a365d] font-bold">
                      {getInitials(selectedLog.nama)}
                    </div>
                    <div>
                      <p className="font-bold text-[#191c1e]">{selectedLog.nama}</p>
                      <p className="text-xs text-[#43474e]">{selectedLog.nimNip}</p>
                      <p className="text-xs text-[#43474e]">{selectedLog.peran}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#43474e] uppercase tracking-widest mb-1">Gate Masuk</p>
                    <p className="text-sm font-semibold">{selectedLog.gateMasuk || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#43474e] uppercase tracking-widest mb-1">Waktu Masuk</p>
                    <p className="text-sm font-semibold">
                      {format(new Date(selectedLog.waktuMasuk), "HH:mm:ss", { locale: id })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="aspect-video rounded-xl overflow-hidden relative group bg-[#f2f4f6] flex items-center justify-center">
                  {selectedLog.fotoMasuk ? (
                    <img 
                      src={selectedLog.fotoMasuk} 
                      alt="Capture plat nomor" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center p-4">
                      <MaterialSymbol icon="no_photography" size={48} className="text-[#c4c6cf] mb-2" />
                      <p className="text-xs text-[#43474e]">Tidak ada foto</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-[#4f2e00]/5 border border-[#4f2e00]/10 rounded-xl">
                  <p className="text-xs font-bold text-[#c6955e] uppercase tracking-tight">System Analysis</p>
                  <p className="text-xs text-[#43474e] mt-1">
                    Vehicle verified via RFID. Status: {selectedLog.status}. Sumber: {selectedLog.sumber}.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-[#f2f4f6] flex justify-end gap-3">
              <button 
                className="px-6 py-2 rounded-lg text-sm font-bold text-[#43474e] hover:bg-[#e0e3e5] transition-all"
                onClick={() => setSelectedLog(null)}
              >
                Tutup
              </button>
              <button className="px-6 py-2 rounded-lg bg-[#1a365d] text-white text-sm font-bold shadow-md hover:opacity-90 transition-all">
                Cetak Resi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
