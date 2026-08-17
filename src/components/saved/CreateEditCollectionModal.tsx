'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Globe, Sparkles, FolderPlus, Palette, Image as ImageIcon } from 'lucide-react';
import { useSaved } from '@/lib/saved/saved-context';
import { SavedCollection } from '@/types/saved';
import { Button } from '@/components/ui/Button';

interface CreateEditCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionToEdit?: SavedCollection | null;
}

const EMOJI_OPTIONS = ['📁', '🎨', '⭐', '🎥', '💡', '🔥', '📚', '🚀', '💎', '🎯'];

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=600',
];

export const CreateEditCollectionModal: React.FC<CreateEditCollectionModalProps> = ({
  isOpen,
  onClose,
  collectionToEdit,
}) => {
  const { createCollection, updateCollection } = useSaved();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [coverUrl, setCoverUrl] = useState(COVER_PRESETS[0]);
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    if (collectionToEdit) {
      setTitle(collectionToEdit.title);
      setDescription(collectionToEdit.description || '');
      setIcon(collectionToEdit.icon || '📁');
      setCoverUrl(collectionToEdit.coverUrl || COVER_PRESETS[0]);
      setIsPrivate(collectionToEdit.isPrivate !== undefined ? collectionToEdit.isPrivate : true);
    } else {
      setTitle('');
      setDescription('');
      setIcon('📁');
      setCoverUrl(COVER_PRESETS[0]);
      setIsPrivate(true);
    }
  }, [collectionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (collectionToEdit) {
      updateCollection(collectionToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        icon,
        coverUrl,
        isPrivate,
      });
    } else {
      createCollection({
        title: title.trim(),
        description: description.trim(),
        icon,
        coverUrl,
        isPrivate,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] border border-[#F3DCE8] w-full max-w-md overflow-hidden shadow-2xl space-y-0 relative">
        {/* Header */}
        <div className="p-5 border-b border-[#F3DCE8] flex items-center justify-between bg-gradient-to-r from-[#FFF9FC] to-[#FFF1F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FCE7F3] border border-[#FBCFE8] flex items-center justify-center text-[#EC4899]">
              <FolderPlus size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-[#18181B] text-base leading-tight">
                {collectionToEdit ? 'Edit Collection' : 'Create Custom Collection'}
              </h3>
              <p className="text-xs text-[#71717A] font-semibold">Organize and personalize your saved content</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#71717A] hover:text-[#18181B] hover:bg-[#FCE7F3] rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">
              Collection Title <span className="text-[#EC4899]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design System Inspo, VIP Tutorials"
              className="w-full bg-white border border-[#F3DCE8] focus:border-[#EC4899] rounded-2xl px-4 py-2.5 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none font-semibold shadow-inner"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short memo about what's inside this collection..."
              className="w-full bg-white border border-[#F3DCE8] focus:border-[#EC4899] rounded-2xl p-3 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none font-medium resize-none shadow-inner"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">Collection Icon</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 rounded-2xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                    icon === emoji
                      ? 'bg-[#FCE7F3] border-[#EC4899] scale-110 shadow-2xs'
                      : 'bg-[#FFF9FC] border-[#F3DCE8] hover:bg-[#FFF1F7]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Preset Selector */}
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={13} className="text-[#EC4899]" /> Cover Theme Banner
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COVER_PRESETS.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverUrl(img)}
                  className={`h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative ${
                    coverUrl === img ? 'border-[#EC4899] scale-105 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="cover preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="p-3.5 bg-[#FFF9FC] border border-[#F3DCE8] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isPrivate ? 'bg-[#FCE7F3] text-[#BE185D]' : 'bg-emerald-100 text-emerald-700'}`}>
                {isPrivate ? <Lock size={16} /> : <Globe size={16} />}
              </div>
              <div>
                <p className="text-xs font-bold text-[#18181B]">
                  {isPrivate ? 'Private Collection' : 'Public Collection'}
                </p>
                <p className="text-[11px] text-[#71717A]">
                  {isPrivate ? 'Visible only to you by default' : 'Visible on your public profile'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#EC4899]"></div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#F3DCE8]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Sparkles size={14} />}>
              {collectionToEdit ? 'Save Changes' : 'Create Collection'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
