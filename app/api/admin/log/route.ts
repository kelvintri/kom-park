import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StatusLog } from "@prisma/client";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("tanggal");
    const gateId = searchParams.get("gateId");
    const status = searchParams.get("status") as StatusLog | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dateStr) {
      const date = parseISO(dateStr);
      where.waktuMasuk = {
        gte: startOfDay(date),
        lte: endOfDay(date),
      };
    }

    if (gateId) {
      where.OR = [
        { gateMasukId: gateId },
        { gateKeluarId: gateId },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.logParkir.findMany({
        where,
        skip,
        take: limit,
        orderBy: { waktuMasuk: "desc" },
        include: {
          kartuRfid: {
            include: { pengguna: true }
          },
          gateMasuk: true,
          gateKeluar: true
        }
      }),
      prisma.logParkir.count({ where })
    ]);

    return NextResponse.json({
      data: data.map(log => ({
        id: log.id,
        nama: log.kartuRfid?.pengguna.nama || "GUEST",
        nimNip: log.kartuRfid?.pengguna.nimNip || log.id, // NIM/NIP for members, Ticket ID for guests
        peran: log.kartuRfid?.pengguna.peran || "TAMU",
        gateMasuk: log.gateMasuk?.nama,
        gateKeluar: log.gateKeluar?.nama,
        waktuMasuk: log.waktuMasuk,
        waktuKeluar: log.waktuKeluar,
        status: log.status,
        sumber: log.sumber,
        fotoMasuk: log.fotoMasuk,
        fotoKeluar: log.fotoKeluar,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
