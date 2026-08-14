'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ThemeErrorBoundaryProps {
  type: 'page' | 'layout' | 'component';
  name: string;
  themeId?: string;
  fallbackComponent?: React.ReactNode;
  children: ReactNode;
}

interface ThemeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Theme Error Boundary
 * Automatically catches runtime errors inside custom theme overrides
 * and gracefully falls back to the Default Theme counterpart.
 */
export class ThemeErrorBoundary extends Component<ThemeErrorBoundaryProps, ThemeErrorBoundaryState> {
  constructor(props: ThemeErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ThemeErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error(
      `[ThemeOverrideError] Crash detected in theme override for ${this.props.type} "${this.props.name}" (Theme: ${this.props.themeId || 'active'}):`,
      error,
      errorInfo
    );

    // Dispatch global diagnostic event for Admin theme health monitor
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('theme_override_error', {
          detail: {
            type: this.props.type,
            name: this.props.name,
            themeId: this.props.themeId,
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        })
      );
    }
  }

  render() {
    if (this.state.hasError) {
      // If we have a fallback component (Default Theme equivalent), render it
      if (this.props.fallbackComponent) {
        return (
          <>
            {process.env.NODE_ENV !== 'production' && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-2 px-3 rounded-xl mb-2 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={14} className="shrink-0 text-rose-600" />
                  <span>
                    <strong>Theme Override Error:</strong> Failed in {this.props.type} <code>{this.props.name}</code>. Safely rendering default-theme fallback.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded text-[10px] font-bold flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Retry
                </button>
              </div>
            )}
            {this.props.fallbackComponent}
          </>
        );
      }

      // Default minimal alert if no fallback provided
      return (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle size={14} /> Theme Override Execution Error
          </p>
          <p className="text-[11px] text-rose-700">
            Failed to render {this.props.type} &quot;{this.props.name}&quot;.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ThemeErrorBoundary;
