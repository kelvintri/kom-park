import { NextResponse } from "next/server";

import { getDashboardSnapshot } from "@/lib/db/queries";

export async function GET() {
  return NextResponse.json(await getDashboardSnapshot());
}
