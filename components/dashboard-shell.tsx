"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";

import type { DemoCard, GateRow, ParkingLogRow, UserWithCard } from "@/lib/db/queries";
import { buildFileUrl, formatDateTime, formatDuration } from "@/lib/utils";

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "simulator", label: "Simulator" },
  { key: "log", label: "Log Parkir" },
  { key: "users", label: "Pengguna & Kartu" },
  { key: "ticket", label: "Tiket/Karcis" }
];

type DashboardSnapshot = {
  total_di_dalam: number;
  total_masuk_hari_ini: number;
  total_keluar_hari_ini: number;
  log_hari_ini: ParkingLogRow[];
};

type DashboardUser = {
  id?: string;
  role?: string;
  name?: string | null;
  email?: string | null;
};

type SimulatorFormState = {
  masukUid: string;
  masukGate: string;
  keluarUid: string;
  keluarGate: string;
};

type LogFilters = {
  tanggal: string;
  status: string;
  sumber: string;
};

type SimulatorResponse = {
  access: boolean;
  reason: string | null;
  nama?: string;
  nim_nip?: string;
  type: "masuk" | "keluar";
};

export function DashboardShell({ user, appMode }: { user: DashboardUser; appMode: string }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [cards, setCards] = useState<DemoCard[]>([]);
  const [gates, setGates] = useState<GateRow[]>([]);
  const [logs, setLogs] = useState<ParkingLogRow[]>([]);
  const [users, setUsers] = useState<UserWithCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [formBusy, setFormBusy] = useState(false);
  const [simResponse, setSimResponse] = useState<SimulatorResponse | null>(null);
  const [simForm, setSimForm] = useState<SimulatorFormState>({
    masukUid: "",
    masukGate: "",
    keluarUid: "",
    keluarGate: ""
  });
  const [filters, setFilters] = useState<LogFilters>({
    tanggal: "",
    status: "",
    sumber: ""
  });
  const [webcamAllowed, setWebcamAllowed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function fetchAll() {
    const [snapshotRes, cardsRes, gatesRes, logsRes, usersRes] = await Promise.all([
      fetch("/api/demo/status", { cache: "no-store" }),
      fetch("/api/demo/kartu", { cache: "no-store" }),
      fetch("/api/demo/gate", { cache: "no-store" }),
      fetch(`/api/admin/log?${new URLSearchParams(filters).toString()}`, { cache: "no-store" }),
      fetch("/api/admin/pengguna", { cache: "no-store" })
    ]);

    const [snapshotJson, cardsJson, gatesJson, logsJson, usersJson] = await Promise.all([
      snapshotRes.json() as Promise<DashboardSnapshot>,
      cardsRes.json() as Promise<DemoCard[]>,
      gatesRes.json() as Promise<GateRow[]>,
      logsRes.json() as Promise<ParkingLogRow[]>,
      usersRes.json() as Promise<UserWithCard[]>
    ]);

    setSnapshot(snapshotJson);
    setCards(cardsJson);
    setGates(gatesJson);
    setLogs(logsJson);
    setUsers(usersJson);
    setSimForm((current) => ({
      masukUid: current.masukUid || cardsJson.find((item) => item.status === "aktif")?.uid || "",
      masukGate: current.masukGate || gatesJson.find((item) => item.tipe === "masuk")?.id || "",
      keluarUid: current.keluarUid || cardsJson.find((item) => item.sedang_parkir)?.uid || "",
      keluarGate: current.keluarGate || gatesJson.find((item) => item.tipe === "keluar")?.id || ""
    }));
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, 5000);
    return () => clearInterval(timer);
  }, [filters.tanggal, filters.status, filters.sumber]);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        setWebcamAllowed(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setWebcamAllowed(false);
      }
    }

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const cardsInside = useMemo(() => cards.filter((card) => card.sedang_parkir), [cards]);
  const cardsOutside = useMemo(() => cards.filter((card) => card.status === "aktif"), [cards]);

  async function captureBlob(): Promise<Blob | null> {
    if (!webcamAllowed || !videoRef.current || !canvasRef.current) {
      return null;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  }

  async function submitGate(type: "masuk" | "keluar") {
    setFormBusy(true);
    setSimResponse(null);

    const formData = new FormData();
    const uid = type === "masuk" ? simForm.masukUid : simForm.keluarUid;
    const gateId = type === "masuk" ? simForm.masukGate : simForm.keluarGate;

    formData.append("uid", uid);
    formData.append("gate_id", gateId);
    formData.append("type", type);
    formData.append("source", "demo");

    const blob = await captureBlob();
    if (blob) {
      formData.append("foto", blob, `${type}-${Date.now()}.jpg`);
    }

    const response = await fetch("/api/gate/verify", {
      method: "POST",
      headers: {
        "X-Gate-Secret": "demo-browser-secret"
      },
      body: formData
    });

    const result = (await response.json()) as Omit<SimulatorResponse, "type">;
    setSimResponse({ ...result, type });
    setFormBusy(false);
    await fetchAll();
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormBusy(true);
    const form = new FormData(event.currentTarget);

    await fetch("/api/admin/pengguna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama: form.get("nama"),
        nim_nip: form.get("nim_nip"),
        peran: form.get("peran"),
        uid_kartu: form.get("uid_kartu")
      })
    });

    event.currentTarget.reset();
    setFormBusy(false);
    await fetchAll();
  }

  async function toggleCardStatus(kartuId: string, nextStatus: string) {
    setFormBusy(true);
    await fetch(`/api/admin/kartu/${kartuId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    setFormBusy(false);
    await fetchAll();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">KomPark</div>
          <div className="sidebar-subtitle">Campus Parking Demo</div>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeTab === item.key ? "nav-item active" : "nav-item"}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div>{user.name}</div>
          <div className="muted">{user.email}</div>
          <button type="button" className="ghost-button" onClick={() => signOut({ callbackUrl: "/login" })}>
            Keluar
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h1>Sistem Parkir Kampus</h1>
            <p>Admin panel untuk dashboard live dan simulator gate tanpa hardware.</p>
          </div>
          {appMode === "demo" ? <div className="demo-badge">DEMO MODE</div> : null}
        </header>

        {loading ? <div className="card">Memuat data...</div> : null}

        {!loading && activeTab === "dashboard" ? (
          <>
            <section className="stat-grid">
              <article className="stat-card">
                <span>Kendaraan di dalam</span>
                <strong>{snapshot?.total_di_dalam ?? 0}</strong>
              </article>
              <article className="stat-card">
                <span>Total masuk hari ini</span>
                <strong>{snapshot?.total_masuk_hari_ini ?? 0}</strong>
              </article>
              <article className="stat-card">
                <span>Total keluar hari ini</span>
                <strong>{snapshot?.total_keluar_hari_ini ?? 0}</strong>
              </article>
            </section>

            <section className="card">
              <div className="section-title">10 Aktivitas Terakhir</div>
              <LogTable logs={snapshot?.log_hari_ini ?? []} />
            </section>
          </>
        ) : null}

        {!loading && activeTab === "simulator" ? (
          <section className="sim-grid">
            <article className="card simulator-card">
              <div className="section-title">Gate Masuk</div>
              <label>
                Kartu RFID
                <select
                  value={simForm.masukUid}
                  onChange={(event) => setSimForm((current) => ({ ...current, masukUid: event.target.value }))}
                >
                  {cardsOutside.map((card) => (
                    <option key={card.uid} value={card.uid}>
                      {card.nama} - {card.nim_nip} {card.sedang_parkir ? "(di dalam)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Gate Masuk
                <select
                  value={simForm.masukGate}
                  onChange={(event) => setSimForm((current) => ({ ...current, masukGate: event.target.value }))}
                >
                  {gates
                    .filter((gate) => gate.tipe === "masuk")
                    .map((gate) => (
                      <option key={gate.id} value={gate.id}>
                        {gate.nama} - {gate.lokasi}
                      </option>
                    ))}
                </select>
              </label>
              <button type="button" className="primary-button" disabled={formBusy} onClick={() => submitGate("masuk")}>
                {formBusy ? "Memproses..." : "Simulasi Tap Masuk"}
              </button>
            </article>

            <article className="card simulator-card">
              <div className="section-title">Gate Keluar</div>
              <label>
                Kartu RFID
                <select
                  value={simForm.keluarUid}
                  onChange={(event) => setSimForm((current) => ({ ...current, keluarUid: event.target.value }))}
                >
                  {cardsInside.length ? (
                    cardsInside.map((card) => (
                      <option key={card.uid} value={card.uid}>
                        {card.nama} - {card.nim_nip}
                      </option>
                    ))
                  ) : (
                    <option value="">Belum ada kendaraan di dalam</option>
                  )}
                </select>
              </label>
              <label>
                Gate Keluar
                <select
                  value={simForm.keluarGate}
                  onChange={(event) => setSimForm((current) => ({ ...current, keluarGate: event.target.value }))}
                >
                  {gates
                    .filter((gate) => gate.tipe === "keluar")
                    .map((gate) => (
                      <option key={gate.id} value={gate.id}>
                        {gate.nama} - {gate.lokasi}
                      </option>
                    ))}
                </select>
              </label>
              <button type="button" className="danger-button" disabled={formBusy} onClick={() => submitGate("keluar")}>
                {formBusy ? "Memproses..." : "Simulasi Tap Keluar"}
              </button>
            </article>

            <article className="card camera-card">
              <div className="section-title">Preview Kamera Browser</div>
              <video ref={videoRef} autoPlay muted playsInline className="camera-preview" />
              <canvas ref={canvasRef} hidden />
              <div className="muted">
                {webcamAllowed
                  ? "Webcam aktif. Snapshot akan dikirim saat simulasi tap."
                  : "Izin kamera tidak tersedia. Sistem akan memakai placeholder lokal."}
              </div>
              {simResponse ? (
                <div className={simResponse.access ? "status-banner success" : "status-banner danger"}>
                  <strong>{simResponse.access ? "Akses diberikan" : "Akses ditolak"}</strong>
                  <span>
                    {simResponse.nama ? `${simResponse.nama} - ` : ""}
                    {simResponse.reason ?? "ok"}
                  </span>
                </div>
              ) : null}
            </article>
          </section>
        ) : null}

        {!loading && activeTab === "log" ? (
          <section className="card">
            <div className="section-title">Log Parkir</div>
            <div className="filter-row">
              <input
                type="date"
                value={filters.tanggal}
                onChange={(event) => setFilters((current) => ({ ...current, tanggal: event.target.value }))}
              />
              <select
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="">Semua status</option>
                <option value="masuk">Masuk</option>
                <option value="keluar">Keluar</option>
                <option value="anomali">Anomali</option>
              </select>
              <select
                value={filters.sumber}
                onChange={(event) => setFilters((current) => ({ ...current, sumber: event.target.value }))}
              >
                <option value="">Semua sumber</option>
                <option value="demo">Demo</option>
                <option value="hardware">Hardware</option>
              </select>
            </div>
            <LogTable logs={logs} detailed />
          </section>
        ) : null}

        {!loading && activeTab === "users" ? (
          <section className="user-grid">
            <article className="card">
              <div className="section-title">Tambah Pengguna + Kartu</div>
              <form className="stack-form" onSubmit={createUser}>
                <input name="nama" placeholder="Nama lengkap" required />
                <input name="nim_nip" placeholder="NIM / NIP" required />
                <select name="peran" defaultValue="mahasiswa">
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="dosen">Dosen</option>
                  <option value="staf">Staf</option>
                </select>
                <input name="uid_kartu" placeholder="UID kartu RFID" required />
                <button type="submit" className="primary-button" disabled={formBusy}>
                  Simpan Pengguna
                </button>
              </form>
            </article>

            <article className="card">
              <div className="section-title">Daftar Pengguna & Status Kartu</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>NIM/NIP</th>
                      <th>Peran</th>
                      <th>Status Pengguna</th>
                      <th>UID</th>
                      <th>Status Kartu</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nama}</td>
                        <td>{item.nim_nip}</td>
                        <td>{item.peran}</td>
                        <td>{item.status}</td>
                        <td>{item.uid_kartu ?? "-"}</td>
                        <td>{item.kartu_status ?? "-"}</td>
                        <td>
                          {item.kartu_id ? (
                            <button
                              type="button"
                              className="ghost-button"
                              disabled={formBusy}
                              onClick={() =>
                                toggleCardStatus(
                                  item.kartu_id!,
                                  item.kartu_status === "aktif" ? "diblokir" : "aktif"
                                )
                              }
                            >
                              {item.kartu_status === "aktif" ? "Blokir" : "Aktifkan"}
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        ) : null}

        {!loading && activeTab === "ticket" ? (
          <section className="card coming-soon">
            <div className="section-title">Tiket/Karcis</div>
            <p>Modul ini disiapkan sebagai placeholder untuk demo berikutnya.</p>
            <p>Rencana: tombol generate karcis masuk untuk kendaraan non-RFID dan integrasi proses keluar.</p>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function LogTable({ logs, detailed = false }: { logs: ParkingLogRow[]; detailed?: boolean }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Waktu Masuk</th>
            <th>Nama</th>
            <th>NIM/NIP</th>
            <th>Gate Masuk</th>
            <th>Gate Keluar</th>
            <th>Waktu Keluar</th>
            <th>Durasi</th>
            <th>Sumber</th>
            <th>Status</th>
            {detailed ? <th>Foto</th> : null}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{formatDateTime(log.waktu_masuk)}</td>
              <td>{log.nama ?? "-"}</td>
              <td>{log.nim_nip ?? "-"}</td>
              <td>{log.gate_masuk_nama ?? "-"}</td>
              <td>{log.gate_keluar_nama ?? "-"}</td>
              <td>{formatDateTime(log.waktu_keluar)}</td>
              <td>{formatDuration(log.waktu_masuk, log.waktu_keluar)}</td>
              <td>{log.sumber}</td>
              <td>{log.status}</td>
              {detailed ? (
                <td>
                  <a
                    href={buildFileUrl(log.foto_keluar || log.foto_masuk) ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lihat foto
                  </a>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
