'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  addToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const addToast = useCallback(({ title, message, type = 'success', action }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, action }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, addToast }}>
      {children}

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = {
            success: CheckCircle2,
            error: XCircle,
            warning: AlertCircle,
            info: Info,
          }[toast.type];

          const bgClasses = {
            success:
              'bg-emerald-50 dark:bg-emerald-950/85 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
            error:
              'bg-rose-50 dark:bg-rose-950/85 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100',
            warning:
              'bg-amber-50 dark:bg-amber-950/85 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
            info:
              'bg-[var(--color-surface)] /95 /95 border-[var(--color-border)] text-[var(--color-text-primary)] ',
          }[toast.type];

          const iconClasses = {
            success: 'text-emerald-500',
            error: 'text-rose-500',
            warning: 'text-amber-500',
            info: 'text-[var(--color-primary)] ',
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-3 ${bgClasses}`}
            >
              <Icon size={18} className={`shrink-0 mt-0.5 ${iconClasses}`} />

              <div className="flex-1 min-w-0 text-xs">
                {toast.title && <h5 className="font-black mb-0.5 tracking-tight">{toast.title}</h5>}
                <p className="leading-relaxed font-medium">{toast.message}</p>

                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-[11px] font-black text-[var(--color-primary)] hover:underline cursor-pointer"
                  >
                    {toast.action.label} →
                  </button>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-50 hover:opacity-100 transition-opacity p-0.5 cursor-pointer -mr-1 -mt-1"
                aria-label="Dismiss toast"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const Toast: React.FC = () => null;
export default Toast;
