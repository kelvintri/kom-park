import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { getAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

type CardPayload = {
  pengguna_id: string;
  uid_kartu: string;
};

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CardPayload;

  await db("kartu_rfid").insert({
    id: uuidv4(),
    pengguna_id: body.pengguna_id,
    uid_kartu: body.uid_kartu,
    status: "aktif",
    aktif_dari: new Date()
  });

  return NextResponse.json({ ok: true });
}
