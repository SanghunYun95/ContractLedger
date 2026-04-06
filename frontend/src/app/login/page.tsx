"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [tenantId, setTenantId] = useState("test-tenant");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, tenantId);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-6">
      <div className="w-full max-w-md glass-card rounded-3xl border border-outline-variant/10 p-10 space-y-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary-container/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
          <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Contract Ledger</h1>
          <p className="text-zinc-500 text-sm">감사 보관함 액세스를 위해 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-label text-zinc-500 ml-1">업무용 이메일 (Work Email)</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="test@example.com"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-on-surface border border-outline-variant/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-label text-zinc-500 ml-1">보안 키 (Security Key)</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-on-surface border border-outline-variant/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tenantId" className="text-xs font-label text-zinc-500 ml-1">테넌트 식별값 (Tenant ID)</label>
              <input
                id="tenantId"
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
                placeholder="test-tenant"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3.5 text-on-surface border border-outline-variant/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-error-container/10 border border-error/20 p-4 rounded-xl flex gap-3 animate-shake">
              <span className="material-symbols-outlined text-error text-lg">error</span>
              <p className="text-error text-xs font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-on-primary-container rounded-2xl font-bold hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? "데이터 복호화 중..." : "보관함 액세스 (Access Vault)"}
            {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
          </button>
        </form>

        <div className="pt-6 border-t border-outline-variant/5 space-y-4">
          <div className="text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-4">신규 테넌트 등록 (New Registration)</p>
          </div>
          <button
            onClick={async () => {
              setError("");
              setLoading(true);
              try {
                const res = await fetch("/api/auth/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password, tenantId }),
                });
                if (!res.ok) {
                  const data = await res.json();
                  throw new Error(data.message || "등록 실패 (Registration failed)");
                }
                alert("보안 인증 정보가 등록되었습니다. 이제 보관함에 액세스할 수 있습니다.");
              } catch (err: any) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full py-3 bg-surface-container-highest text-primary rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/10 transition-all border border-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
            보안 인증 정보 등록
          </button>
        </div>

        <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest font-bold pt-4">
          Industry-Standard Encryption
        </p>
      </div>
    </div>
  );
}
