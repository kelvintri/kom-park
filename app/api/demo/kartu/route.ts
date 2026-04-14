import { NextResponse } from "next/server";

import { getCardsForDemo } from "@/lib/db/queries";

export async function GET() {
  return NextResponse.json(await getCardsForDemo());
}
