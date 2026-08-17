'use client';

import React, { useState, useEffect } from 'react';
import { X, Bookmark, Plus, Lock, Globe, Check, Sparkles } from 'lucide-react';
import { useSaved } from '@/lib/saved/saved-context';
import { Button } from '@/components/ui/Button';
import { Post, ShortVideo } from '@/lib/supabase/store';

interface SaveToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    type: 'post' | 'reel';
    post?: Post;
    short?: ShortVideo;
  };
  onOpenCreateCollection?: () => void;
}

export const SaveToCollectionModal: React.FC<SaveToCollectionModalProps> = ({
  isOpen,
  onClose,
  item,
  onOpenCreateCollection,
}) => {
  const { collections, getItemCollections, saveItemToCollections, createCollection } = useSaved();
  const [selectedColIds, setSelectedColIds] = useState<string[]>([]);
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIsPrivate, setNewIsPrivate] = useState(true);

  useEffect(() => {
    if (isOpen && item.id) {
      const assigned = getItemCollections(item.id);
      setSelectedColIds(assigned);
    }
  }, [isOpen, item.id, getItemCollections]);

  if (!isOpen) return null;

  const handleToggleCol = (colId: string) => {
    if (colId === 'col-all') return; // Always auto-included if saving to any collection
    if (selectedColIds.includes(colId)) {
      setSelectedColIds(selectedColIds.filter((id) => id !== colId));
    } else {
      setSelectedColIds([...selectedColIds, colId]);
    }
  };

  const handleSave = () => {
    saveItemToCollections(item, selectedColIds);
    onClose();
  };

  const handleCreateInlineCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = createCollection({
      title: newTitle.trim(),
      isPrivate: newIsPrivate,
      icon: '📁',
    });

    setSelectedColIds((prev) => [...prev, created.id]);
    setNewTitle('');
    setIsCreatingInline(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] border border-[#F3DCE8] w-full max-w-md overflow-hidden shadow-2xl space-y-0 relative">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#F3DCE8] flex items-center justify-between bg-gradient-to-r from-[#FFF9FC] to-[#FFF1F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#EC4899]">
              <Bookmark size={18} className="fill-[#EC4899]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#18181B] text-base leading-tight">Save to Collections</h3>
              <p className="text-xs text-[#71717A] font-semibold">Organize into your custom private folders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#71717A] hover:text-[#18181B] hover:bg-[#FCE7F3] rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content / Collections List */}
        <div className="p-5 space-y-4 max-h-[360px] overflow-y-auto scrollbar-none">
          <div className="space-y-2">
            {collections.map((col) => {
              const isChecked = selectedColIds.includes(col.id);
              const isAllSystem = col.id === 'col-all';

              return (
                <div
                  key={col.id}
                  onClick={() => !isAllSystem && handleToggleCol(col.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-[#FFF1F7] border-[#FBCFE8] shadow-2xs'
                      : 'bg-white border-[#F3DCE8] hover:bg-[#FFF9FC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{col.icon || '📁'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#18181B]">{col.title}</span>
                        {col.isPrivate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#BE185D] font-bold bg-[#FCE7F3] px-2 py-0.5 rounded-full border border-[#FBCFE8]">
                            <Lock size={9} /> Private
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Globe size={9} /> Public
                          </span>
                        )}
                      </div>
                      {col.description && (
                        <p className="text-xs text-[#71717A] font-medium line-clamp-1">{col.description}</p>
                      )}
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-[#EC4899] border-[#EC4899] text-white shadow-2xs scale-105'
                        : 'border-[#D4D4D8] bg-white'
                    }`}
                  >
                    {isChecked && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inline Create Form */}
          {isCreatingInline ? (
            <form onSubmit={handleCreateInlineCollection} className="bg-[#FFF9FC] border border-[#FBCFE8] p-3.5 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#18181B] flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#EC4899]" /> Create New Collection
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingInline(false)}
                  className="text-xs text-[#71717A] hover:text-[#18181B]"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Collection name (e.g. Design Inspo)"
                autoFocus
                className="w-full bg-white border border-[#F3DCE8] focus:border-[#EC4899] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none font-semibold"
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#71717A] font-semibold">
                  <input
                    type="checkbox"
                    checked={newIsPrivate}
                    onChange={(e) => setNewIsPrivate(e.target.checked)}
                    className="accent-[#EC4899]"
                  />
                  <span>Private to you (Default)</span>
                </label>

                <Button type="submit" variant="primary" size="sm">
                  Add Collection
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onOpenCreateCollection) {
                  onClose();
                  onOpenCreateCollection();
                } else {
                  setIsCreatingInline(true);
                }
              }}
              className="w-full py-2.5 px-4 border border-dashed border-[#FBCFE8] hover:border-[#EC4899] text-[#BE185D] hover:bg-[#FCE7F3] rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              Create Custom Collection
            </button>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-[#F3DCE8] bg-[#FFF9FC] flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Done & Save
          </Button>
        </div>
      </div>
    </div>
  );
};
