"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { AccessResult } from "./AccessResult";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
      className={cn("material-symbols-outlined", className)}
      style={{ 
        fontSize: size,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0"
      }}
    >
      {icon}
    </span>
  );
}

interface GatePanelProps {
  gates: any[];
  cards: any[];
  onSuccess: () => void;
  stats?: {
    occupancy: number;
    students: number;
    staff: number;
    guests: number;
    fastestExit: string;
    latency: string;
  };
}

export function GatePanel({ gates, cards, onSuccess, stats }: GatePanelProps) {
  // Gate Masuk state
  const [selectedGateMasuk, setSelectedGateMasuk] = useState<string>("");
  const [selectedCardMasuk, setSelectedCardMasuk] = useState<string>("");
  const [loadingMasuk, setLoadingMasuk] = useState(false);
  const [resultMasuk, setResultMasuk] = useState<any>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Gate Keluar state
  const [selectedGateKeluar, setSelectedGateKeluar] = useState<string>("");
  const [selectedCardKeluar, setSelectedCardKeluar] = useState<string>("");
  const [loadingKeluar, setLoadingKeluar] = useState(false);
  const [resultKeluar, setResultKeluar] = useState<any>(null);
  const [logId, setLogId] = useState<string>("--");

  const masukCards = cards.filter(c => !c.sedangParkir && c.statusKartu === "AKTIF");
  const keluarCards = cards.filter(c => c.sedangParkir && c.statusKartu === "AKTIF");
  const masukGates = gates.filter(g => g.tipe === "MASUK");
  const keluarGates = gates.filter(g => g.tipe === "KELUAR");

  const handleTapMasuk = async () => {
    if (!selectedGateMasuk || !selectedCardMasuk) return;

    setLoadingMasuk(true);
    setResultMasuk(null);
    setCapturedPhoto(null);

    try {
      const formData = new FormData();
      formData.append("uid", selectedCardMasuk);
      formData.append("gate_id", selectedGateMasuk);
      formData.append("type", "masuk");

      const res = await fetch("/api/gate/verify", {
        method: "POST",
        headers: {
          "X-Gate-Secret": process.env.NEXT_PUBLIC_GATE_SECRET || "parkir-kampus-2026"
        },
        body: formData
      });

      const data = await res.json();
      setResultMasuk(data);
      
      // Simulate photo capture on successful access
      if (data.access) {
        setCapturedPhoto(`https://lh3.googleusercontent.com/aida-public/AB6AXuAA14OBmkeFVKZpcGU8Ai9drbcr3DwyqeBoa8zJlOaIlAvHuc_5H5CvP8CaGEMdTwP7R_dZbHSszETilQ6yKdbsbrqAAnSJO4gln6kgeqaY-_7QFN7QZseUegNp5ju7d4V5Vq7EXKtBYqijjEmUhyyk-1nyhqqY5eM9ib_ers11i_f45ZKmsAMH5gcu7rnIXJqzlENC6QyiirmGkyCg8kP4VLujFRs0RfTryYsogwPf2EUNiBywfSz_xBJkzhydt_5h3O5geH5lCdI`);
        onSuccess();
        setSelectedCardMasuk("");
      }
    } catch (error) {
      console.error("Tap error:", error);
      setResultMasuk({ access: false, reason: "network_error" });
    } finally {
      setLoadingMasuk(false);
    }
  };

  const handleTapKeluar = async () => {
    if (!selectedGateKeluar || !selectedCardKeluar) return;

    setLoadingKeluar(true);
    setResultKeluar(null);
    setLogId("--");

    try {
      const formData = new FormData();
      formData.append("uid", selectedCardKeluar);
      formData.append("gate_id", selectedGateKeluar);
      formData.append("type", "keluar");

      const res = await fetch("/api/gate/verify", {
        method: "POST",
        headers: {
          "X-Gate-Secret": process.env.NEXT_PUBLIC_GATE_SECRET || "parkir-kampus-2026"
        },
        body: formData
      });

      const data = await res.json();
      setResultKeluar(data);
      
      if (data.logId) {
        setLogId(data.logId);
      }
      
      if (data.access) {
        onSuccess();
        setSelectedCardKeluar("");
      }
    } catch (error) {
      console.error("Tap error:", error);
      setResultKeluar({ access: false, reason: "network_error" });
    } finally {
      setLoadingKeluar(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Gate Masuk */}
        <section className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#002045]/5 flex items-center justify-center">
                <MaterialSymbol icon="login" className="text-[#002045] text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#002045] font-['Manrope'] tracking-[-0.02em]">Gate Masuk</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#43474e] px-1">Pilih Kartu</label>
                <select 
                  className="w-full bg-[#f2f4f6] border-none rounded-xl py-4 px-4 text-[#191c1e] focus:ring-2 focus:ring-[#1a365d] appearance-none cursor-pointer"
                  value={selectedCardMasuk}
                  onChange={(e) => setSelectedCardMasuk(e.target.value)}
                >
                  <option value="">Pilih kartu...</option>
                  {masukCards.length > 0 ? (
                    masukCards.map((card) => (
                      <option key={card.uid} value={card.uid}>
                        {card.nama} — {card.nimNip} ({card.peran})
                      </option>
                    ))
                  ) : (
                    <option disabled>Tidak ada kartu tersedia</option>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#43474e] px-1">Pilih Gate Masuk</label>
                <select 
                  className="w-full bg-[#f2f4f6] border-none rounded-xl py-4 px-4 text-[#191c1e] focus:ring-2 focus:ring-[#1a365d] appearance-none cursor-pointer"
                  value={selectedGateMasuk}
                  onChange={(e) => setSelectedGateMasuk(e.target.value)}
                >
                  <option value="">Pilih gate masuk...</option>
                  {masukGates.map((gate) => (
                    <option key={gate.id} value={gate.id}>
                      {gate.nama} — {gate.lokasi}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                className="w-full py-5 bg-[#1a365d] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleTapMasuk}
                disabled={loadingMasuk || !selectedGateMasuk || !selectedCardMasuk}
              >
                {loadingMasuk ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <MaterialSymbol icon="sensors" className="group-hover:translate-x-1 transition-transform" />
                    <span>Tap Masuk</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Feedback Area Masuk */}
          <div className="bg-[#e6e8ea]/50 rounded-2xl p-8 min-h-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#43474e]">Live Captured Photo</span>
              <span className="flex items-center gap-2 text-[10px] text-[#57657a] bg-[#57657a]/10 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#57657a] animate-pulse"></span>
                READY
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#c4c6cf]/30 rounded-xl overflow-hidden relative group">
              {capturedPhoto ? (
                <img 
                  className="absolute inset-0 w-full h-full object-cover" 
                  src={capturedPhoto} 
                  alt="Captured photo"
                />
              ) : (
                <>
                  <img 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA14OBmkeFVKZpcGU8Ai9drbcr3DwyqeBoa8zJlOaIlAvHuc_5H5CvP8CaGEMdTwP7R_dZbHSszETilQ6yKdbsbrqAAnSJO4gln6kgeqaY-_7QFN7QZseUegNp5ju7d4V5Vq7EXKtBYqijjEmUhyyk-1nyhqqY5eM9ib_ers11i_f45ZKmsAMH5gcu7rnIXJqzlENC6QyiirmGkyCg8kP4VLujFRs0RfTryYsogwPf2EUNiBywfSz_xBJkzhydt_5h3O5geH5lCdI"
                    alt="Camera view"
                  />
                  <div className="relative z-10 text-center p-6 backdrop-blur-md bg-white/40 rounded-2xl border border-white/50 max-w-[240px]">
                    <MaterialSymbol icon="no_photography" className="text-[#002045] text-4xl mb-2" />
                    <p className="text-sm font-semibold text-[#002045]">No capture yet</p>
                    <p className="text-[10px] text-[#43474e] mt-1 leading-relaxed">Waiting for RFID tap to trigger high-resolution camera capture.</p>
                  </div>
                </>
              )}
            </div>
            {resultMasuk && <div className="mt-4"><AccessResult result={resultMasuk} /></div>}
          </div>
        </section>

        {/* Right Column: Gate Keluar */}
        <section className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#c6955e]/10 flex items-center justify-center">
                <MaterialSymbol icon="logout" className="text-[#c6955e] text-3xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#002045] font-['Manrope'] tracking-[-0.02em]">Gate Keluar</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#43474e] px-1">Pilih Kartu</label>
                <select 
                  className="w-full bg-[#f2f4f6] border-none rounded-xl py-4 px-4 text-[#191c1e] focus:ring-2 focus:ring-[#1a365d] appearance-none cursor-pointer"
                  value={selectedCardKeluar}
                  onChange={(e) => setSelectedCardKeluar(e.target.value)}
                >
                  <option value="">— Select Active Vehicle —</option>
                  {keluarCards.length > 0 ? (
                    keluarCards.map((card) => (
                      <option key={card.uid} value={card.uid}>
                        {card.nama} — {card.nimNip} ({card.peran})
                      </option>
                    ))
                  ) : (
                    <option disabled>Tidak ada kendaraan di dalam</option>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#43474e] px-1">Pilih Gate Keluar</label>
                <select 
                  className="w-full bg-[#f2f4f6] border-none rounded-xl py-4 px-4 text-[#191c1e] focus:ring-2 focus:ring-[#1a365d] appearance-none cursor-pointer"
                  value={selectedGateKeluar}
                  onChange={(e) => setSelectedGateKeluar(e.target.value)}
                >
                  <option value="">Pilih gate keluar...</option>
                  {keluarGates.map((gate) => (
                    <option key={gate.id} value={gate.id}>
                      {gate.nama} — {gate.lokasi}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                className="w-full py-5 bg-[#c6955e] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleTapKeluar}
                disabled={loadingKeluar || !selectedGateKeluar || !selectedCardKeluar}
              >
                {loadingKeluar ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <MaterialSymbol icon="exit_to_app" className="group-hover:translate-x-1 transition-transform" />
                    <span>Tap Keluar</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Feedback Area Keluar */}
          <div className="bg-[#e6e8ea]/50 rounded-2xl p-8 min-h-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#43474e]">System Response</span>
              <span className="text-[10px] text-[#43474e]">LOG ID: {logId}</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#c4c6cf]/30 rounded-xl bg-[#f2f4f6]/50">
              {resultKeluar ? (
                <AccessResult result={resultKeluar} />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-[#e6e8ea] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#c4c6cf]/20">
                    <MaterialSymbol icon="terminal" className="text-[#74777f] text-3xl" />
                  </div>
                  <h3 className="text-lg font-bold text-[#43474e] mb-2">Standby Mode</h3>
                  <p className="text-sm text-[#43474e]/70 max-w-xs mx-auto">
                    Initiate a "Tap Keluar" to view transaction details, duration, and access status here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#002045] text-white p-8 rounded-2xl overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Live Status</p>
              <h3 className="text-4xl font-black font-['Manrope'] mb-4">{stats.occupancy}% Occupancy</h3>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-md">
                  <span className="text-2xl font-bold">{stats.students}</span>
                  <span className="text-[10px] block opacity-60">Students</span>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-md">
                  <span className="text-2xl font-bold">{stats.staff}</span>
                  <span className="text-[10px] block opacity-60">Staff</span>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-md">
                  <span className="text-2xl font-bold">{stats.guests}</span>
                  <span className="text-[10px] block opacity-60">Guests</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 opacity-10">
              <MaterialSymbol icon="local_parking" size={160} className="text-white" />
            </div>
          </div>
          <div className="bg-[#c6955e] p-8 rounded-2xl flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Gate Performance</p>
            <h3 className="text-white text-2xl font-bold leading-tight">Fastest exit logged at {stats.fastestExit} today</h3>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] text-white/50 uppercase font-bold tracking-tighter">Current Latency: <span className="text-white">{stats.latency}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

