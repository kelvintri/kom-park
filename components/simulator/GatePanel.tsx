"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap } from "lucide-react";
import { AccessResult } from "./AccessResult";

interface GatePanelProps {
  title: string;
  type: "MASUK" | "KELUAR";
  gates: any[];
  cards: any[];
  onSuccess: () => void;
}

export function GatePanel({ title, type, gates, cards, onSuccess }: GatePanelProps) {
  const [selectedGate, setSelectedGate] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const filteredCards = cards.filter(c => 
    type === "MASUK" ? !c.sedangParkir : c.sedangParkir
  ).filter(c => c.statusKartu === "AKTIF");

  const handleTap = async () => {
    if (!selectedGate || !selectedCard) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("uid", selectedCard);
      formData.append("gate_id", selectedGate);
      formData.append("type", type.toLowerCase());
      // No photo in simulation for now

      const res = await fetch("/api/gate/verify", {
        method: "POST",
        headers: {
          "X-Gate-Secret": process.env.NEXT_PUBLIC_GATE_SECRET || "parkir-kampus-2024"
        },
        body: formData
      });

      const data = await res.json();
      setResult(data);
      
      if (data.access) {
        onSuccess();
        setSelectedCard(""); // Reset card selection
      }
    } catch (error) {
      console.error("Tap error:", error);
      setResult({ access: false, reason: "network_error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Simulasi tapping kartu RFID</CardDescription>
          </div>
          <Badge variant={type === "MASUK" ? "default" : "secondary"}>
            {type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pilih Gate</label>
          <Select onValueChange={(value) => setSelectedGate(value ?? "")} value={selectedGate}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih lokasi gate..." />
            </SelectTrigger>
            <SelectContent>
              {gates.map((gate) => (
                <SelectItem key={gate.id} value={gate.id}>
                  {gate.nama} — {gate.lokasi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Pilih Kartu RFID</label>
          <Select onValueChange={(value) => setSelectedCard(value ?? "")} value={selectedCard}>
            <SelectTrigger>
              <SelectValue placeholder="Tap kartu..." />
            </SelectTrigger>
            <SelectContent>
              {filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                  <SelectItem key={card.uid} value={card.uid}>
                    {card.nama} — {card.nimNip} ({card.peran})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>Tidak ada kartu yang tersedia</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className={cn(
            "w-full h-12 text-lg font-bold gap-2",
            type === "MASUK" ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"
          )}
          onClick={handleTap}
          disabled={loading || !selectedGate || !selectedCard}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Zap className="w-5 h-5" />
              TAP {type}
            </>
          )}
        </Button>

        {result && <AccessResult result={result} />}
      </CardContent>
    </Card>
  );
}

// Helper to handle class merging in this file since I don't have utils exported in my mind
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
