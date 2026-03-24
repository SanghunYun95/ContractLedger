"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function SideNavBar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: "대시보드", href: "/", icon: "dashboard" },
    { name: "계약 보관함", href: "/contracts", icon: "description" },
    { name: "데이터 분석", href: "#", icon: "insights" },
    { name: "컴플라이언스", href: "#", icon: "gavel" },
    { name: "설정", href: "#", icon: "settings" },
  ];

  return (
    <aside className="w-72 h-screen bg-zinc-950 border-r border-outline-variant/10 flex flex-col sticky top-0 overflow-y-auto">
      <div className="px-8 py-10 text-center">
        <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">데이터 보관함 (RECORDS)</p>
        <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 mt-1 font-bold">The Sovereign Storage</div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? "" : "group-hover:scale-110 transition-transform"}`}>
                {item.icon}
              </span>
              <span className="text-sm font-bold tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-8 border-t border-outline-variant/5">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-surface-container-high py-3 rounded-xl hover:bg-surface-container-highest transition-colors group"
        >
          <span className="material-symbols-outlined text-zinc-400 group-hover:text-red-400 transition-colors">logout</span>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300">로그아웃 (Sign Out)</span>
        </button>
      </div>
    </aside>
  );
}
