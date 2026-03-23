"use client";

import React, { useState, useRef } from "react";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";

interface ContractFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContractForm({ onSuccess, onCancel }: ContractFormProps) {
  const { activeTenant } = useTenant();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", titleRef.current?.value || "");
    formData.append("content", contentRef.current?.value || "");
    formData.append("status", statusRef.current?.value || "DRAFT");
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "x-tenant-id": activeTenant.id,
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create contract");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined">add_notes</span>
        </div>
        <div>
          <h2 className="text-xl font-headline font-bold text-on-surface">New Agreement</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Vault Security: Active</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter ml-1">Title</label>
          <input 
            ref={titleRef}
            required
            placeholder="e.g. Q1 Partnership Terms"
            className="w-full bg-surface-container-high border border-outline-variant/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-on-surface"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter ml-1">Content / Summary</label>
          <textarea 
            ref={contentRef}
            required
            rows={4}
            placeholder="Brief description or full text of the agreement..."
            className="w-full bg-surface-container-high border border-outline-variant/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-on-surface resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter ml-1">Initial Status</label>
            <select 
              ref={statusRef}
              className="w-full bg-surface-container-high border border-outline-variant/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-on-surface appearance-none"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING">PENDING</option>
              <option value="SIGNED">SIGNED</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter ml-1">File Attachment (PDF)</label>
            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full h-[46px] rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs transition-all ${file ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/20 hover:border-primary/30 text-zinc-500'}`}>
                <span className="material-symbols-outlined text-sm">{file ? 'check_circle' : 'upload_file'}</span>
                <span className="truncate max-w-[120px]">{file ? file.name : 'Upload PDF'}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-error-container/10 border border-error/10 text-error text-[11px] rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-zinc-400 hover:bg-surface-container-highest transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-[2] py-3 px-4 bg-primary text-on-primary-container rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 relative overflow-hidden group"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-xl">sync</span>
            ) : (
              <>
                <span className="relative z-10">Execute Creation</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
