import React from 'react';

export interface ThemeMainLayoutProps {
  children: React.ReactNode;
}

/**
 * Standardized Theme SDK Main Layout
 * Demonstrates CSS custom property injection, responsive sidebar support, and dynamic header visibility.
 */
export const ThemeMainLayout: React.FC<ThemeMainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--color-surface)]/75 border-b border-[var(--color-border)]/50 transition-all">
        <div className="max-w-[var(--theme-container-width,1280px)] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
              CreatorPulse
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-soft-primary)] text-[var(--color-primary)]">
              Starter v1.0
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--color-text-secondary)]">
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Home</a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Explore</a>
            <a href="#" className="hover:text-[var(--color-primary)] transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-xs font-bold rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all transform hover:scale-[1.02] shadow-sm">
              Connect
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 w-full max-w-[var(--theme-container-width,1280px)] mx-auto px-6 py-8 flex gap-8">
        <main className="flex-1 min-w-0">
          <div className="p-6 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)]/50 shadow-xs hover:shadow-sm transition-all duration-300">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[var(--color-surface-secondary)] border-t border-[var(--color-border)]/30 py-8 mt-auto text-center text-xs text-[var(--color-text-muted)]">
        <div className="max-w-[var(--theme-container-width,1280px)] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CreatorPulse. Built using Theme SDK v1.0.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Documentation</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ThemeMainLayout;
