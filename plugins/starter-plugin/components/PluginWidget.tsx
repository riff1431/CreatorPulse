import React, { useState } from 'react';

/**
 * Standardized Plugin SDK Dashboard Widget
 * Demonstrates state management, dynamic user interaction, and styling within the CreatorPulse grid.
 */
export const PluginWidget: React.FC = () => {
  const [clicks, setClicks] = useState(0);

  return (
    <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-4 text-left transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔌</span>
          <h4 className="font-bold text-xs text-[var(--color-text-primary)] font-sans">Engagement Starter Widget</h4>
        </div>
        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--color-soft-primary)] text-[var(--color-primary)] font-sans">
          SDK v1.0
        </span>
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-sans">
        This is a fully interactive plugin client component. Click the button to test local state management.
      </p>
      <div className="flex items-center justify-between gap-4 pt-1 font-sans">
        <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
          Actions Logged: <span className="text-[var(--color-primary)]">{clicks}</span>
        </span>
        <button
          onClick={() => setClicks(prev => prev + 1)}
          className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] text-[10px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer border-none"
        >
          Increment
        </button>
      </div>
    </div>
  );
};

export default PluginWidget;
