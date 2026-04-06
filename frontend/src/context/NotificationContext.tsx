"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useTenant } from "./TenantContext";
import { Toast, ToastType } from "@/components/ui/Toast";

interface NotificationContextType {
  showToast: (title: string, message: string, type?: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const { activeTenant } = useTenant();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: ToastType }>({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const showToast = (title: string, message: string, type: ToastType = "info") => {
    setToast({ show: true, title, message, type });
  };

  useEffect(() => {
    if (token && activeTenant?.id) {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const socketUrl = apiBase || window.location.origin;
      
      const socketInstance = io(`${socketUrl}/notifications`, {
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        console.log("Connected to notification gateway");
        socketInstance.emit("joinTenant", activeTenant.id);
      });

      socketInstance.on("contract.analyzed", (data: { contractId: string; title: string; riskScore: number }) => {
        showToast(
          "AI 분석 완료",
          `'${data.title}' 계약서의 AI 분석이 완료되었습니다. 리스크 점수: ${data.riskScore}%`,
          "success"
        );
        // Dispatch custom event to refresh lists if needed
        window.dispatchEvent(new CustomEvent("refreshContracts"));
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [token, activeTenant?.id]);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <Toast
        show={toast.show}
        onHide={() => setToast((prev) => ({ ...prev, show: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
