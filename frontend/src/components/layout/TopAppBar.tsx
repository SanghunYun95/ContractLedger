"use client";

import React, { useState } from "react";
import { useTenant } from "@/context/TenantContext";

export function TopAppBar() {
  const [tenantOpen, setTenantOpen] = useState(false);
  const { activeTenant, setActiveTenant, availableTenants } = useTenant();

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 bg-zinc-950/70 backdrop-blur-xl font-headline tracking-tight shadow-[0_40px_40px_rgba(249,245,248,0.04)] sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <div 
          className="relative group"
          onMouseEnter={() => setTenantOpen(true)}
          onMouseLeave={() => setTenantOpen(false)}
        >
          <button className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
            <span className="w-2 h-2 rounded-full bg-secondary pulse-dot"></span>
            <span className="text-sm font-semibold text-on-surface">{activeTenant.name}</span>
            <span className="material-symbols-outlined text-zinc-400 text-sm">expand_more</span>
          </button>
          
          {/* Tenant Dropdown */}
          <div className={`absolute top-full left-0 mt-2 w-48 bg-surface-container-highest rounded-xl border border-outline-variant/20 transition-all shadow-2xl p-2 z-50 ${tenantOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
            {availableTenants.map((t) => (
              <button 
                key={t.id}
                onClick={() => {
                  setActiveTenant(t);
                  setTenantOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-surface-container-low text-sm text-zinc-200 flex items-center justify-between"
              >
                {t.name} {activeTenant.id === t.id && <span className="material-symbols-outlined text-xs text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>check</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-[1px] bg-outline-variant/20"></div>
        <div className="text-zinc-400 text-sm">Dashboard / <span className="text-on-surface font-semibold">Audit Logs</span></div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2 mr-4">
          <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800/50 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800/50 transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
          <div className="text-right">
            <div className="text-xs font-bold text-on-surface">Alex Rivera</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Administrator</div>
          </div>
          <img 
            alt="User Profile" 
            className="w-9 h-9 rounded-full border border-primary/20 object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqU6VolapodlY2xHTQXAkdzLw42Z83GO8MerDAmecE1uwwP0-9F5ue00nirvOojTOhYrmN9_UHgzypVHfgv2AQuyYn9QRq98nwbwHwRpo2liGVgHJS6oft5BgJd_yICZifa3rDSLvKZWf-meJjwLY3VDPgwyGpCktzyVjkQfK-r8nLd1SgFatPLK59fF8pJWWiTSBYUJG4NXejoSjYCbAPZ3R7vUvzVnXZasSSvyVfK7HgfXOVbzcb3vDmwQyRc-DzbK24YKFePNo"
          />
        </div>
      </div>
    </header>
  );
}
