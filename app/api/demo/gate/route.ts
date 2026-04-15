import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Status } from "@prisma/client";
import { mockGates } from "@/lib/mockData";

export async function GET() {
  try {
    const gates = await prisma.gate.findMany({
      where: { status: Status.AKTIF }
    });

    return NextResponse.json(gates);
  } catch (error) {
    console.warn("DB connection failed, falling back to mock data", error);
    if (process.env.NEXT_PUBLIC_APP_MODE === "demo") {
      return NextResponse.json(mockGates);
    }
    return NextResponse.json({ error: "Failed to fetch gates" }, { status: 500 });
  }
}
