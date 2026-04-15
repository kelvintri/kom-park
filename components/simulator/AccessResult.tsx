"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessResultProps {
  result: {
    access: boolean;
    nama?: string;
    nimNip?: string;
    reason?: string;
  };
}

const reasonLabels: Record<string, string> = {
  kartu_tidak_ditemukan: "Kartu tidak terdaftar",
  kartu_diblokir: "Kartu diblokir admin",
  kartu_belum_keluar: "Kendaraan masih di dalam",
  tidak_ada_log_masuk: "Tidak ada data masuk",
  invalid_secret: "Secret gate salah",
  server_error: "Kesalahan sistem",
};

export function AccessResult({ result }: AccessResultProps) {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-2",
        result.access ? "bg-green-500/10 border border-green-500/50" : "bg-red-500/10 border border-red-500/50"
      )}
    >
      {result.access ? (
        <>
          <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
          <div>
            <p className="text-green-600 font-bold text-lg leading-tight">AKSES DIBERIKAN</p>
            <p className="text-green-700 text-sm font-medium">{result.nama} — {result.nimNip}</p>
          </div>
        </>
      ) : (
        <>
          <XCircle className="w-8 h-8 text-red-500 shrink-0" />
          <div>
            <p className="text-red-600 font-bold text-lg leading-tight">AKSES DITOLAK</p>
            <p className="text-red-700 text-sm font-medium">
              Alasan: {reasonLabels[result.reason || ""] || result.reason || "Unknown error"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
