"use client";

import useSWR from "swr";
import { GatePanel } from "@/components/simulator/GatePanel";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SimulatorPage() {
  const { data: cards, mutate: mutateCards, error: cardError } = useSWR("/api/demo/kartu", fetcher);
  const { data: gates, error: gateError } = useSWR("/api/demo/gate", fetcher);
  const { data: statsData } = useSWR("/api/demo/stats", fetcher);

  if (cardError || gateError) return <div className="text-red-500">Gagal memuat data simulator</div>;
  if (!cards || !gates) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[#1a365d]" />
    </div>
  );

  const handleRefresh = () => {
    mutateCards();
  };

  // Calculate stats or use API data
  const parkedCards = cards.filter((c: any) => c.sedangParkir);
  const totalCards = cards.length;
  const occupancy = totalCards > 0 ? Math.round((parkedCards.length / totalCards) * 100) : 0;
  
  const stats = statsData || {
    occupancy,
    students: parkedCards.filter((c: any) => c.peran === "MAHASISWA").length,
    staff: parkedCards.filter((c: any) => c.peran === "DOSEN" || c.peran === "STAF").length,
    guests: parkedCards.filter((c: any) => c.peran === "TAMU").length,
    fastestExit: "2.4s",
    latency: "Low"
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#002045] font-['Manrope'] tracking-[-0.02em]">Gate Simulator</h1>
        <p className="text-[#43474e]">Perform live entry and exit simulations for the RFID infrastructure.</p>
      </div>

      <GatePanel 
        gates={gates} 
        cards={cards} 
        onSuccess={handleRefresh}
        stats={stats}
      />
    </div>
  );
}
