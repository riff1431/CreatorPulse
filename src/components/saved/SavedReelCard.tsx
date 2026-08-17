'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Heart, MessageSquare, MoreVertical, Trash2, FolderOutput, ExternalLink, Bookmark } from 'lucide-react';
import { ShortVideo } from '@/lib/supabase/store';
import { Avatar } from '@/components/ui/Avatar';
import { useSaved } from '@/lib/saved/saved-context';

interface SavedReelCardProps {
  short: ShortVideo;
  activeCollectionId?: string;
  onOpenSaveModal: (short: ShortVideo) => void;
}

export const SavedReelCard: React.FC<SavedReelCardProps> = ({
  short,
  activeCollectionId = 'col-all',
  onOpenSaveModal,
}) => {
  const { removeFromCollection, unsaveItem } = useSaved();
  const [showMenu, setShowMenu] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (activeCollectionId && activeCollectionId !== 'col-all') {
      removeFromCollection(short.id, activeCollectionId);
    } else {
      unsaveItem(short.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="group relative bg-[#18181B] rounded-[24px] overflow-hidden border border-[#F3DCE8] shadow-sm hover:shadow-xl transition-all aspect-9/14 flex flex-col justify-between">
      {/* Background Poster Thumbnail */}
      <img
        src={short.videoUrl}
        alt={short.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

      {/* Top Header Overlay */}
      <div className="relative z-10 p-3 flex items-center justify-between">
        <span className="text-[10px] font-extrabold bg-[#FCE7F3] text-[#BE185D] px-2.5 py-0.5 rounded-full border border-[#FBCFE8] shadow-2xs">
          🎥 {short.category}
        </span>

        {/* Options Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-2xl border border-[#F3DCE8] shadow-xl py-1.5 text-xs text-[#18181B] animate-in fade-in duration-150">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu(false);
                  onOpenSaveModal(short);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[#FFF1F7] flex items-center gap-2 font-semibold text-[#18181B]"
              >
                <FolderOutput size={14} className="text-[#EC4899]" />
                Move / Collection
              </button>

              <Link
                href={`/shorts?id=${short.id}`}
                className="w-full text-left px-3 py-2 hover:bg-[#FFF1F7] flex items-center gap-2 font-semibold text-[#18181B]"
              >
                <ExternalLink size={14} className="text-[#71717A]" />
                Open Full Reel
              </Link>

              <button
                onClick={handleRemove}
                className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold border-t border-[#F3DCE8]"
              >
                <Trash2 size={14} />
                {activeCollectionId !== 'col-all' ? 'Remove from Folder' : 'Unsave Reel'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center Play Button Icon */}
      <Link href={`/shorts?id=${short.id}`} className="relative z-10 mx-auto my-auto group-hover:scale-110 transition-transform">
        <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg">
          <Play size={20} className="fill-white ml-0.5" />
        </div>
      </Link>

      {/* Bottom Info Overlay */}
      <div className="relative z-10 p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <Avatar alt={short.authorName} src={short.authorAvatar} size="sm" isVerified />
          <span className="text-xs font-bold text-white truncate">{short.authorName}</span>
        </div>

        <p className="text-xs font-semibold text-white/90 line-clamp-2 leading-snug">
          {short.title}
        </p>

        <div className="flex items-center justify-between text-[11px] text-pink-200 font-bold pt-1">
          <span className="flex items-center gap-1">
            <Heart size={12} className="fill-pink-200" /> {short.likesCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} /> {short.commentsCount}
          </span>
        </div>
      </div>
    </div>
  );
};
