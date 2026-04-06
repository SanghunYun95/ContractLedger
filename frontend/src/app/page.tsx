"use client";

import React, { useState } from "react";
import { AuditTable } from "@/components/dashboard/AuditTable";
import { Toast } from "@/components/ui/Toast";

export default function Dashboard() {
  const [showToast, setShowToast] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filterOptions = [
    { label: "전체 보기", value: null },
    { label: "계약 생성", value: "CREATE_CONTRACT" },
    { label: "계약 수정", value: "UPDATE_CONTRACT" },
    { label: "AI 분석 실행", value: "CONTRACT_AI_REVIEW" },
    { label: "리스크 감지", value: "RISK_DETECTED" },
    { label: "서명 완료", value: "SIGNATURE_COMPLETED" },
  ];

  return (
    <>
      <div className="flex-1 overflow-y-auto p-8 space-y-12">
        {/* Hero Metrics / Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">감사 로그 (Audit Ledger)</h1>
            <p className="text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              플랫폼 내 모든 이벤트, 계약 수정 및 보안 이상 징후를 실시간으로 추적 중입니다.
            </p>
          </div>
          <div className="flex gap-4 relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-6 py-2.5 rounded-xl border border-outline-variant/10 text-sm font-medium flex items-center gap-2 transition-all cursor-pointer ${showFilterDropdown ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'}`}
            >
              <span className="material-symbols-outlined text-sm">filter_list</span> 
              {filterAction ? filterOptions.find(o => o.value === filterAction)?.label : "로그 필터링"}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-outline-variant/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value || 'all'}
                    onClick={() => {
                      setFilterAction(opt.value);
                      setShowFilterDropdown(false);
                    } }
                    className={`w-full text-left px-5 py-3 text-xs font-bold hover:bg-white/5 transition-colors ${filterAction === opt.value ? 'text-primary' : 'text-zinc-400'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 space-y-4">
            <AuditTable refreshTrigger={refreshKey} filterAction={filterAction} />
          </div>
        </div>
      </div>
      <Toast
        show={showToast}
        onHide={() => setShowToast(false)}
        title="조치 완료"
        message="요청하신 작업이 성공적으로 처리되었습니다."
        type="success"
      />
    </>
  );
}
