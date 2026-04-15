"use client";

import useSWR from "swr";
import { GatePanel } from "@/components/simulator/GatePanel";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SimulatorPage() {
  const { data: cards, mutate: mutateCards, error: cardError } = useSWR("/api/demo/kartu", fetcher);
  const { data: gates, error: gateError } = useSWR("/api/demo/gate", fetcher);

  if (cardError || gateError) return <div className="text-red-500">Gagal memuat data simulator</div>;
  if (!cards || !gates) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  const gateMasuk = gates.filter((g: any) => g.tipe === "MASUK");
  const gateKeluar = gates.filter((g: any) => g.tipe === "KELUAR");

  const handleRefresh = () => {
    mutateCards();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gate Simulator</h1>
        <p className="text-slate-500">Gunakan halaman ini untuk mensimulasikan hardware RFID & Gate.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <GatePanel 
          title="Gate Masuk" 
          type="MASUK" 
          gates={gateMasuk} 
          cards={cards} 
          onSuccess={handleRefresh}
        />
        <GatePanel 
          title="Gate Keluar" 
          type="KELUAR" 
          gates={gateKeluar} 
          cards={cards} 
          onSuccess={handleRefresh}
        />
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-700">
        <p className="font-bold mb-1">Cara Penggunaan:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Pilih lokasi gate yang ingin disimulasikan.</li>
          <li>Pilih kartu pengguna yang terdaftar (kartu yang sedanga parkir hanya muncul di panel Keluar).</li>
          <li>Klik tombol TAP untuk mengirim sinyal verifikasi ke server.</li>
          <li>Hasil verifikasi akan muncul seketika dan data akan terupdate secara real-time.</li>
        </ol>
      </div>
    </div>
  );
}
