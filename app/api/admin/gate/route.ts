import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { getAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await db("gate").select("*").orderBy("nama", "asc"));
}

type GatePayload = {
  nama: string;
  tipe: "masuk" | "keluar";
  lokasi: string;
};

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as GatePayload;
  await db("gate").insert({
    id: uuidv4(),
    nama: body.nama,
    tipe: body.tipe,
    lokasi: body.lokasi,
    status: "aktif"
  });

  return NextResponse.json({ ok: true });
}
