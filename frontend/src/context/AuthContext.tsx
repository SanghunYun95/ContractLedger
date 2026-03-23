"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load auth info from localStorage on mount
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string, tenantId: string) => {
    const res = await fetch("/api/auth/login", {
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
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    router.push("/");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  // Redirect to login if not authenticated (except for /login page)
  useEffect(() => {
    if (!isLoading && !token && pathname !== "/login") {
      router.push("/login");
    }
  }, [isLoading, token, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
