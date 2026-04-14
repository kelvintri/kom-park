import { NextRequest, NextResponse } from "next/server";
import path from "path";

import { readStoredFile } from "@/lib/storage/files";

const mimeMap: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: filePath } = await params;
    const { buffer, absolutePath } = await readStoredFile(filePath);
    const extension = path.extname(absolutePath).toLowerCase();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeMap[extension] ?? "application/octet-stream",
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return NextResponse.json({ message: "File tidak ditemukan" }, { status: 404 });
  }
}
