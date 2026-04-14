import { NextRequest, NextResponse } from "next/server";

import { verifyGateAccess } from "@/lib/gate-service";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-gate-secret");
  const validSecrets = [process.env.GATE_SECRET, "demo-browser-secret"].filter(Boolean);

  if (!secret || !validSecrets.includes(secret)) {
    return NextResponse.json({ access: false, reason: "secret_tidak_valid" }, { status: 401 });
  }

  const formData = await request.formData();
  const result = await verifyGateAccess(formData);

  return NextResponse.json(result.body, { status: result.status });
}
