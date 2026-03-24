"use client";

import React, { useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";

interface ContractFormProps {
  contract?: any; // If provided, we are in Edit Mode
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContractForm({ contract, onSuccess, onCancel }: ContractFormProps) {
  const { activeTenant } = useTenant();
  const { token, refreshToken, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: contract?.title || "",
    content: contract?.content || "",
    status: contract?.status || "DRAFT"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Helper to send request with given token
  const sendContractRequest = async (accessToken: string) => {
    const url = contract ? `/api/contracts/${contract.id}` : "/api/contracts";
    const method = contract ? "PATCH" : "POST";
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("content", formData.content);
    payload.append("status", formData.status);
    if (file) {
      payload.append("file", file);
    }

    return fetch(url, {
      method,
      headers: {
        "x-tenant-id": activeTenant.id,
        "Authorization": `Bearer ${accessToken}`
      },
      body: payload
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      let res = await sendContractRequest(token);

      // 401 Unauthorized 발생 시 토큰 갱신 후 재진행
      if (res.status === 401) {
        if (process.env.NODE_ENV === "development") {
          console.log("Token expired, attempting refresh...");
        }
        const newToken = await refreshToken();
        if (newToken) {
          res = await sendContractRequest(newToken);
        } else {
          logout();
          return;
        }
      }

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.message || "작업 실패");
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-outline-variant/10 p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">{contract ? 'edit_document' : 'add_notes'}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            {contract ? '계약 정보 수정' : '새로운 계약 등록'}
          </h2>
          <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mt-0.5">보안 문서 보관함 (SECURE STORAGE)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">계약서 제목 (Title)</label>
          <input
            type="text"
            name="title"
            placeholder="예: 2024년 전략적 파트너십 합의서"
            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-zinc-600 text-zinc-200"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">계약 상세 내용 (Content)</label>
          <textarea
            name="content"
            rows={5}
            placeholder="계약의 주요 목적이나 핵심 조항을 입력하세요..."
            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-zinc-600 resize-none text-zinc-200"
            value={formData.content}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">진행 상태 (Status)</label>
            <div className="relative">
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all cursor-pointer text-zinc-200"
              >
                <option value="DRAFT">초안 (DRAFT)</option>
                <option value="PENDING">검토 중 (PENDING)</option>
                <option value="SIGNED">서명 완료 (SIGNED)</option>
                <option value="EXPIRED">만료됨 (EXPIRED)</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">expand_more</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">계약서 파일 (PDF)</label>
            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full border-2 border-dashed rounded-xl py-2.5 px-4 transition-all flex items-center gap-3 ${
                file ? "border-primary/50 bg-primary/5" : "border-outline-variant/10 hover:border-primary/30 bg-surface-container-low"
              }`}>
                <span className={`material-symbols-outlined text-sm ${file ? "text-primary" : "text-zinc-500"}`}>
                  {file ? "check_circle" : "cloud_upload"}
                </span>
                <span className="text-[11px] font-medium text-zinc-400 truncate max-w-[150px]">
                  {file ? file.name : (contract?.fileUrl ? '기존 파일 교체' : 'PDF 파일 선택')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            {error}
          </div>
        )}

        <div className="pt-6 flex gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-4 px-4 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-900 transition-all border border-zinc-800"
          >
            취소
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-[2] py-4 px-4 bg-primary text-on-primary font-black shadow-xl shadow-primary/20 hover:bg-primary-dim hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                처리 중...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">{contract ? 'save' : 'verified'}</span>
                {contract ? '계약 정보 저장' : '보관함에 계약 등록'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
