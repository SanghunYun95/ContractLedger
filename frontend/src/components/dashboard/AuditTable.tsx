"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  resourceId: string;
  ipAddress: string;
  createdAt: string;
}

const getBadgeStyle = (action: string) => {
  switch(action) {
    case 'CREATE_CONTRACT':
      return "bg-secondary-container/20 text-secondary border-secondary/10";
    case 'RISK_DETECTED':
      return "bg-error-container/20 text-error border-error/10";
    case 'SIGNATURE_COMPLETED':
      return "bg-tertiary-container/20 text-tertiary-fixed border-tertiary/10";
    default:
      return "bg-outline-variant/20 text-zinc-400 border-zinc-500/10";
  }
};

const getBadgeDotColor = (action: string) => {
  switch(action) {
    case 'CREATE_CONTRACT':
      return "bg-secondary";
    case 'RISK_DETECTED':
      return "bg-error";
    case 'SIGNATURE_COMPLETED':
      return "bg-tertiary-fixed";
    default:
      return "bg-zinc-400";
  }
}

interface AuditTableProps {
  refreshTrigger?: number;
}

export function AuditTable({ refreshTrigger }: AuditTableProps) {
  const { activeTenant } = useTenant();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/audit/logs", {
          headers: {
            "x-tenant-id": activeTenant.id,
            "Authorization": "Bearer demo-token-123"
          }
        });
        if (res.ok && current) {
          const data = await res.json();
          setLogs(data);
        } else if (current) {
          console.error("Failed to fetch logs:", res.status);
        }
      } catch (e) {
        console.error("Failed to fetch logs", e);
      } finally {
        if (current) setLoading(false);
      }
    };

    fetchLogs();

    // Re-fetch occasionally or relying on the user to switch tenant to re-fetch
    const interval = setInterval(fetchLogs, 5000);

    return () => {
      current = false;
      clearInterval(interval);
    };
  }, [activeTenant, refreshTrigger]);

  return (
    <div className="glass-card rounded-2xl border border-outline-variant/5 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low text-zinc-500 font-label text-xs uppercase tracking-widest">
            <th className="px-6 py-4 font-semibold">Event ID</th>
            <th className="px-6 py-4 font-semibold">Action</th>
            <th className="px-6 py-4 font-semibold">User</th>
            <th className="px-6 py-4 font-semibold">Resource</th>
            <th className="px-6 py-4 font-semibold">IP Address</th>
            <th className="px-6 py-4 font-semibold">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/5">
          {loading && logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm">
                <span className="material-symbols-outlined animate-spin inline-block text-primary">sync</span>
                <div className="mt-2">Connecting to Vault...</div>
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 text-sm">No audit records found for this tenant.</td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="group hover:bg-surface-container-high transition-colors cursor-default">
                <td className="px-6 py-5 font-mono text-xs text-indigo-400">{log.id.slice(0, 13)}</td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(log.action)}`}>
                    <span className={`w-1 h-1 rounded-full ${getBadgeDotColor(log.action)}`}></span> {log.action}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm">{log.userId}</td>
                <td className="px-6 py-5 text-sm text-zinc-400">{log.resourceId || "-"}</td>
                <td className="px-6 py-5 text-xs font-mono text-zinc-500">{log.ipAddress || "-"}</td>
                <td className="px-6 py-5 text-xs text-zinc-500">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center text-xs text-zinc-500">
        <div>Showing {logs.length} entries for <strong>{activeTenant.name}</strong></div>
        <div className="flex gap-2">
          <button className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors cursor-pointer disabled:opacity-50">
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors cursor-pointer disabled:opacity-50">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
