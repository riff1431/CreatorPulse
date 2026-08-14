'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, XCircle } from 'lucide-react';

export interface ProgressStep {
  label: string;
  status: 'idle' | 'running' | 'success' | 'error';
}

interface ProgressState {
  isOpen: boolean;
  title: string;
  percentage: number;
  statusText: string;
  steps: ProgressStep[];
  isCompleted: boolean;
  isError: boolean;
  onClose?: () => void;
}

interface ProgressContextProps {
  startProgress: (options: { title: string; steps: string[]; onClose?: () => void }) => void;
  updateProgress: (index: number, status: 'running' | 'success' | 'error', percentage: number, statusText: string) => void;
  completeProgress: (statusText: string) => void;
  errorProgress: (index: number, statusText: string) => void;
  closeProgress: () => void;
  activeProgress: ProgressState;
}

const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

export const useAdminProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useAdminProgress must be used within an AdminProgressProvider');
  }
  return context;
};

export const AdminProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProgressState>({
    isOpen: false,
    title: '',
    percentage: 0,
    statusText: '',
    steps: [],
    isCompleted: false,
    isError: false,
  });

  const startProgress = useCallback(({ title, steps, onClose }: { title: string; steps: string[]; onClose?: () => void }) => {
    setState({
      isOpen: true,
      title,
      percentage: 0,
      statusText: steps[0] || 'Processing...',
      steps: steps.map((step, index) => ({
        label: step,
        status: index === 0 ? 'running' : 'idle',
      })),
      isCompleted: false,
      isError: false,
      onClose,
    });
  }, []);

  const updateProgress = useCallback((index: number, status: 'running' | 'success' | 'error', percentage: number, statusText: string) => {
    setState((prev) => {
      const updatedSteps = [...prev.steps];
      if (updatedSteps[index]) {
        updatedSteps[index].status = status;
      }
      // If we are moving to next step, mark it as running automatically
      if (status === 'success' && updatedSteps[index + 1]) {
        updatedSteps[index + 1].status = 'running';
      }
      return {
        ...prev,
        percentage: Math.min(percentage, 100),
        statusText: statusText || prev.statusText,
        steps: updatedSteps,
      };
    });
  }, []);

  const completeProgress = useCallback((statusText: string) => {
    setState((prev) => {
      const completedSteps: ProgressStep[] = prev.steps.map((step) => ({
        ...step,
        status: (step.status === 'error' ? 'error' : 'success') as ProgressStep['status'],
      }));
      return {
        ...prev,
        percentage: 100,
        statusText: statusText || 'Operation complete!',
        steps: completedSteps,
        isCompleted: true,
      };
    });
  }, []);

  const errorProgress = useCallback((index: number, statusText: string) => {
    setState((prev) => {
      const updatedSteps: ProgressStep[] = prev.steps.map((step, i) => {
        if (i === index) return { ...step, status: 'error' };
        if (i > index) return { ...step, status: 'idle' };
        return { ...step, status: 'success' };
      });
      return {
        ...prev,
        statusText: statusText || 'An error occurred during execution.',
        steps: updatedSteps,
        isCompleted: true,
        isError: true,
      };
    });
  }, []);

  const closeProgress = useCallback(() => {
    setState((prev) => {
      if (prev.onClose) {
        prev.onClose();
      }
      return {
        ...prev,
        isOpen: false,
      };
    });
  }, []);

  return (
    <ProgressContext.Provider value={{ startProgress, updateProgress, completeProgress, errorProgress, closeProgress, activeProgress: state }}>
      {children}

      {state.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="border-b border-slate-100 p-5">
              <h3 className="font-extrabold text-slate-800 text-lg leading-6">{state.title}</h3>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Progress and status */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500 truncate max-w-[280px]">{state.statusText}</span>
                  <span className="text-slate-900 text-sm font-bold font-mono">{state.percentage}%</span>
                </div>

                {/* Progress bar wrapper */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      state.isError
                        ? 'bg-rose-500'
                        : state.percentage === 100
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}
                    style={{ width: `${state.percentage}%` }}
                  />
                </div>
              </div>

              {/* Checklist steps */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {state.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 text-xs font-medium animate-fade-in-left`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="shrink-0">
                      {step.status === 'running' && (
                        <Loader2 className="h-4.5 w-4.5 text-blue-600 animate-spin" />
                      )}
                      {step.status === 'success' && (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 animate-scale-up" />
                      )}
                      {step.status === 'error' && (
                        <XCircle className="h-4.5 w-4.5 text-rose-500 animate-scale-up" />
                      )}
                      {step.status === 'idle' && (
                        <div className="h-4.5 w-4.5 rounded-full border-2 border-slate-200 bg-white" />
                      )}
                    </div>
                    <span
                      className={`truncate ${
                        step.status === 'running'
                          ? 'text-slate-900 font-semibold'
                          : step.status === 'success'
                          ? 'text-slate-400 line-through decoration-slate-300'
                          : step.status === 'error'
                          ? 'text-rose-500 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer action button */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-2">
              <button
                disabled={!state.isCompleted}
                onClick={closeProgress}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {state.isError ? 'Close' : state.isCompleted ? 'Finish' : 'Processing...'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProgressContext.Provider>
  );
};
