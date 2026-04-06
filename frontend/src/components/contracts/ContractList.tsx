"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { ContractAnalysisModal } from "./ContractAnalysisModal";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

interface Contract {
  id: string;
  title: string;
  status: string;
  riskScore?: number;
  riskAnalysis?: string;
  fileUrl?: string;
  originalFileName?: string;
}

interface ContractListProps {
  onEdit?: (contract: Contract) => void;
  refreshTrigger?: number;
}

export function ContractList({ onEdit, refreshTrigger }: ContractListProps) {
  const { activeTenant } = useTenant();
  const { token, refreshToken } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);
  const [selectedAnalysisContract, setSelectedAnalysisContract] = useState<Contract | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const fetchContracts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/contracts`, {
        headers: {
          "x-tenant-id": activeTenant.id,
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setContracts(data);
      } else if (res.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          const retryRes = await fetch(`${API_BASE}/api/contracts`, {
            headers: {
              "x-tenant-id": activeTenant.id,
              "Authorization": `Bearer ${newToken}`
            }
          });
          if (retryRes.ok) {
            const data = await retryRes.json();
            setContracts(data);
          }
        }
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

  // 실시간 알림 로직: 분석 완료 시 목록 자동 갱신
  useEffect(() => {
    const handleRefresh = () => {
      fetchContracts();
    };
    window.addEventListener("refreshContracts", handleRefresh);
    return () => window.removeEventListener("refreshContracts", handleRefresh);
  }, []);

  const handleAnalyze = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) {
      console.warn("[ContractList] No auth token found. Cannot analyze.");
      return;
    }
    
    console.log(`[ContractList] Initiating AI analysis for contract ID: ${id}`);
    
    // 분석 시작 시 로딩 상태 추가
    setAnalyzingIds(prev => [...prev, id]);
    
    try {
      let currentToken = token;
      let res = await fetch(`${API_BASE}/api/contracts/${id}/analyze`, {
        method: "POST",
        headers: {
          "x-tenant-id": activeTenant.id,
          "Authorization": `Bearer ${currentToken}`
        }
      });
      
      if (res.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          currentToken = newToken;
          res = await fetch(`${API_BASE}/api/contracts/${id}/analyze`, {
            method: "POST",
            headers: {
              "x-tenant-id": activeTenant.id,
              "Authorization": `Bearer ${currentToken}`
            }
          });
        }
      }

      console.log(`[ContractList] Analysis request result. Status: ${res.status}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("[ContractList] Analysis request failed", {
          status: res.status,
          statusText: res.statusText,
          errorData
        });
        throw new Error(errorData.message || "Analysis request failed");
      }
      
      console.log("[ContractList] Analysis request accepted by server.");
    } catch (e: any) {
      console.error("[ContractList] Analysis error catch:", e);
      alert(e.message || "AI 분석 서비스와 통신하는 중 오류가 발생했습니다.");
      setAnalyzingIds(prev => prev.filter(aid => aid !== id));
    } finally {
      // 분석 요청 완료 후 5초 뒤에 로딩 상태 제거 (충분한 시간을 둠)
      setTimeout(() => {
        setAnalyzingIds(prev => prev.filter(aid => aid !== id));
      }, 5000);
    }
  };

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || !confirm(`'${title}' 계약서를 보관함에서 영구적으로 삭제하시겠습니까?`)) return;
    try {
      let currentToken = token;
      let res = await fetch(`${API_BASE}/api/contracts/${id}`, {
        method: "DELETE",
        headers: {
          "x-tenant-id": activeTenant.id,
          "Authorization": `Bearer ${currentToken}`
        }
      });

      if (res.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          currentToken = newToken;
          res = await fetch(`${API_BASE}/api/contracts/${id}`, {
            method: "DELETE",
            headers: {
              "x-tenant-id": activeTenant.id,
              "Authorization": `Bearer ${currentToken}`
            }
          });
        }
      }

      if (res.ok) {
        await fetchContracts();
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleDownload = async (contract: Contract, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || !contract.fileUrl) return;
    try {
      let currentToken = token;
      let res = await fetch(`${API_BASE}${contract.fileUrl}`, {
        headers: {
          "Authorization": `Bearer ${currentToken}`,
          "x-tenant-id": activeTenant.id,
        },
      });

      if (res.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          currentToken = newToken;
          res = await fetch(`${API_BASE}${contract.fileUrl}`, {
            headers: {
              "Authorization": `Bearer ${currentToken}`,
              "x-tenant-id": activeTenant.id,
            },
          });
        }
      }

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = contract.originalFileName || "contract.pdf";
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download error", e);
      alert("파일을 다운로드하는 중 오류가 발생했습니다.");
    }
  };

  const handlePreview = async (contract: Contract, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || !contract.fileUrl) return;
    setIsPreviewLoading(true);
    try {
      let currentToken = token;
      let res = await fetch(`${API_BASE}${contract.fileUrl}`, {
        headers: {
          "Authorization": `Bearer ${currentToken}`,
          "x-tenant-id": activeTenant.id,
        },
      });

      if (res.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          currentToken = newToken;
          res = await fetch(`${API_BASE}${contract.fileUrl}`, {
            headers: {
              "Authorization": `Bearer ${currentToken}`,
              "x-tenant-id": activeTenant.id,
            },
          });
        }
      }

      if (!res.ok) throw new Error("File fetch failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (e) {
      console.error("Preview error", e);
      alert("파일을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
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
                <td className="px-6 py-6" onClick={() => onEdit?.(contract)}>
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
                  {contract.riskScore != null ? (
                    <button 
                      onClick={() => setSelectedAnalysisContract(contract)}
                      className="flex items-center gap-3 group/risk hover:bg-white/5 p-2 rounded-xl transition-all"
                    >
                      <div className="flex-1 w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${contract.riskScore >= 70 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : (contract.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                          style={{ width: `${contract.riskScore}%` }}
                        />
                      </div>
                      <div className="flex flex-col items-start gap-0.5">
                        <span className={`text-[11px] font-black tracking-tighter ${getRiskColor(contract.riskScore)}`}>
                          {contract.riskScore}% 리스크
                        </span>
                        <span className="text-[9px] text-primary font-bold uppercase tracking-widest opacity-0 group-hover/risk:opacity-100 transition-opacity">보고서 보기</span>
                      </div>
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => handleAnalyze(contract.id, e)}
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
                      <>
                        <button 
                          type="button"
                          onClick={(e) => handlePreview(contract, e)}
                          className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                          title="미리보기"
                          aria-label="미리보기"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDownload(contract, e)}
                          className="p-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all active:scale-90"
                          title="파일 다운로드"
                          aria-label="파일 다운로드"
                        >
                          <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => onEdit?.(contract)}
                      className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                      title="수정"
                      aria-label="계약 수정"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_square</span>
                    </button>
                    <button 
                      onClick={(e) => handleDelete(contract.id, contract.title, e)}
                      className="p-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90"
                      title="삭제"
                      aria-label="계약 삭제"
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

      {/* Analysis Modal */}
      {selectedAnalysisContract && (
        <ContractAnalysisModal
          contractTitle={selectedAnalysisContract.title}
          riskScore={selectedAnalysisContract.riskScore || 0}
          analysisJson={selectedAnalysisContract.riskAnalysis || "{}"}
          onClose={() => setSelectedAnalysisContract(null)}
        />
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closePreview} />
          <div className="relative w-full max-w-5xl h-full bg-[#0a0a0b] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">description</span>
                <h3 className="font-bold text-white tracking-tight">문서 미리보기</h3>
              </div>
              <button 
                onClick={closePreview}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 w-full bg-zinc-900/50">
              <iframe 
                src={`${previewUrl}#toolbar=0`} 
                className="w-full h-full border-none"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Loading Overlay for Preview */}
      {isPreviewLoading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-[#121214] border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">문서 보안 해제 및 로드 중...</span>
          </div>
        </div>
      )}
    </div>
  );
}
