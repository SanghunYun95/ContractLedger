"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";

interface Contract {
  id: string;
  title: string;
  status: string;
  fileUrl?: string;
  originalFileName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContractListProps {
  refreshTrigger?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const toApiUrl = (path: string) => `${API_BASE_URL}${path}`;

export function ContractList({ refreshTrigger }: ContractListProps) {
  const { activeTenant } = useTenant();
  const { token } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    const fetchContracts = async () => {
      if (!token || !activeTenant?.id) {
        if (current) {
          setContracts([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(toApiUrl("/api/contracts"), {
          headers: {
            "x-tenant-id": activeTenant.id,
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          if (current) setContracts([]);
          return;
        }

        if (current) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setContracts(data);
          } else {
            console.error("Unexpected API response format:", data);
            setContracts([]);
          }
        }
      } catch (e) {
        if (current) setContracts([]);
        console.error("Failed to fetch contracts", e);
      } finally {
        if (current) setLoading(false);
      }
    };

    fetchContracts();
    return () => { current = false; };
  }, [activeTenant?.id, token, refreshTrigger]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNED': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'DRAFT': return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-outline-variant/5 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low text-zinc-500 font-label text-xs uppercase tracking-widest">
            <th className="px-6 py-4 font-semibold">Title</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Created</th>
            <th className="px-6 py-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/5">
          {loading ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 text-sm">
                <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                <div className="mt-2 text-xs">Accessing Vault...</div>
              </td>
            </tr>
          ) : contracts.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 text-sm italic">
                No contracts found in this vault.
              </td>
            </tr>
          ) : (
            contracts.map((contract) => (
              <tr key={contract.id} className="group hover:bg-surface-container-high transition-colors cursor-default">
                <td className="px-6 py-5">
                  <div className="font-semibold text-on-surface group-hover:text-primary transition-colors">{contract.title}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{contract.id}</div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-tight ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-xs text-zinc-400">
                  {new Date(contract.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 text-zinc-400">
                    {contract.fileUrl && (
                      <a 
                        href={toApiUrl(`/api/contracts/download/${contract.id}`)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-95 flex items-center gap-1"
                        title={`${contract.originalFileName} 다운로드`}
                      >
                        <span className="material-symbols-outlined text-sm">description</span>
                      </a>
                    )}
                    <button 
                      disabled 
                      aria-disabled="true"
                      title="수정 기능은 준비 중입니다."
                      className="p-1.5 rounded-lg text-zinc-600 cursor-not-allowed opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button 
                      disabled 
                      aria-disabled="true"
                      title="삭제 기능은 준비 중입니다."
                      className="p-1.5 rounded-lg text-zinc-600 cursor-not-allowed opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
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
