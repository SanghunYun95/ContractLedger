import React, { useEffect } from "react";

interface ToastProps {
  show: boolean;
  onHide: () => void;
}

export function Toast({ show, onHide }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <div className={`fixed bottom-8 right-8 z-[100] flex flex-col gap-3 transition-all duration-300 pointer-events-none ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="glass-card border border-error/20 rounded-2xl p-4 flex items-start gap-4 shadow-2xl w-80">
            <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center flex-shrink-0 text-error">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
            </div>
            <div>
                <div className="text-sm font-bold text-on-surface">Webhook Sent Successfully</div>
                <p className="text-xs text-zinc-500 mt-1">AI Agent detected risk in #res_7712. Check logs for payload details.</p>
            </div>
        </div>
    </div>
  );
}
