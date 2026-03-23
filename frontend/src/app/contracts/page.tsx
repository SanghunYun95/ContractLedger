"use client";

import React, { useState } from "react";
import { ContractList } from "@/components/contracts/ContractList";
import { ContractForm } from "@/components/contracts/ContractForm";

export default function ContractsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-surface">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <span className="material-symbols-outlined text-[14px]">assured_workload</span>
            Vault Management
          </div>
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">Contract Ledger</h1>
          <p className="text-zinc-500 max-w-lg text-sm font-medium">
            Secure multi-tenant repository for digital agreements and immutable audit trails.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-3 bg-primary text-on-primary-container px-6 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Create New Agreement
        </button>
      </div>

      {/* Contract List Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-primary ring-2 ring-primary/20"></span>
            Active Vault Contents
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Tenant Context Isolated</span>
          </div>
        </div>
        <ContractList refreshTrigger={refreshTrigger} />
      </div>

      {/* Modern Modal for Contract Creation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 sm:pb-24">
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-surface-container-low border border-outline-variant/5 rounded-3xl shadow-[0_32px_96px_-24px_rgba(0,0,0,0.5)] w-full max-w-xl p-8 overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-surface-container-highest transition-colors text-zinc-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <ContractForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
            
            {/* Aesthetic Background Detail */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 translate-y-1/2"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10 -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
}
