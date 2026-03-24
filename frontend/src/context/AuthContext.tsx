"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string, tenantId: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isTokenExpired = (t: string) => {
    try {
      const payload = JSON.parse(atob(t.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  };

  const refreshToken = useCallback(async () => {
    const rt = localStorage.getItem("refresh_token");
    if (!rt) return null;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    try {
      const res = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: rt }),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        localStorage.setItem("auth_token", data.access_token);
        return data.access_token;
      } else {
        logout();
        return null;
      }
    } catch (e) {
      logout();
      return null;
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");

    if (savedToken && savedUser) {
      if (isTokenExpired(savedToken)) {
        // Access Token 만료 시 즉시 리프레시 시도
        refreshToken();
      } else {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (e) {
          logout();
        }
      }
    }
    setIsLoading(false);
  }, [refreshToken]);

  const login = async (email: string, pass: string, tenantId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass, tenantId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Login failed" }));
      throw new Error(err.message || "Invalid credentials");
    }

    const data = await res.json();
    setToken(data.access_token);
    setUser(data.user);

    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    router.push("/");
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
    router.push("/login");
  }, [router]);

  useEffect(() => {
    if (!isLoading && !token && pathname !== "/login") {
      router.push("/login");
    }
  }, [isLoading, token, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
