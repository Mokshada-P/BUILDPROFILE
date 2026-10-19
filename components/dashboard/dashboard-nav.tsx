"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  BarChart3,
  PenTool,
  Users,
  Compass,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/auth/actions";

interface NavProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    isDemo?: boolean;
  };
}

export function DashboardNav({ user }: NavProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Profile Audit", href: "/dashboard/audit", icon: BarChart3, badge: "Gemini 1.5" },
    { name: "Content Studio", href: "/dashboard/studio", icon: PenTool, badge: "Live Preview" },
    { name: "Networking Assistant", href: "/dashboard/networking", icon: Users },
    { name: "Career Roadmap", href: "/dashboard/roadmap", icon: Compass },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/95 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <span className="font-bold text-lg text-white tracking-tight">BuildProfile</span>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-indigo-400">
              AI
            </span>
          </Link>
        </div>

        {/* User Pill */}
        <div className="px-4 py-4 border-b border-slate-800/60 bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {user.full_name?.slice(0, 2).toUpperCase() || "ME"}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{user.full_name}</div>
              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                {user.isDemo ? (
                  <span className="text-amber-400 flex items-center gap-0.5">
                    <UserCheck className="w-3 h-3" /> Sandbox Mode
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 mb-2">
            AI Operations
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-slate-800">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  );
}
