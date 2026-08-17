'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Eye, Film, Search, User, Heart, Shield, Trash2, ExternalLink, 
  Clock, MessageSquare, Sparkles, KeyRound 
} from 'lucide-react';
import { ActivityCategory, ActivityLogItem } from '@/types/history';
import { useHistory } from '@/lib/history/history-context';
import { Avatar } from '@/components/ui/Avatar';

interface ActivityItemCardProps {
  item: ActivityLogItem;
}

export const ActivityItemCard: React.FC<ActivityItemCardProps> = ({ item }) => {
  const { removeActivityItem } = useHistory();

  const getCategoryBadge = (cat: ActivityCategory) => {
    switch (cat) {
      case 'profile':
        return { label: 'Creator Profile', icon: User, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'post':
        return { label: 'Viewed Post', icon: Eye, bg: 'bg-pink-50 text-pink-700 border-pink-200' };
      case 'reel':
        return { label: 'Watched Reel', icon: Film, bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'search':
        return { label: 'Search Query', icon: Search, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'interaction':
        return { label: 'Interaction', icon: Heart, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'account':
        return { label: 'Account & Security', icon: Shield, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: 'Activity', icon: Clock, bg: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const badge = getCategoryBadge(item.category);
  const IconComp = badge.icon;

  // Format relative time
  const formatTimeAgo = (isoDate: string) => {
    const diffSec = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    return `${Math.floor(diffSec / 86400)} days ago`;
  };

  return (
    <div className="bg-white border border-[#F3DCE8] hover:border-[#FBCFE8] p-4 rounded-[22px] flex items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-md group">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Category Icon or Thumbnail */}
        <div className="relative shrink-0">
          {item.avatarUrl ? (
            <Avatar alt={item.title} src={item.avatarUrl} size="md" />
          ) : item.thumbnailUrl ? (
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-[#F3DCE8]">
              <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${badge.bg}`}>
              <IconComp size={18} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badge.bg} flex items-center gap-1`}>
              <IconComp size={10} />
              {badge.label}
            </span>
            <span className="text-[11px] text-[#71717A] font-semibold flex items-center gap-1">
              <Clock size={11} /> {formatTimeAgo(item.timestamp)}
            </span>
          </div>

          <h4 className="font-extrabold text-sm text-[#18181B] truncate mt-1 group-hover:text-[#EC4899] transition-colors">
            {item.title}
          </h4>

          {item.subtitle && (
            <p className="text-xs text-[#71717A] font-medium truncate mt-0.5">{item.subtitle}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {item.targetUrl && (
          <Link
            href={item.targetUrl}
            className="p-2 text-[#71717A] hover:text-[#EC4899] hover:bg-[#FCE7F3] rounded-xl transition-colors cursor-pointer"
            title="Go to item"
          >
            <ExternalLink size={16} />
          </Link>
        )}

        <button
          onClick={() => removeActivityItem(item.id)}
          className="p-2 text-[#71717A] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer opacity-75 group-hover:opacity-100"
          title="Remove from history"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
