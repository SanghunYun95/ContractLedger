import React, { useEffect } from "react";

export type ToastType = 'info' | 'success' | 'warn' | 'error';

interface ToastProps {
  show: boolean;
  onHide: () => void;
  type?: ToastType;
  title: string;
  message: string;
}

export function Toast({ show, onHide, type = 'info', title, message }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  const getTheme = () => {
    switch (type) {
      case 'success': return { border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', icon: 'check_circle' };
      case 'warn': return { border: 'border-amber-500/20', bg: 'bg-amber-500/10', iconColor: 'text-amber-500', icon: 'warning' };
      case 'error': return { border: 'border-rose-500/20', bg: 'bg-rose-500/10', iconColor: 'text-rose-500', icon: 'error' };
      default: return { border: 'border-primary/20', bg: 'bg-primary/10', iconColor: 'text-primary', icon: 'info' };
    }
  };

  const theme = getTheme();

  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-atomic="true"
      className={`fixed bottom-8 right-8 z-[110] flex flex-col gap-3 transition-all duration-500 ease-out pointer-events-none ${show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}`}
    >
        <div className={`glass-card border ${theme.border} rounded-2xl p-5 flex items-start gap-4 shadow-2xl w-80 backdrop-blur-3xl`}>
            <div className={`w-10 h-10 rounded-full ${theme.bg} flex items-center justify-center flex-shrink-0 ${theme.iconColor}`}>
                <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>{theme.icon}</span>
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="text-[13px] font-black text-on-surface tracking-tight uppercase">{title}</div>
                <p className="text-[11px] text-zinc-500 mt-1 font-medium leading-relaxed leading-snug">{message}</p>
            </div>
        </div>
    </div>
  );
}
