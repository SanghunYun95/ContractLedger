"use client";

import React from "react";

interface RedFlag {
  flag: string;
  issue: string;
  location: string;
}

interface MarketStandard {
  term: string;
  found_value: string;
  standard: string;
  gap: string;
}

interface DetailedItem {
  clause: string;
  issue: string;
  redline?: string;
  reason?: string;
}

interface AnalysisData {
  overall: string;
  summary: string;
  partyContext?: string;
  redFlags: RedFlag[];
  marketStandards: MarketStandard[];
  detailedAnalysis: {
    critical: DetailedItem[];
    important: DetailedItem[];
    acceptable: DetailedItem[];
  };
}

interface ContractAnalysisModalProps {
  contractTitle: string;
  riskScore: number;
  analysisJson: string;
  onClose: () => void;
}

export function ContractAnalysisModal({
  contractTitle,
  riskScore,
  analysisJson,
  onClose,
}: ContractAnalysisModalProps) {
  let data: AnalysisData;
  try {
    data = JSON.parse(analysisJson);
  } catch (e) {
    console.error("Failed to parse analysis JSON", e);
    // 파싱 실패 시 최소한의 빈 데이터 객체 제공
    data = {
      overall: "Unknown",
      summary: "AI 분석 데이터를 불러올 수 없거나 형식이 잘못되었습니다.",
      redFlags: [],
      marketStandards: [],
      detailedAnalysis: { critical: [], important: [], acceptable: [] }
    };
  }

  // 런타임 안정성 확보: data 객체의 각 필드가 배열인지 확인
  const redFlags = Array.isArray(data?.redFlags) ? data.redFlags : [];
  const marketStandards = Array.isArray(data?.marketStandards) ? data.marketStandards : [];
  const criticalIssues = Array.isArray(data?.detailedAnalysis?.critical) ? data.detailedAnalysis.critical : [];
  const importantIssues = Array.isArray(data?.detailedAnalysis?.important) ? data.detailedAnalysis.important : [];

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-rose-500 shadow-rose-500/20";
    if (score >= 40) return "text-amber-500 shadow-amber-500/20";
    return "text-emerald-500 shadow-emerald-500/20";
  };

  const getBgColor = (score: number) => {
    if (score >= 70) return "bg-rose-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] glass-card rounded-3xl border border-outline-variant/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">

        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black ${getBgColor(riskScore)} text-black shadow-lg`}>
              {riskScore}%
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{contractTitle}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded border border-current ${getRiskColor(riskScore)}`}>
                  AI RISK ANALYSIS: {data?.overall || "UNKNOWN"}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">• 법조계 정밀 분석 시스템 v2.0 (Powered by GPT-4o)</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all active:scale-90"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-10">

          {/* Executive Summary & Party Context */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">description</span>
                종합 검토 의견 (Executive Summary)
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5">
                {data?.summary || "분석 요약 정보를 불러올 수 없습니다."}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">person_search</span>
                당사자 지위 분석
              </h3>
              <div className="bg-amber-500/5 p-5 rounded-2xl border border-amber-500/10 min-h-[100px]">
                <p className="text-amber-200/80 text-xs font-medium leading-relaxed italic">
                  "{data?.partyContext || "당사자의 지위(제공자/수령자)에 따른 구체적 맥락이 확인되지 않았습니다."}"
                </p>
              </div>
            </div>
          </section>

          {/* Red Flags Table */}
          {redFlags.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-rose-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                주요 독소 조항 (Red Flags)
              </h3>
              <div className="border border-rose-500/20 rounded-2xl overflow-hidden bg-rose-500/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-rose-500/10 text-[10px] font-black uppercase tracking-wider text-rose-300/60">
                      <th className="px-6 py-4">조항명</th>
                      <th className="px-6 py-4">식별된 문제점</th>
                      <th className="px-6 py-4">위치</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-500/10">
                    {redFlags.map((flag, i) => (
                      <tr key={i} className="text-sm">
                        <td className="px-6 py-4 font-bold text-rose-200">{flag?.flag || "-"}</td>
                        <td className="px-6 py-4 text-zinc-400 text-xs">{flag?.issue || "-"}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-rose-300/40">{flag?.location || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Detailed Redline / Analysis */}
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">gavel</span>
              법률가 검토 의견 및 수정 제안 (Detailed Analysis)
            </h3>

            <div className="space-y-4">
              {/* Critical Issues */}
              {criticalIssues.map((item, i) => (
                <div key={i} className="group relative bg-surface-container-high rounded-2xl border border-rose-500/30 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">Critical Issue #{i + 1}</span>
                      <span className="material-symbols-outlined text-rose-500 opacity-30">warning</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-tight">계약서 조항 원문</p>
                      <p className="text-zinc-200 text-sm font-medium italic">"{item.clause}"</p>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                      <div className="flex gap-3">
                        <span className="material-symbols-outlined text-rose-400 text-[18px] flex-shrink-0">report_problem</span>
                        <p className="text-rose-200 text-xs leading-relaxed">{item.issue}</p>
                      </div>
                      <div className="flex gap-3 pt-2 border-t border-white/5">
                        <span className="material-symbols-outlined text-emerald-400 text-[18px] flex-shrink-0">edit_note</span>
                        <div className="space-y-1">
                          <p className="text-emerald-400 text-[10px] font-black uppercase tracking-tighter">추천 수정 문구 (Suggested Redline)</p>
                          <p className="text-emerald-100 text-xs leading-relaxed font-semibold">{item.redline}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Important Issues */}
              {importantIssues.map((item, i) => (
                <div key={i} className="group relative bg-surface-container-high rounded-2xl border border-amber-500/20 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Important Concern</span>
                    </div>
                    <p className="text-zinc-300 text-sm font-semibold">{item?.clause || "-"}</p>
                    <p className="text-zinc-500 text-xs">{item?.issue || "-"}</p>
                    {item?.redline && <p className="text-indigo-300 text-xs bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10 font-medium">💡 참고: {item.redline}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Market Comparison */}
          {marketStandards.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                시장 표준 대비 격차 분석 (Market Standard Comparison)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketStandards.map((item, i) => (
                  <div key={i} className="bg-surface-container-low border border-outline-variant/10 p-5 rounded-2xl space-y-3">
                    <p className="text-zinc-100 font-bold text-sm tracking-tight">{item?.term || "-"}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">계약서 내용</p>
                        <p className="text-rose-400 text-xs font-medium">{item?.found_value || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">한국 시장 표준</p>
                        <p className="text-emerald-400 text-xs font-medium">{item?.standard || "-"}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <p className="text-zinc-500 text-[10px] italic">"{item?.gap || "-"}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/10 bg-surface-container-low/50 flex justify-between items-center">
          <p className="text-[10px] text-zinc-600 font-medium">• AI 분석 결과는 법적 자문을 대체할 수 없습니다.</p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-bold rounded-xl transition-all active:scale-95 border border-zinc-700/50"
          >
            보고서 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
