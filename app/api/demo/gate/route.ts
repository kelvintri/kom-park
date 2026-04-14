import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Status } from "@prisma/client";

export async function GET() {
  try {
    const gates = await prisma.gate.findMany({
      where: { status: Status.AKTIF }
    });

    return NextResponse.json(gates);
  } catch (error) {
    console.error("Error fetching demo gates:", error);
    return NextResponse.json({ error: "Failed to fetch gates" }, { status: 500 });
  }
}
