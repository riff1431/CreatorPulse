'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  position?: 'right' | 'left' | 'bottom';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  position = 'right',
  children,
  footer,
  className = '',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionStyles = {
    right: 'top-0 right-0 h-full w-full sm:w-96 border-l animate-in slide-in-from-right duration-300',
    left: 'top-0 left-0 h-full w-full sm:w-96 border-r animate-in slide-in-from-left duration-300',
    bottom: 'bottom-0 left-0 right-0 max-h-[85vh] w-full rounded-t-3xl border-t animate-in slide-in-from-bottom duration-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-md transition-opacity">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Drawer Card */}
      <div
        ref={drawerRef}
        className={`relative z-10 bg-white dark:bg-[#1A1222] border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl flex flex-col ${positionStyles[position]} ${className}`}
      >
        {/* Mobile Pull Handle (if bottom sheet) */}
        {position === 'bottom' && (
          <div className="w-12 h-1.5 bg-[#E4E4E7] dark:bg-[#3A2A4C] rounded-full mx-auto my-2 shrink-0" />
        )}

        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#F3DCE8] dark:border-[#3A2A4C] shrink-0">
          <div>
            {title && (
              <h3 className="font-black text-sm sm:text-base text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] text-[#71717A] hover:text-[#EC4899] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-xs text-[#52525B] dark:text-[#D4B8D0] leading-relaxed">
          {children}
        </div>

        {/* Drawer Footer */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-[#F3DCE8] dark:border-[#3A2A4C] bg-[#FFF9FC] dark:bg-[#241A30] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
