'use client';

import React from 'react';

export const ModerationBadge: React.FC<{ status: 'clean' | 'flagged' | 'blocked' }> = ({ status }) => {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
      status === 'clean' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
    }`}>
      🛡️ {status.toUpperCase()}
    </span>
  );
};
