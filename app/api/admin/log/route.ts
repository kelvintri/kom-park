import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth/session";
import { getParkingLogs } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const logs = await getParkingLogs({
    tanggal: searchParams.get("tanggal") || "",
    gate: searchParams.get("gate") || "",
    status: searchParams.get("status") || "",
    sumber: searchParams.get("sumber") || ""
  });

  return NextResponse.json(logs);
}
