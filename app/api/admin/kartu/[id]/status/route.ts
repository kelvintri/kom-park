import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

type CardStatusPayload = {
  status: "aktif" | "hilang" | "diblokir";
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CardStatusPayload;
  const { id } = await params;
  await db("kartu_rfid").where({ id }).update({ status: body.status });

  return NextResponse.json({ ok: true });
}
