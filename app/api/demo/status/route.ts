import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StatusLog } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";
import { mockStatus } from "@/lib/mockData";

export async function GET() {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    const [totalDiDalam, totalMasukHariIni, totalKeluarHariIni, logTerbaru] = await Promise.all([
      prisma.logParkir.count({
        where: { status: StatusLog.MASUK }
      }),
      prisma.logParkir.count({
        where: { 
          waktuMasuk: { gte: start, lte: end }
        }
      }),
      prisma.logParkir.count({
        where: { 
          waktuKeluar: { gte: start, lte: end }
        }
      }),
      prisma.logParkir.findMany({
        take: 10,
        orderBy: { waktuMasuk: "desc" },
        include: {
          kartuRfid: {
            include: { pengguna: true }
          },
          gateMasuk: true,
          gateKeluar: true
        }
      })
    ]);

    return NextResponse.json({
      totalDiDalam,
      totalMasukHariIni,
      totalKeluarHariIni,
      logTerbaru: logTerbaru.map(log => ({
        id: log.id,
        nama: log.kartuRfid?.pengguna.nama || "Unknown",
        nimNip: log.kartuRfid?.pengguna.nimNip || "-",
        gate: log.status === StatusLog.MASUK ? log.gateMasuk?.nama : log.gateKeluar?.nama,
        status: log.status,
        waktu: log.status === StatusLog.MASUK ? log.waktuMasuk : log.waktuKeluar,
        sumber: log.sumber
      }))
    });
  } catch (error) {
    console.warn("DB connection failed, falling back to mock data", error);
    if (process.env.NEXT_PUBLIC_APP_MODE === "demo") {
      return NextResponse.json(mockStatus);
    }
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
