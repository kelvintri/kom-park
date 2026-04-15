import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Peran, Status } from "@prisma/client";

export async function GET() {
  try {
    const pengguna = await prisma.pengguna.findMany({
      include: {
        kartuRfid: true
      },
      orderBy: { dibuatPada: "desc" }
    });

    return NextResponse.json(pengguna);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, nimNip, peran, uidKartu } = body;

    // Create user and card in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.pengguna.create({
        data: {
          nama,
          nimNip,
          peran: peran as Peran,
          status: Status.AKTIF,
        }
      });

      const card = await tx.kartuRfid.create({
        data: {
          penggunaId: user.id,
          uidKartu,
          aktifDari: new Date(),
        }
      });

      return { user, card };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
