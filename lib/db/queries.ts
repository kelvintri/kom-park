import { db } from "@/lib/db";

export type DemoCard = {
  id: string;
  uid: string;
  status: string;
  nama: string;
  nim_nip: string;
  peran: string;
  sedang_parkir: boolean;
};

export type GateRow = {
  id: string;
  nama: string;
  tipe: "masuk" | "keluar";
  lokasi: string;
};

export type ParkingLogRow = {
  id: string;
  waktu_masuk: string;
  waktu_keluar: string | null;
  status: string;
  sumber: string;
  foto_masuk: string | null;
  foto_keluar: string | null;
  nama: string | null;
  nim_nip: string | null;
  peran?: string | null;
  gate_masuk_nama: string | null;
  gate_keluar_nama: string | null;
  uid_kartu?: string | null;
};

export type UserWithCard = {
  id: string;
  nama: string;
  nim_nip: string;
  peran: string;
  status: string;
  kartu_id: string | null;
  uid_kartu: string | null;
  kartu_status: string | null;
  aktif_dari: string | null;
  aktif_hingga: string | null;
};

export type ParkingLogFilters = {
  tanggal?: string;
  gate?: string;
  status?: string;
  sumber?: string;
};

export async function getCardsForDemo(): Promise<DemoCard[]> {
  return db("kartu_rfid as k")
    .leftJoin("pengguna as p", "p.id", "k.pengguna_id")
    .leftJoin("log_parkir as l", function joinLog() {
      this.on("l.kartu_rfid_id", "=", "k.id").andOn("l.status", "=", db.raw("?", ["masuk"]));
    })
    .select(
      "k.id",
      "k.uid_kartu as uid",
      "k.status",
      "p.nama",
      "p.nim_nip",
      "p.peran",
      db.raw("CASE WHEN l.id IS NOT NULL THEN true ELSE false END as sedang_parkir")
    )
    .where("p.status", "aktif")
    .orderBy("p.nama", "asc") as unknown as Promise<DemoCard[]>;
}

export async function getActiveGates(): Promise<GateRow[]> {
  return db("gate")
    .select("id", "nama", "tipe", "lokasi")
    .where({ status: "aktif" })
    .orderBy("nama", "asc") as unknown as Promise<GateRow[]>;
}

export async function getDashboardSnapshot() {
  const [{ total_di_dalam }] = await db("log_parkir")
    .where({ status: "masuk" })
    .count<{ total_di_dalam: string }[]>("* as total_di_dalam");

  const todayRows = await db("log_parkir")
    .whereRaw("DATE(waktu_masuk) = CURRENT_DATE")
    .select<{ status: string }[]>("status");

  const logs = await db("log_parkir as l")
    .leftJoin("kartu_rfid as k", "k.id", "l.kartu_rfid_id")
    .leftJoin("pengguna as p", "p.id", "k.pengguna_id")
    .leftJoin("gate as gm", "gm.id", "l.gate_masuk_id")
    .leftJoin("gate as gk", "gk.id", "l.gate_keluar_id")
    .select(
      "l.id",
      "l.waktu_masuk",
      "l.waktu_keluar",
      "l.status",
      "l.sumber",
      "l.foto_masuk",
      "l.foto_keluar",
      "p.nama",
      "p.nim_nip",
      "p.peran",
      "gm.nama as gate_masuk_nama",
      "gk.nama as gate_keluar_nama"
    )
    .orderBy("l.waktu_masuk", "desc")
    .limit(10) as unknown as ParkingLogRow[];

  return {
    total_di_dalam: Number(total_di_dalam ?? 0),
    total_masuk_hari_ini: todayRows.length,
    total_keluar_hari_ini: todayRows.filter((row) => row.status === "keluar").length,
    log_hari_ini: logs
  };
}

export async function getParkingLogs(filters: ParkingLogFilters = {}): Promise<ParkingLogRow[]> {
  const query = db("log_parkir as l")
    .leftJoin("kartu_rfid as k", "k.id", "l.kartu_rfid_id")
    .leftJoin("pengguna as p", "p.id", "k.pengguna_id")
    .leftJoin("gate as gm", "gm.id", "l.gate_masuk_id")
    .leftJoin("gate as gk", "gk.id", "l.gate_keluar_id")
    .select(
      "l.*",
      "p.nama",
      "p.nim_nip",
      "p.peran",
      "k.uid_kartu",
      "gm.nama as gate_masuk_nama",
      "gk.nama as gate_keluar_nama"
    )
    .orderBy("l.waktu_masuk", "desc");

  if (filters.tanggal) {
    query.whereRaw("DATE(l.waktu_masuk) = ?", [filters.tanggal]);
  }
  if (filters.status) {
    query.where("l.status", filters.status);
  }
  if (filters.sumber) {
    query.where("l.sumber", filters.sumber);
  }
  if (filters.gate) {
    query.where(function whereGate() {
      this.where("l.gate_masuk_id", filters.gate).orWhere("l.gate_keluar_id", filters.gate);
    });
  }

  return query.limit(100) as unknown as Promise<ParkingLogRow[]>;
}

export async function getUsersWithCards(): Promise<UserWithCard[]> {
  return db("pengguna as p")
    .leftJoin("kartu_rfid as k", "k.pengguna_id", "p.id")
    .select(
      "p.id",
      "p.nama",
      "p.nim_nip",
      "p.peran",
      "p.status",
      "k.id as kartu_id",
      "k.uid_kartu",
      "k.status as kartu_status",
      "k.aktif_dari",
      "k.aktif_hingga"
    )
    .orderBy("p.nama", "asc") as unknown as Promise<UserWithCard[]>;
}
