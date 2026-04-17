"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Gamepad2, 
  History, 
  Users, 
  Car,
  ShieldCheck,
  LogOut
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
      <div className="mb-10 flex justify-center px-2">
        <Image 
          src="/logo-spark.png" 
          alt="Spark Logo" 
          width={140} 
          height={30}
          className="h-auto w-auto object-contain"
          priority
        />
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
            <p className="truncate text-xs font-bold text-white">Superadmin</p>
            <p className="truncate text-[10px] text-white/50">Superuser Access</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition-all duration-200 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
