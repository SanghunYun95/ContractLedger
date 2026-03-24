"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";

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
    case 'UPDATE_CONTRACT':
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case 'CONTRACT_AI_REVIEW':
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
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
    case 'UPDATE_CONTRACT':
      return "bg-amber-400";
    case 'CONTRACT_AI_REVIEW':
      return "bg-blue-400";
    case 'RISK_DETECTED':
      return "bg-error";
    case 'SIGNATURE_COMPLETED':
      return "bg-tertiary-fixed";
    default:
      return "bg-zinc-400";
  }
}

const translateAction = (action: string) => {
  switch(action) {
    case 'CREATE_CONTRACT': return '계약 생성';
    case 'UPDATE_CONTRACT': return '계약 수정';
    case 'DELETE_CONTRACT': return '계약 삭제';
    case 'CONTRACT_AI_REVIEW': return 'AI 분석 실행';
    case 'RISK_DETECTED': return '리스크 감지';
    case 'SIGNATURE_COMPLETED': return '서명 완료';
    default: return action;
  }
}

interface AuditTableProps {
  refreshTrigger?: number;
}

export function AuditTable({ refreshTrigger }: AuditTableProps) {
  const { activeTenant } = useTenant();
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    const fetchLogs = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${baseUrl}/api/audit/logs`, {
          headers: {
            "x-tenant-id": activeTenant.id,
            "Authorization": `Bearer ${token}`
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

    const interval = setInterval(fetchLogs, 5000);

    return () => {
      current = false;
      clearInterval(interval);
    };
  }, [activeTenant, refreshTrigger, token]);

  return (
    <div className="glass-card rounded-2xl border border-outline-variant/5 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low text-zinc-500 font-label text-xs uppercase tracking-widest">
            <th className="px-6 py-4 font-semibold text-[10px]">이벤트 ID</th>
            <th className="px-6 py-4 font-semibold text-[10px]">동작 (Action)</th>
            <th className="px-6 py-4 font-semibold text-[10px]">사용자</th>
            <th className="px-6 py-4 font-semibold text-[10px]">대상 리소스</th>
            <th className="px-6 py-4 font-semibold text-[10px]">IP 주소</th>
            <th className="px-6 py-4 font-semibold text-[10px]">발생 시각</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/5">
          {loading && logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm">
                <span className="material-symbols-outlined animate-spin inline-block text-primary">sync</span>
                <div className="mt-2 text-indigo-400 font-medium">관리 데이터 연동 중...</div>
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 text-sm italic">기록된 감사 로그가 없습니다.</td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="group hover:bg-surface-container-high transition-colors cursor-default">
                <td className="px-6 py-5 font-mono text-xs text-indigo-400/70">{log.id.slice(0, 13)}</td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(log.action)} shadow-sm`}>
                    <span className={`w-1 h-1 rounded-full ${getBadgeDotColor(log.action)}`}></span> {translateAction(log.action)}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm font-medium text-zinc-300">{log.userId}</td>
                <td className="px-6 py-5 text-sm text-zinc-400">{log.resourceId || "-"}</td>
                <td className="px-6 py-5 text-xs font-mono text-zinc-500">{log.ipAddress || "-"}</td>
                <td className="px-6 py-5 text-xs text-zinc-500">{new Date(log.createdAt).toLocaleString('ko-KR')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center text-xs text-zinc-500">
        <div>총 <strong>{logs.length}</strong>개의 로그 항목 조회됨 (테넌트: {activeTenant.name})</div>
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
