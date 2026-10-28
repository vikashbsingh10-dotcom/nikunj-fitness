"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  subtext?: string;
}

interface ToastContextType {
  toast: {
    success: (message: string, subtext?: string) => void;
    error: (message: string, subtext?: string) => void;
    info: (message: string, subtext?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: "success" | "error" | "info", message: string, subtext?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message, subtext }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg: string, sub?: string) => addToast("success", msg, sub),
    error: (msg: string, sub?: string) => addToast("error", msg, sub),
    info: (msg: string, sub?: string) => addToast("info", msg, sub),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container floating bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl p-3.5 shadow-lg border text-sm transition-all animate-in slide-in-from-bottom-5 duration-200",
              t.type === "success" && "bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10",
              t.type === "error" && "bg-white border-rose-200 text-slate-800 shadow-rose-500/10",
              t.type === "info" && "bg-white border-slate-200 text-slate-800 shadow-slate-500/10"
            )}
          >
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />}

            <div className="flex-1">
              <p className="font-semibold text-xs text-slate-900">{t.message}</p>
              {t.subtext && <p className="text-xs text-slate-500 mt-0.5">{t.subtext}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

