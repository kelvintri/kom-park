import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

type UserUpdatePayload = {
  nama: string;
  nim_nip: string;
  peran: "mahasiswa" | "dosen" | "staf";
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UserUpdatePayload;
  const { id } = await params;
  await db("pengguna").where({ id }).update({
    nama: body.nama,
    nim_nip: body.nim_nip,
    peran: body.peran
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db("pengguna").where({ id }).update({ status: "nonaktif" });
  return NextResponse.json({ ok: true });
}
