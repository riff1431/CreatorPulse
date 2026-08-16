'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = 'md',
  children,
  footer,
  className = '',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press and lock background scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
    full: 'sm:max-w-4xl',
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={dialogRef}
        className={`w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-[#1A1222] rounded-t-3xl sm:rounded-3xl border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto transform transition-all duration-200 animate-in zoom-in-95 slide-in-from-bottom-4 ${className}`}
      >
        {/* Mobile handle pull bar */}
        <div className="sm:hidden w-12 h-1.5 bg-[#E4E4E7] dark:bg-[#3A2A4C] rounded-full mx-auto -mt-1 mb-2" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#F3DCE8] dark:border-[#3A2A4C]">
          <div>
            <h2 id="modal-title" className="text-base sm:text-lg font-black text-[#18181B] dark:text-[#FDF2F8] tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#FFF1F7] dark:hover:bg-[#241A30] text-[#71717A] hover:text-[#EC4899] transition-all cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="text-xs text-[#52525B] dark:text-[#D4B8D0] leading-relaxed">
          {children}
        </div>

        {/* Modal Action Footer */}
        {footer && (
          <div className="pt-3 border-t border-[#F3DCE8] dark:border-[#3A2A4C] flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
