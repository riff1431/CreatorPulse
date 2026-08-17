'use client';

import React from 'react';
import { X, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useHistory } from '@/lib/history/history-context';
import { ActivityCategory } from '@/types/history';
import { Button } from '@/components/ui/Button';

interface ClearHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCategory?: ActivityCategory | 'all';
}

export const ClearHistoryModal: React.FC<ClearHistoryModalProps> = ({
  isOpen,
  onClose,
  targetCategory = 'all',
}) => {
  const { clearCategoryHistory, clearAllHistory } = useHistory();

  if (!isOpen) return null;

  const handleConfirmClear = () => {
    if (targetCategory === 'all') {
      clearAllHistory();
    } else if (targetCategory) {
      clearCategoryHistory(targetCategory);
    }
    onClose();
  };

  const getTargetTitle = () => {
    if (targetCategory === 'all') return 'all activity history';
    switch (targetCategory) {
      case 'profile': return 'profile view history';
      case 'post': return 'post view history';
      case 'reel': return 'watched reel history';
      case 'search': return 'search query history';
      case 'interaction': return 'interaction history';
      case 'account': return 'account activity logs';
      default: return 'selected activity history';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] border border-[#F3DCE8] w-full max-w-md overflow-hidden shadow-2xl space-y-0 relative">
        {/* Header */}
        <div className="p-5 border-b border-[#F3DCE8] flex items-center justify-between bg-gradient-to-r from-[#FFF9FC] to-[#FFF1F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-[#18181B] text-base leading-tight">Clear Activity History</h3>
              <p className="text-xs text-[#71717A] font-semibold">Permanently delete logs from this device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#71717A] hover:text-[#18181B] hover:bg-[#FCE7F3] rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
            <Trash2 size={24} />
          </div>

          <div className="space-y-1.5">
            <h4 className="font-extrabold text-base text-[#18181B]">
              Are you sure you want to clear {getTargetTitle()}?
            </h4>
            <p className="text-xs text-[#71717A] font-semibold max-w-xs mx-auto leading-relaxed">
              This action cannot be undone. All recorded items under this selection will be removed immediately.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[#F3DCE8] bg-[#FFF9FC] flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmClear}
            className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
            leftIcon={<Trash2 size={14} />}
          >
            Yes, Clear History
          </Button>
        </div>
      </div>
    </div>
  );
};
