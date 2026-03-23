"use client";

import React, { useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";

interface AISimulatorProps {
  onTrigger: (success: boolean) => void;
}

export function AISimulator({ onTrigger }: AISimulatorProps) {
  const { activeTenant } = useTenant();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/notifications/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": activeTenant.id,
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type: "RISK_DETECTED",
          contractId: "res_7712_v1",
          severity: "HIGH",
          details: "Compliance risk found in indemnification clause."
        }),
      });

      if (response.ok) {
        onTrigger(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Webhook failed:", errorData);
        onTrigger(false);
      }
    } catch (e) {
      console.error(e);
      onTrigger(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Webhook Simulator Card */}
      <div className="glass-card rounded-2xl border border-primary/20 p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface">AI Agent Simulator</h3>
            <p className="text-[10px] uppercase tracking-widest text-primary/70 font-semibold">Webhook Testing</p>
          </div>
        </div>
        <div className="space-y-4 relative z-10">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 font-label">Payload Type</label>
            <div className="bg-surface-container-low rounded-lg px-4 py-2 text-sm text-zinc-300 border-b border-outline-variant/30 flex justify-between items-center">
              Compliance Risk
              <span className="material-symbols-outlined text-sm text-zinc-600">arrow_drop_down</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 font-label">Target Endpoint</label>
            <div className="bg-surface-container-low rounded-lg px-4 py-2 text-xs font-mono text-primary/80 border-b border-outline-variant/30 truncate">
                https://api.ledger.v1/hooks/risk
            </div>
          </div>
          <button 
            onClick={handleTrigger}
            disabled={loading}
            className="w-full mt-4 py-3 bg-error text-on-error font-bold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Simulating..." : "Trigger AI Risk Alert"}
            {!loading && <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>}
          </button>
          <p className="text-[10px] text-zinc-500 text-center px-4 leading-relaxed">
            This will simulate a JSON payload representing a high-risk clause detection in active contracts.
          </p>
        </div>
      </div>

      {/* System Health Stats */}
      <div className="glass-card rounded-2xl border border-outline-variant/5 p-6 space-y-6">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Live Status</h3>
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">settings_ethernet</span>
                    <span className="text-sm font-medium">Webhook Gateway</span>
                </div>
                <div className="text-xs font-bold text-secondary">Operational</div>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">terminal</span>
                    <span className="text-sm font-medium">Audit Logger</span>
                </div>
                <div className="text-xs font-bold text-secondary">Active</div>
            </div>
            <div className="flex justify-between items-center text-zinc-500">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">cloud_off</span>
                    <span className="text-sm font-medium">Backup Sync</span>
                </div>
                <div className="text-[10px] font-bold uppercase">Pending</div>
            </div>
        </div>
        <div className="pt-4 border-t border-outline-variant/10">
            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-4/5 rounded-full"></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-medium">
                <span className="text-zinc-500">Storage Usage</span>
                <span className="text-on-surface">82% / 10TB</span>
            </div>
        </div>
      </div>
    </div>
  );
}
