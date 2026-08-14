import React from 'react';

export interface WatermarkOverlayProps {
  watermarkText?: string;
  opacity?: number;
  viewerUsername?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  watermarkText = '© CreatorPulse Protected',
  opacity = 0.4,
  viewerUsername = 'subscriber'
}) => {
  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden"
      style={{ opacity }}
    >
      <div className="transform -rotate-12 text-center text-white/80 font-black tracking-widest text-sm drop-shadow-md">
        <p>{watermarkText}</p>
        {viewerUsername && <p className="text-[10px] uppercase font-mono mt-0.5 tracking-normal">{viewerUsername}</p>}
      </div>
    </div>
  );
};
