import { v4 as uuidv4 } from "uuid";

import { db } from "@/lib/db";
import { DUMMY_PHOTO_PATH, saveFormFile } from "@/lib/storage/files";

type GateVerifyResponseBody = {
  access: boolean;
  reason: string | null;
  nama?: string;
  nim_nip?: string;
};

type GateVerifyResult = {
  status: number;
  body: GateVerifyResponseBody;
};

type CardLookupRow = {
  id: string;
  status: string;
  nama: string;
  nim_nip: string;
  pengguna_status: string;
};

type GateLookupRow = {
  id: string;
  tipe: "masuk" | "keluar";
  status: string;
};

type OpenLogRow = {
  id: string;
};

export async function verifyGateAccess(formData: FormData): Promise<GateVerifyResult> {
  const uid = String(formData.get("uid") ?? "").trim();
  const gateId = String(formData.get("gate_id") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const source = String(formData.get("source") ?? "hardware").trim() === "demo" ? "demo" : "hardware";
  const photo = formData.get("foto");

  if (!uid || !gateId || !["masuk", "keluar"].includes(type)) {
    return { status: 400, body: { access: false, reason: "payload_tidak_valid" } };
  }

  const gate = await db("gate")
    .where({ id: gateId, status: "aktif" })
    .first<GateLookupRow>();
  if (!gate || gate.tipe !== type) {
    return { status: 400, body: { access: false, reason: "gate_tidak_valid" } };
  }

  const card = await db("kartu_rfid as k")
    .leftJoin("pengguna as p", "p.id", "k.pengguna_id")
    .select("k.*", "p.nama", "p.nim_nip", "p.status as pengguna_status")
    .where("k.uid_kartu", uid)
    .first<CardLookupRow>();

  if (!card || card.pengguna_status !== "aktif") {
    return { status: 404, body: { access: false, reason: "kartu_tidak_ditemukan" } };
  }

  if (card.status === "diblokir" || card.status === "hilang") {
    return { status: 403, body: { access: false, reason: "kartu_diblokir" } };
  }

  const now = new Date();
  const filePath = photo instanceof File ? await saveFormFile(photo) : DUMMY_PHOTO_PATH;

  if (type === "masuk") {
    const openLog = await db("log_parkir")
      .where({ kartu_rfid_id: card.id, status: "masuk" })
      .first<OpenLogRow>();

    if (openLog) {
      return {
        status: 409,
        body: { access: false, nama: card.nama, nim_nip: card.nim_nip, reason: "kartu_belum_keluar" }
      };
    }

    await db("log_parkir").insert({
      id: uuidv4(),
      kartu_rfid_id: card.id,
      gate_masuk_id: gateId,
      foto_masuk: filePath,
      sumber: source,
      status: "masuk",
      waktu_masuk: now
    });
  }

  if (type === "keluar") {
    const openLog = await db("log_parkir")
      .where({ kartu_rfid_id: card.id, status: "masuk" })
      .orderBy("waktu_masuk", "desc")
      .first<OpenLogRow>();

    if (!openLog) {
      return {
        status: 409,
        body: { access: false, nama: card.nama, nim_nip: card.nim_nip, reason: "tidak_ada_log_masuk" }
      };
    }

    await db("log_parkir")
      .where({ id: openLog.id })
      .update({
        gate_keluar_id: gateId,
        foto_keluar: filePath,
        waktu_keluar: now,
        status: "keluar",
        sumber: source
      });
  }

  return {
    status: 200,
    body: {
      access: true,
      nama: card.nama,
      nim_nip: card.nim_nip,
      reason: null
    }
  };
}
