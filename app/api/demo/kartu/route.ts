import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StatusLog } from "@prisma/client";

export async function GET() {
  try {
    const kartu = await prisma.kartuRfid.findMany({
      include: {
        pengguna: true,
        logParkir: {
          where: { status: StatusLog.MASUK },
          take: 1
        }
      }
    });

    const result = kartu.map(k => ({
      id: k.id,
      uid: k.uidKartu,
      nama: k.pengguna.nama,
      nimNip: k.pengguna.nimNip,
      peran: k.pengguna.peran,
      statusKartu: k.status,
      sedangParkir: k.logParkir.length > 0
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching demo cards:", error);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }
}
