import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { buildFileUrl } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const row = await db("log_parkir").where({ id }).first<{ foto_masuk?: string }>();
  const fileUrl = buildFileUrl(row?.foto_masuk ?? "dummy.svg") ?? "/api/files/dummy.svg";
  return NextResponse.redirect(new URL(fileUrl, request.url));
}
