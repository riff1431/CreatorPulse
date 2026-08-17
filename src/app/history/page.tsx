'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Clock, PauseCircle, PlayCircle, Trash2, Search, Filter, 
  ShieldAlert, RefreshCw, Eye, Film, User, Heart, Shield, Sparkles 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { Button } from '@/components/ui/Button';
import { useHistory } from '@/lib/history/history-context';
import { ActivityCategory } from '@/types/history';
import { ActivityItemCard } from '@/components/history/ActivityItemCard';
import { ClearHistoryModal } from '@/components/history/ClearHistoryModal';

export default function HistoryPage() {
  const { historyItems, isTrackingPaused, togglePauseTracking } = useHistory();

  const [activeCategory, setActiveCategory] = useState<ActivityCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Filtered items based on category & search
  const filteredItems = useMemo(() => {
    let items = historyItems;

    if (activeCategory !== 'all') {
      items = items.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    }

    return items;
  }, [historyItems, activeCategory, searchQuery]);

  // Group items by Date Group (Today, Yesterday, Earlier)
  const groupedItems = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const groups: { label: string; items: typeof filteredItems }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'Earlier This Week', items: [] },
    ];

    filteredItems.forEach((item) => {
      const itemDate = new Date(item.timestamp).toDateString();
      if (itemDate === todayStr) {
        groups[0].items.push(item);
      } else if (itemDate === yesterdayStr) {
        groups[1].items.push(item);
      } else {
        groups[2].items.push(item);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [filteredItems]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-3xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3DCE8] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="text-[#EC4899]" size={26} />
                <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Recent Activity & History</h1>
              </div>
              <p className="text-xs text-[#71717A] font-bold mt-0.5">
                Review your viewed profiles, posts, reels, searches, interactions, and security logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isTrackingPaused ? 'primary' : 'outline'}
                size="sm"
                onClick={togglePauseTracking}
                leftIcon={isTrackingPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                className={isTrackingPaused ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600' : ''}
              >
                {isTrackingPaused ? 'Resume Tracking' : 'Pause Tracking'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearModalOpen(true)}
                leftIcon={<Trash2 size={14} className="text-rose-500" />}
              >
                Clear History
              </Button>
            </div>
          </div>

          {/* Privacy Paused Banner */}
          {isTrackingPaused && (
            <div className="bg-amber-50 border border-amber-200 rounded-[22px] p-4 flex items-center justify-between gap-3 text-amber-900 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                  <PauseCircle size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs">Activity Tracking is Paused</h4>
                  <p className="text-[11px] text-amber-800 font-medium">
                    New profile visits, post views, and searches will not be logged while tracking is paused.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={togglePauseTracking} className="shrink-0 bg-white border-amber-300">
                Resume
              </Button>
            </div>
          )}

          {/* Search bar inside History */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search through activity history..."
              className="w-full bg-white border border-[#F3DCE8] focus:border-[#EC4899] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none transition-all shadow-inner font-semibold"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 border-b border-[#F3DCE8] pb-2 text-xs font-bold overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: '🕒 All Activity', count: historyItems.length },
              { id: 'post', label: '👁️ Viewed Posts', count: historyItems.filter((i) => i.category === 'post').length },
              { id: 'reel', label: '🎥 Watched Reels', count: historyItems.filter((i) => i.category === 'reel').length },
              { id: 'profile', label: '👤 Visited Profiles', count: historyItems.filter((i) => i.category === 'profile').length },
              { id: 'search', label: '🔍 Searches', count: historyItems.filter((i) => i.category === 'search').length },
              { id: 'interaction', label: '❤️ Interactions', count: historyItems.filter((i) => i.category === 'interaction').length },
              { id: 'account', label: '🛡️ Account Logs', count: historyItems.filter((i) => i.category === 'account').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3.5 py-2 rounded-2xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === tab.id
                    ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-2xs'
                    : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 bg-white/60 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* History Items Area */}
          <div className="space-y-6">
            {groupedItems.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white border border-[#F3DCE8] rounded-[28px] space-y-4 shadow-2xs">
                <Clock size={36} className="text-[#EC4899] opacity-40 mx-auto animate-pulse" />
                <h3 className="font-extrabold text-[#18181B] text-base">No Activity Records Found</h3>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto leading-relaxed font-semibold">
                  We couldn&apos;t find any activity matching your current filter selection. Try adjusting your search query or exploring the platform!
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleResetFilters} leftIcon={<RefreshCw size={12} />}>
                    Reset Filters
                  </Button>
                  <Link href="/feed">
                    <Button variant="primary" size="sm">Explore Platform</Button>
                  </Link>
                </div>
              </div>
            ) : (
              groupedItems.map((group) => (
                <div key={group.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#71717A]">
                      {group.label} ({group.items.length})
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {group.items.map((item) => (
                      <ActivityItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <ClearHistoryModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        targetCategory={activeCategory}
      />

      <MobileNav />
    </div>
  );
}
