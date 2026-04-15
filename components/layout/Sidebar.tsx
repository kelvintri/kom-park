"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Gamepad2, 
  History, 
  Users, 
  Car,
  ShieldCheck
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Simulator Gate", href: "/simulator", icon: Gamepad2 },
  { name: "Log Parkir", href: "/log", icon: History },
  { name: "Pengguna & Kartu", href: "/pengguna", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col overflow-hidden bg-gradient-to-b from-[#1a365d] to-[#183154] px-4 py-6 text-white shadow-[12px_0_32px_rgba(26,54,93,0.16)]">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
          <Car className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold tracking-[-0.02em]">Campus Parking</h1>
          <p className="text-[10px] font-bold tracking-[0.24em] text-white/50 uppercase">
            Academic Authority
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200",
                isActive 
                  ? "bg-white/10 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md" 
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-white" : "text-white/75")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        <div className="flex items-center gap-3 rounded-2xl bg-white/6 p-3 backdrop-blur-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#adc7f7]/30 text-[#d6e3ff]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-white">Admin Utama</p>
            <p className="truncate text-[10px] text-white/50">Superuser Access</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
