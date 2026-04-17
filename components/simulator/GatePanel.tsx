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
    totalParked: number;
    displayCount?: string;
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
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showTicket, setShowTicket] = useState<string | null>(null);

  // Gate Keluar state
  const [selectedGateKeluar, setSelectedGateKeluar] = useState<string>("");
  const [selectedCardKeluar, setSelectedCardKeluar] = useState<string>("");
  const [ticketIdInput, setTicketIdInput] = useState<string>("");
  const [isTicketExitMode, setIsTicketExitMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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

  const handleGuestEntry = async () => {
    if (!selectedGateMasuk) return;

    setLoadingMasuk(true);
    setResultMasuk(null);
    setCapturedPhoto(null);

    try {
      const formData = new FormData();
      formData.append("gate_id", selectedGateMasuk);
      formData.append("type", "masuk");
      formData.append("is_guest", "true");

      const res = await fetch("/api/gate/verify", {
        method: "POST",
        headers: {
          "X-Gate-Secret": process.env.NEXT_PUBLIC_GATE_SECRET || "parkir-kampus-2026"
        },
        body: formData
      });

      const data = await res.json();
      setResultMasuk(data);
      
      if (data.access) {
        setCapturedPhoto(`https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400`);
        onSuccess();
        if (data.logId) {
          setShowTicket(data.logId);
        }
      }
    } catch (error) {
      console.error("Guest entry error:", error);
      setResultMasuk({ access: false, reason: "network_error" });
    } finally {
      setLoadingMasuk(false);
    }
  };

  const handleScanQR = () => {
    setIsScanning(true);
    // Simulate scan delay
    setTimeout(() => {
      // If we have a ticket from this session, we can "auto-detect" it for the demo
      if (showTicket) {
        setTicketIdInput(showTicket);
      }
      setIsScanning(false);
    }, 1500);
  };

  const handleTapKeluar = async () => {
    if (!selectedGateKeluar || (!selectedCardKeluar && !ticketIdInput)) return;

    setLoadingKeluar(true);
    setResultKeluar(null);
    setLogId("--");

    try {
      const formData = new FormData();
      if (isTicketExitMode) {
        formData.append("ticket_id", ticketIdInput);
      } else {
        formData.append("uid", selectedCardKeluar);
      }
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
        setTicketIdInput("");
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
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setIsGuestMode(false)}
                  className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border-2 transition-all", !isGuestMode ? "bg-[#1a365d] border-[#1a365d] text-white" : "border-[#1a365d]/10 text-[#1a365d]/50")}
                >
                  Member (RFID)
                </button>
                <button 
                  onClick={() => setIsGuestMode(true)}
                  className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border-2 transition-all", isGuestMode ? "bg-emerald-600 border-emerald-600 text-white" : "border-emerald-600/10 text-emerald-600/50")}
                >
                  Guest (Ticket)
                </button>
              </div>

              {!isGuestMode ? (
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
              ) : (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <MaterialSymbol icon="confirmation_number" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900 leading-none">Public Guest Mode</p>
                    <p className="text-[10px] text-emerald-700/70 mt-1">Press button to issue temporary ticket.</p>
                  </div>
                </div>
              )}
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
                className={cn(
                  "w-full py-5 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed",
                  isGuestMode ? "bg-emerald-600" : "bg-[#1a365d]"
                )}
                onClick={isGuestMode ? handleGuestEntry : handleTapMasuk}
                disabled={loadingMasuk || !selectedGateMasuk || (!isGuestMode && !selectedCardMasuk)}
              >
                {loadingMasuk ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <MaterialSymbol icon={isGuestMode ? "confirmation_number" : "sensors"} className="group-hover:translate-x-1 transition-transform" />
                    <span>{isGuestMode ? "Ambil Tiket Tamu" : "Tap Masuk"}</span>
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
              <div className="flex items-center gap-2 mb-2">
                <button 
                  onClick={() => setIsTicketExitMode(false)}
                  className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border-2 transition-all", !isTicketExitMode ? "bg-[#c6955e] border-[#c6955e] text-white" : "border-[#c6955e]/10 text-[#c6955e]/50")}
                >
                  Member (RFID)
                </button>
                <button 
                  onClick={() => {
                    setIsTicketExitMode(true);
                    setSelectedCardKeluar("");
                  }}
                  className={cn("flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border-2 transition-all", isTicketExitMode ? "bg-emerald-600 border-emerald-600 text-white" : "border-emerald-600/10 text-emerald-600/50")}
                >
                  Guest (Ticket ID)
                </button>
              </div>

              {!isTicketExitMode ? (
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
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#43474e] px-1">Input Ticket ID (UUID)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Contoh: 550e8400..."
                      className="flex-1 bg-[#f2f4f6] border-none rounded-xl py-4 px-4 text-[#191c1e] focus:ring-2 focus:ring-[#1a365d] text-sm"
                      value={ticketIdInput}
                      onChange={(e) => setTicketIdInput(e.target.value)}
                    />
                    <button 
                      onClick={handleScanQR}
                      className={cn(
                        "p-4 rounded-xl flex items-center justify-center transition-all",
                        isScanning ? "bg-emerald-100 text-emerald-600 animate-pulse" : "bg-[#1a365d] text-white hover:brightness-110"
                      )}
                      title="Scan QR Ticket"
                    >
                      <MaterialSymbol icon={isScanning ? "sync" : "qr_code_scanner"} />
                    </button>
                  </div>
                  {isScanning && (
                    <div className="mt-2 text-[10px] text-emerald-600 font-bold animate-pulse flex items-center justify-center gap-2 bg-emerald-50 py-2 rounded-lg">
                      <MaterialSymbol icon="camera" size={14} />
                      Simulasi Memindai QR...
                    </div>
                  )}
                </div>
              )}
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
                className={cn(
                  "w-full py-5 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed",
                  isTicketExitMode ? "bg-emerald-600" : "bg-[#c6955e]"
                )}
                onClick={handleTapKeluar}
                disabled={loadingKeluar || !selectedGateKeluar || (!isTicketExitMode && !selectedCardKeluar) || (isTicketExitMode && !ticketIdInput)}
              >
                {loadingKeluar ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <MaterialSymbol icon={isTicketExitMode ? "confirmation_number" : "exit_to_app"} className="group-hover:translate-x-1 transition-transform" />
                    <span>{isTicketExitMode ? "Tap Keluar (Tiket)" : "Tap Keluar"}</span>
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
                    Initiate a &quot;Tap Keluar&quot; to view transaction details, duration, and access status here.
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
              <h3 className="text-4xl font-black font-['Manrope'] mb-4">
                {stats.occupancy}% Occupancy
                <span className="text-xl ml-3 opacity-40 font-bold tracking-tight">({stats.displayCount || stats.totalParked + "/300"})</span>
              </h3>
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
      {/* Ticket Modal */}
      {showTicket && (
        <div className="fixed inset-0 bg-[#002045]/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl w-full max-w-[320px] shadow-2xl overflow-hidden border border-white/20 relative animate-in zoom-in-95 duration-300">
             <div className="p-6 text-center bg-emerald-600 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MaterialSymbol icon="print" />
                </div>
                <h3 className="text-xl font-bold font-['Manrope']">Tiket Parkir</h3>
                <p className="text-xs text-white/70">Spark Campus Parking System</p>
             </div>
             
             <div className="p-8 flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] mb-6 border border-[#f2f4f6]">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${showTicket}`}
                    alt="Ticket QR Code"
                    className="w-48 h-48"
                  />
                </div>
                
                <div className="w-full space-y-3 pb-6 border-b border-dashed border-[#c4c6cf]">
                   <div className="flex justify-between">
                     <span className="text-[10px] font-bold text-[#57657a] uppercase tracking-widest">Entry Time</span>
                     <span className="text-xs font-bold text-[#191c1e]">{new Date().toLocaleTimeString()}</span>
                   </div>
                   <div className="flex justify-between items-start gap-4">
                     <span className="text-[10px] font-bold text-[#57657a] uppercase tracking-widest">Ticket ID</span>
                     <span className="text-[10px] font-mono font-bold text-[#191c1e] text-right break-all">{showTicket}</span>
                   </div>
                </div>
                
                <button 
                  onClick={() => setShowTicket(null)}
                  className="mt-8 w-full py-4 bg-[#1a365d] text-white font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
                >
                  Ambil Karcis
                </button>
             </div>
             
             <div className="h-4 bg-[#f2f4f6]" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>
           </div>
        </div>
      )}
    </div>
  );
}

