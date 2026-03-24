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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${baseUrl}/api/notifications/webhook`, {
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
      <div className="glass-card rounded-2xl border border-primary/20 p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface">AI 에이전트 시뮬레이터</h3>
            <p className="text-[10px] uppercase tracking-widest text-primary/70 font-semibold">웹훅 테스트 모드</p>
          </div>
        </div>
        <div className="space-y-4 relative z-10">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 font-label">페이로드 유형 (Payload Type)</label>
            <div className="bg-surface-container-low rounded-lg px-4 py-2 text-sm text-zinc-300 border-b border-outline-variant/30 flex justify-between items-center">
              컴플라이언스 리스크 감지
              <span className="material-symbols-outlined text-sm text-zinc-600">arrow_drop_down</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 font-label">대상 엔드포인트</label>
            <div className="bg-surface-container-low rounded-lg px-4 py-2 text-xs font-mono text-primary/80 border-b border-outline-variant/30 truncate">
                /api/notifications/webhook
            </div>
          </div>
          <button 
            onClick={handleTrigger}
            disabled={loading}
            className="w-full mt-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl text-sm hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "시뮬레이션 중..." : "AI 리스크 알림 발생"}
            {!loading && <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>}
          </button>
          <p className="text-[10px] text-zinc-500 text-center px-4 leading-relaxed">
            활성 계약서 내 고위험 조항 감지를 가정한 JSON 데이터 웹훅을 전송합니다.
          </p>
        </div>
      </div>

      {/* System Health Stats */}
      <div className="glass-card rounded-2xl border border-outline-variant/5 p-6 space-y-6">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">시스템 상태 (Live Status)</h3>
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">settings_ethernet</span>
                    <span className="text-sm font-medium">웹훅 게이트웨이</span>
                </div>
                <div className="text-xs font-bold text-emerald-400">정상 작동 (Operational)</div>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">terminal</span>
                    <span className="text-sm font-medium">감사 로그 시스템</span>
                </div>
                <div className="text-xs font-bold text-emerald-400">활성화됨 (Active)</div>
            </div>
            <div className="flex justify-between items-center text-zinc-500">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">cloud_off</span>
                    <span className="text-sm font-medium">백업 데이터 동기화</span>
                </div>
                <div className="text-[10px] font-bold uppercase">대기 중 (Pending)</div>
            </div>
        </div>
        <div className="pt-4 border-t border-outline-variant/10">
            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-4/5 rounded-full"></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-medium">
                <span className="text-zinc-500">스토리지 사용량</span>
                <span className="text-on-surface">82% / 10TB</span>
            </div>
        </div>
      </div>
    </div>
  );
}
