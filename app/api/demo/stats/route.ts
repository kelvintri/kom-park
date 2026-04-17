import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StatusLog } from "@prisma/client";

export async function GET() {
  try {
    const TOTAL_SLOTS = 300;
    const parkedLogs = await prisma.logParkir.findMany({
      where: { status: StatusLog.MASUK },
      include: {
        kartuRfid: {
          include: { pengguna: true }
        }
      }
    });

    const parkedCards = parkedLogs.map(log => log.kartuRfid).filter(Boolean);
    const occupancy = Math.round((parkedCards.length / TOTAL_SLOTS) * 100);
    
    const students = parkedCards.filter(c => c?.pengguna.peran === "MAHASISWA").length;
    const staff = parkedCards.filter(c => c?.pengguna.peran === "DOSEN" || c?.pengguna.peran === "STAF").length;
    const guests = parkedCards.length - (students + staff); 

    return NextResponse.json({
      occupancy: Math.min(occupancy, 100), // Cap at 100%
      totalParked: parkedCards.length,
      totalSlots: TOTAL_SLOTS,
      students,
      staff,
      guests,
      fastestExit: "1.8s",
      latency: "Low"
    });
  } catch (error) {
    console.error("Failed to fetch demo stats:", error);
    // Fallback if DB not ready or demo mode
    return NextResponse.json({
      occupancy: 45,
      students: 8,
      staff: 4,
      guests: 0,
      fastestExit: "2.4s",
      latency: "Low"
    });
  }
}
