"use client";

import Link from "next/link";
import useSWR from "swr";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Car, Ellipsis, Loader2, LogIn, LogOut, RefreshCw } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type DashboardLog = {
  id: string;
  nama: string;
  nimNip: string;
  gate: string;
  status: string;
  waktu: string;
  sumber: string;
};

type DashboardData = {
  totalDiDalam: number;
  totalMasukHariIni: number;
  totalKeluarHariIni: number;
  logTerbaru: DashboardLog[];
};

const statCards = [
  {
    key: "totalDiDalam",
    title: "Kendaraan di Dalam",
    icon: Car,
    iconWrapClassName: "bg-[#adc7f7]/25 text-[#1a365d]",
  },
  {
    key: "totalMasukHariIni",
    title: "Total Masuk Hari Ini",
    icon: LogIn,
    iconWrapClassName: "bg-[#57657a]/10 text-[#57657a]",
  },
  {
    key: "totalKeluarHariIni",
    title: "Total Keluar Hari Ini",
    icon: LogOut,
    iconWrapClassName: "bg-[#2d476f]/10 text-[#2d476f]",
  },
] as const;

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<DashboardData>("/api/demo/status", fetcher, {
    refreshInterval: 5000,
  });

  if (error) {
    return (
      <div className="rounded-[28px] bg-[#ffdad6] p-6 text-sm font-medium text-[#93000a] shadow-[0_12px_40px_rgba(25,28,30,0.04)]">
        Gagal memuat dashboard.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-[-0.02em] text-[#002045]">
            Dashboard Parkir
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#43474e]">
            <span className="h-2 w-2 rounded-full bg-[#57657a] animate-pulse" />
            Sistem Pemantauan Real-time RFID Kampus
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-[#e6e8ea] px-4 py-2 text-xs font-semibold text-[#57657a]">
          <RefreshCw className={isLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Auto-refresh every 5 seconds
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statCards.map(({ key, title, icon: Icon, iconWrapClassName }) => (
          <section
            key={key}
            className="flex items-center justify-between rounded-[24px] bg-white p-6 shadow-[0_12px_40px_rgba(25,28,30,0.04)] transition-transform duration-200 hover:-translate-y-1"
          >
            <div>
              <p className="mb-1 text-[11px] font-bold tracking-[0.18em] text-[#43474e] uppercase">
                {title}
              </p>
              <p className="font-heading text-4xl font-extrabold tracking-[-0.02em] text-[#002045]">
                {isLoading && !data ? "..." : data?.[key] ?? 0}
              </p>
            </div>
            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconWrapClassName}`}>
              <Icon className="h-6 w-6" />
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-[32px] bg-[#f2f4f6] p-1">
        <div className="overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_12px_40px_rgba(25,28,30,0.04)] md:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="font-heading text-xl font-bold tracking-[-0.02em] text-[#002045]">
              Aktivitas Terakhir
            </h2>
            <Link
              className="text-sm font-bold text-[#2d476f] underline-offset-4 hover:underline"
              href="/log"
            >
              Lihat Semua Log
            </Link>
          </div>

          {isLoading && !data ? (
            <div className="flex h-72 items-center justify-center rounded-[24px] bg-[#f2f4f6]/50">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a365d]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="text-[11px] font-bold tracking-[0.18em] text-[#43474e] uppercase">
                    <th className="pb-6 pl-4">Waktu</th>
                    <th className="pb-6">Nama</th>
                    <th className="pb-6">NIM/NIP</th>
                    <th className="pb-6">Status</th>
                    <th className="pb-6">Gate</th>
                    <th className="pb-6 pr-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.logTerbaru?.length ? (
                    data.logTerbaru.map((log, index) => {
                      const isMasuk = log.status === "MASUK";

                      return (
                        <tr
                          key={log.id}
                          className={index % 2 === 1 ? "bg-[#f2f4f6]/35" : ""}
                        >
                          <td className="rounded-l-xl py-5 pl-4 font-medium text-[#191c1e]/70">
                            {format(new Date(log.waktu), "HH:mm:ss", { locale: id })}
                          </td>
                          <td className="py-5 font-bold text-[#002045]">{log.nama}</td>
                          <td className="py-5 font-mono text-[#43474e]">{log.nimNip}</td>
                          <td className="py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                                isMasuk
                                  ? "bg-[#57657a]/10 text-[#57657a]"
                                  : "bg-[#2d476f]/10 text-[#2d476f]"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-5 font-semibold text-[#43474e]">{log.gate}</td>
                          <td className="rounded-r-xl py-5 pr-4 text-right">
                            <button
                              aria-label={`Aksi untuk ${log.nama}`}
                              className="rounded-full p-1 text-[#43474e] transition-colors hover:bg-[#f2f4f6] hover:text-[#002045]"
                              type="button"
                            >
                              <Ellipsis className="ml-auto h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="py-16 text-center text-sm text-[#43474e]" colSpan={6}>
                        Belum ada aktivitas parkir tercatat hari ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[#1a365d]/10 bg-[#1a365d]/5 px-6 py-3">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#002045] [animation-delay:0s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#002045] [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#002045] [animation-delay:0.4s]" />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#002045]/60 uppercase">
            Real-time simulation active: polling database every 5 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
