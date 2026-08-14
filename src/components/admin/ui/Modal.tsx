'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // GSAP animate open
      gsap.fromTo(backdropRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
      gsap.fromTo(dialogRef.current, 
        { scale: 0.95, y: 15, opacity: 0 }, 
        { scale: 1, y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' }
      );
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        ref={dialogRef}
        className="w-full sm:max-w-lg bg-white rounded-t-xl sm:rounded-xl border-t sm:border border-slate-200 shadow-xl p-5 space-y-4 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="text-xs text-slate-600 leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};
