"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-zinc-900 text-white shadow-soft-xl border border-zinc-800 animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          {toast.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-kiwi-400 shrink-0 mt-0.5" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          {toast.type === "info" && (
            <Info className="w-5 h-5 text-babyblue-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-white leading-tight">{toast.title}</h5>
            <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-500 hover:text-white p-0.5 rounded transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
