"use client";

import React, { useState } from "react";
import { AuditTable } from "@/components/dashboard/AuditTable";
import { AISimulator } from "@/components/dashboard/AISimulator";
import { Toast } from "@/components/ui/Toast";

export default function Dashboard() {
  const [showToast, setShowToast] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTrigger = (success: boolean) => {
    if (success) {
      setShowToast(true);
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-8 space-y-12">
        {/* Hero Metrics / Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">Audit Ledger</h1>
            <p className="text-zinc-500 mt-2 max-w-lg">
              Real-time immutable tracking of all platform events, contract modifications, and security anomalies.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2.5 bg-surface-container-high text-on-surface rounded-xl border border-outline-variant/10 text-sm font-medium flex items-center gap-2 hover:bg-surface-container-highest transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">filter_list</span> Filter Logs
            </button>
            <button className="px-6 py-2.5 bg-primary text-on-primary-container rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/10 hover:scale-[1.02] transition-transform cursor-pointer">
              <span className="material-symbols-outlined text-sm">download</span> Export CSV
            </button>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-9 space-y-4">
            <AuditTable refreshTrigger={refreshKey} />
          </div>
          <div className="col-span-12 xl:col-span-3 space-y-6">
            <AISimulator onTrigger={handleTrigger} />
          </div>
        </div>
      </div>
      <Toast show={showToast} onHide={() => setShowToast(false)} />
    </>
  );
}
