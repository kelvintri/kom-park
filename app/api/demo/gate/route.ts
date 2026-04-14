import { NextResponse } from "next/server";

import { getActiveGates } from "@/lib/db/queries";

export async function GET() {
  return NextResponse.json(await getActiveGates());
}
