"use client";

import React, { useState } from "react";
import { ContractList } from "@/components/contracts/ContractList";
import { ContractForm } from "@/components/contracts/ContractForm";

export default function ContractsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingContract(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleNew = () => {
    setEditingContract(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contract: any) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingContract(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-surface">
      {/* Header Section */}
      <div className="flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-1">
            <span className="material-symbols-outlined text-[14px]">shield_moon</span>
            Digital Ledger Access
          </div>
          <h1 className="text-4xl font-headline font-black text-on-surface tracking-tight">Contract Vault</h1>
          <p className="text-zinc-500 max-w-lg text-sm font-medium leading-relaxed">
            Immutable document management with integrated AI risk assessment and tenant isolation.
          </p>
        </div>
        
        <button 
          onClick={handleNew}
          className="group relative flex items-center gap-3 bg-primary text-on-primary-container px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          <span className="material-symbols-outlined text-xl">post_add</span>
          Authorize New Record
        </button>
      </div>

      {/* Contract List Table */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary ring-4 ring-primary/20 shadow-lg shadow-primary/40"></span>
            Encrypted Records Database
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">AI Analysis Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Security Protocol: Active</span>
            </div>
          </div>
        </div>
        <ContractList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
      </div>

      {/* Modern Modal for Contract Creation/Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={handleClose}></div>
          <div className="relative bg-surface-container-low border border-outline-variant/5 rounded-[2.5rem] shadow-[0_48px_128px_-32px_rgba(0,0,0,0.8)] w-full max-w-xl p-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 right-0 p-10">
              <button 
                onClick={handleClose}
                className="p-3 rounded-full hover:bg-surface-container-highest transition-all text-zinc-500 hover:text-white active:scale-90"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            <ContractForm 
              contract={editingContract}
              onSuccess={handleSuccess} 
              onCancel={handleClose} 
            />
            
            {/* Aesthetic Background Detail */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -z-10"></div>
          </div>
        </div>
      )}
    </div>
  );
}
