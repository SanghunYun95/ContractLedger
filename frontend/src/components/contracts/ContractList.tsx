"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";

interface Contract {
  id: string;
  title: string;
  status: string;
  riskScore?: number;
  fileUrl?: string;
  originalFileName?: string;
}

interface ContractListProps {
  onEdit?: (contract: Contract) => void;
  refreshTrigger?: number;
}

export function ContractList({ onEdit, refreshTrigger }: ContractListProps) {
  const { activeTenant } = useTenant();
  const { token } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);

  const fetchContracts = async () => {
    if (!token) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${baseUrl}/api/contracts`, {
        headers: {
          "x-tenant-id": activeTenant.id,
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setContracts(data);
      }
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setContracts([]); // 테넌트 변경 시 기존 데이터 즉시 비우기
    fetchContracts();
  }, [activeTenant.id, refreshTrigger, token]);

  const handleAnalyze = async (id: string) => {
    if (!token) return;
    setAnalyzingIds(prev => [...prev, id]);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${baseUrl}/api/contracts/${id}/analyze`, {
        method: "POST",
        headers: {
          "x-tenant-id": activeTenant.id,
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        // Simple polling simulation or re-fetch
        setTimeout(fetchContracts, 2000);
      }
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setTimeout(() => {
        setAnalyzingIds(prev => prev.filter(aid => aid !== id));
      }, 2000);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!token || !confirm(`'${title}' 계약서를 보관함에서 영구적으로 삭제하시겠습니까?`)) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${baseUrl}/api/contracts/${id}`, {
        method: "DELETE",
        headers: {
          "x-tenant-id": activeTenant.id,
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchContracts();
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'SIGNED': return '서명 완료';
      case 'PENDING': return '검토 중';
      case 'DRAFT': return '초안';
      case 'EXPIRED': return '만료됨';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'PENDING': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'DRAFT': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'EXPIRED': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-rose-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <div className="glass-card rounded-2xl border border-outline-variant/5 overflow-hidden shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low text-zinc-500 font-label text-[10px] uppercase tracking-widest border-b border-outline-variant/10">
            <th className="px-6 py-5 font-bold">계약 정보 및 식별값</th>
            <th className="px-6 py-5 font-bold">진행 단계</th>
            <th className="px-6 py-5 font-bold">AI 리스크 평가</th>
            <th className="px-6 py-5 text-right font-bold tracking-widest uppercase">관리 동작</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {loading && contracts.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-24 text-center text-zinc-500 text-sm">
                <div className="flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined animate-spin text-4xl text-primary opacity-50">sync</span>
                  <div className="text-xs font-bold uppercase tracking-widest opacity-70">암호화된 기록에 접근 중...</div>
                </div>
              </td>
            </tr>
          ) : contracts.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-24 text-center text-zinc-500 text-sm italic">
                <div className="flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-4xl opacity-20">inventory_2</span>
                  <div className="text-xs uppercase font-bold tracking-widest">보관함이 비어 있습니다</div>
                </div>
              </td>
            </tr>
          ) : (
            contracts.map((contract) => (
              <tr key={contract.id} className="group hover:bg-white/[0.02] transition-colors cursor-default">
                <td className="px-6 py-6">
                  <div className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors flex items-center gap-2">
                    {contract.title}
                    {contract.fileUrl && <span className="material-symbols-outlined text-[14px] text-emerald-500 font-bold" title="파일 업로드됨">verified</span>}
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono mt-1 tracking-tighter uppercase">{contract.id.slice(0, 8)}...{contract.id.slice(-4)}</div>
                </td>
                <td className="px-6 py-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg border text-[10px] font-black tracking-tight ${getStatusColor(contract.status)} shadow-sm`}>
                    {translateStatus(contract.status)}
                  </span>
                </td>
                <td className="px-6 py-6">
                  {contract.riskScore !== undefined ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[80px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${contract.riskScore >= 70 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : (contract.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                          style={{ width: `${contract.riskScore}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-black tracking-tighter ${getRiskColor(contract.riskScore)}`}>
                        {contract.riskScore}% 리스크
                      </span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAnalyze(contract.id)}
                      disabled={analyzingIds.includes(contract.id)}
                      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${analyzingIds.includes(contract.id) ? 'text-zinc-600 animate-pulse' : 'text-primary hover:text-white'}`}
                    >
                      <span className={`material-symbols-outlined text-[16px] ${analyzingIds.includes(contract.id) ? 'animate-spin' : ''}`}>
                        {analyzingIds.includes(contract.id) ? 'psychology' : 'bolt'}
                      </span>
                      {analyzingIds.includes(contract.id) ? '분석 중...' : '분석 실행'}
                    </button>
                  )}
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="flex justify-end gap-1 text-zinc-500">
                    {contract.fileUrl && (
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL || ""}${contract.fileUrl}?token=${token}&tenantId=${activeTenant.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all active:scale-90"
                        title="파일 다운로드"
                      >
                        <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                      </a>
                    )}
                    <button 
                      onClick={() => onEdit?.(contract)}
                      className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                      title="수정"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_square</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(contract.id, contract.title)}
                      className="p-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90"
                      title="삭제"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
