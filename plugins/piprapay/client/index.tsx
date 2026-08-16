'use client';

import React from 'react';

export const PipraPayBadge: React.FC<{ mode?: string }> = ({ mode = 'sandbox' }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
      <span>💳 PipraPay</span>
      {mode === 'sandbox' && (
        <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-mono">Sandbox</span>
      )}
    </div>
  );
};

export default PipraPayBadge;
