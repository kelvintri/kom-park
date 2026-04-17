import { NextRequest, NextResponse } from "next/server";
import { validateGateSecret } from "@/lib/gateAuth";
import prisma from "@/lib/prisma";
import { StatusKartu, StatusLog, TipeGate, Sumber } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("X-Gate-Secret");
    if (!validateGateSecret(secret)) {
      return NextResponse.json({ access: false, reason: "invalid_secret" }, { status: 401 });
    }

    const formData = await req.formData();
    const uid = formData.get("uid") as string | null;
    const gateId = formData.get("gate_id") as string;
    const type = formData.get("type") as string; // 'masuk' | 'keluar'
    const foto = formData.get("foto") as File | null;
    const isGuest = formData.get("is_guest") === "true";
    const ticketId = formData.get("ticket_id") as string | null;

    if (!gateId || !type) {
      return NextResponse.json({ access: false, reason: "missing_fields" }, { status: 400 });
    }

    if (!isGuest && !uid && type.toUpperCase() === TipeGate.MASUK) {
       return NextResponse.json({ access: false, reason: "uid_required" }, { status: 400 });
    }

    // 1. Handle Guest Entry (No Card)
    if (isGuest && type.toUpperCase() === TipeGate.MASUK) {
      const log = await prisma.logParkir.create({
        data: {
          gateMasukId: gateId,
          status: StatusLog.MASUK,
          waktuMasuk: new Date(),
          sumber: Sumber.DEMO,
        },
      });

      return NextResponse.json({ 
        access: true, 
        nama: "PENGUNJUNG UMUM", 
        nimNip: "GUEST",
        logId: log.id 
      });
    }

    // 2. Find Card and User
    let kartu = null;
    if (uid) {
      kartu = await prisma.kartuRfid.findUnique({
        where: { uidKartu: uid },
        include: { pengguna: true },
      });

      if (!kartu) {
        return NextResponse.json({ access: false, reason: "kartu_tidak_ditemukan" });
      }

      if (kartu.status === StatusKartu.DIBLOKIR) {
        return NextResponse.json({ access: false, reason: "kartu_diblokir" });
      }

      if (kartu.status === StatusKartu.HILANG) {
        return NextResponse.json({ access: false, reason: "kartu_dilaporkan_hilang" });
      }
    }

    // 2. Handle Entry/Exit
    if (type.toUpperCase() === TipeGate.MASUK) {
      if (!kartu) {
        return NextResponse.json({ access: false, reason: "identitas_diperlukan" });
      }

      // Check if already in
      const existingLog = await prisma.logParkir.findFirst({
        where: { kartuRfidId: kartu.id, status: StatusLog.MASUK },
      });

      if (existingLog) {
        return NextResponse.json({ access: false, reason: "kartu_belum_keluar" });
      }

      // Save photo if exists
      let fotoPath = null;
      if (foto) {
        fotoPath = await savePhoto(foto, gateId, "masuk");
      }

      // Create log
      await prisma.logParkir.create({
        data: {
          kartuRfidId: kartu.id,
          gateMasukId: gateId,
          status: StatusLog.MASUK,
          fotoMasuk: fotoPath,
          waktuMasuk: new Date(),
          sumber: Sumber.DEMO, // Default to DEMO for this version
        },
      });

      return NextResponse.json({ 
        access: true, 
        nama: kartu.pengguna.nama, 
        nimNip: kartu.pengguna.nimNip 
      });

    } else if (type.toUpperCase() === TipeGate.KELUAR) {
      // Find entrance log (by RFID or Ticket ID)
      let entranceLog = null;
      
      if (kartu) {
        entranceLog = await prisma.logParkir.findFirst({
          where: { kartuRfidId: kartu.id, status: StatusLog.MASUK },
          orderBy: { waktuMasuk: "desc" },
        });
      } else if (ticketId) {
        entranceLog = await prisma.logParkir.findFirst({
          where: { id: ticketId, status: StatusLog.MASUK },
        });
      }

      if (!entranceLog) {
        return NextResponse.json({ access: false, reason: "tidak_ada_log_masuk" });
      }

      // Save photo if exists
      let fotoPath = null;
      if (foto) {
        fotoPath = await savePhoto(foto, gateId, "keluar");
      }

      // Update log
      await prisma.logParkir.update({
        where: { id: entranceLog.id },
        data: {
          gateKeluarId: gateId,
          status: StatusLog.KELUAR,
          fotoKeluar: fotoPath,
          waktuKeluar: new Date(),
        },
      });

      return NextResponse.json({ 
        access: true, 
        nama: kartu?.pengguna.nama || "PENGUNJUNG UMUM", 
        nimNip: kartu?.pengguna.nimNip || "GUEST",
        logId: entranceLog.id
      });

    } else {
      return NextResponse.json({ access: false, reason: "invalid_type" }, { status: 400 });
    }

  } catch (error) {
    console.error("Gate verification error:", error);
    return NextResponse.json({ access: false, reason: "server_error" }, { status: 500 });
  }
}

async function savePhoto(file: File, gateId: string, type: string) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileName = `${gateId}-${type}-${Date.now()}.jpg`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Error saving photo:", error);
    return null;
  }
}
