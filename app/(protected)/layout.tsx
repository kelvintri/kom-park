"use client";

import { ProtectedRoute } from "@/contexts/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Bell, Search, Settings } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1 bg-[#f7f9fb]">
            <header className="sticky top-0 z-40 flex items-center justify-between gap-6 border-b border-white/40 bg-[#f2f4f6]/80 px-6 py-4 backdrop-blur-xl md:px-8">
              <div className="relative max-w-md flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#43474e]/60" />
                <input
                  aria-label="Cari data parkir"
                  className="h-11 w-full rounded-full bg-white px-10 text-sm text-[#191c1e] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none ring-1 ring-[#c4c6cf]/30 placeholder:text-[#43474e]/45 focus:ring-2 focus:ring-[#1a365d]/15"
                  placeholder="Cari NIM, Nama, atau Kendaraan..."
                  type="search"
                />
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="hidden items-center gap-3 text-[#43474e] md:flex">
                  <button
                    aria-label="Notifikasi"
                    className="rounded-full p-2 transition-colors hover:bg-white/70 hover:text-[#1a365d]"
                    type="button"
                  >
                    <Bell className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Pengaturan"
                    className="rounded-full p-2 transition-colors hover:bg-white/70 hover:text-[#1a365d]"
                    type="button"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>
            <div className="px-6 py-8 md:px-8">
              {children}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
