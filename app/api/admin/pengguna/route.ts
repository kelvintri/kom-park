import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { Knex } from "knex";

import { getAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getUsersWithCards } from "@/lib/db/queries";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getUsersWithCards());
}

type UserPayload = {
  nama: string;
  nim_nip: string;
  peran: "mahasiswa" | "dosen" | "staf";
  uid_kartu: string;
};

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UserPayload;
  const userId = uuidv4();
  const cardId = uuidv4();
  const now = new Date();

  await db.transaction(async (trx: Knex.Transaction) => {
    await trx("pengguna").insert({
      id: userId,
      nama: body.nama,
      nim_nip: body.nim_nip,
      peran: body.peran,
      status: "aktif",
      dibuat_pada: now
    });

    await trx("kartu_rfid").insert({
      id: cardId,
      pengguna_id: userId,
      uid_kartu: body.uid_kartu,
      status: "aktif",
      aktif_dari: now
    });
  });

  return NextResponse.json({ ok: true, id: userId });
}
