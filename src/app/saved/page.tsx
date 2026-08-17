'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Bookmark, Sparkles, FolderPlus, Search, RefreshCw, Lock, Globe, 
  MoreVertical, Edit3, Trash2, ArrowLeft, Film, Image as ImageIcon, 
  FolderOutput, Plus 
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/Button';
import { useSaved } from '@/lib/saved/saved-context';
import { SavedCollection } from '@/types/saved';
import { Post, ShortVideo } from '@/lib/supabase/store';
import { SaveToCollectionModal } from '@/components/saved/SaveToCollectionModal';
import { CreateEditCollectionModal } from '@/components/saved/CreateEditCollectionModal';
import { SavedReelCard } from '@/components/saved/SavedReelCard';

export default function SavedPage() {
  const { collections, savedItems, deleteCollection, removeFromCollection, unsaveItem } = useSaved();

  const [activeCollectionId, setActiveCollectionId] = useState<string>('col-all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video' | 'short' | 'poll'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedItemForSave, setSelectedItemForSave] = useState<{
    id: string;
    type: 'post' | 'reel';
    post?: Post;
    short?: ShortVideo;
  } | null>(null);

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<SavedCollection | null>(null);

  const [activeColMenuId, setActiveColMenuId] = useState<string | null>(null);

  // Active collection object
  const activeCollection = collections.find((c) => c.id === activeCollectionId) || collections[0];

  // Filter items in active collection
  const filteredSavedItems = useMemo(() => {
    let items = savedItems;

    // 1. Filter by collection
    if (activeCollectionId !== 'col-all') {
      items = items.filter((item) => item.collectionIds.includes(activeCollectionId));
    }

    // 2. Filter by media type
    if (mediaTypeFilter !== 'all') {
      if (mediaTypeFilter === 'short') {
        items = items.filter((item) => item.itemType === 'reel');
      } else {
        items = items.filter(
          (item) => item.itemType === 'post' && item.post?.postType === mediaTypeFilter
        );
      }
    }

    // 3. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => {
        if (item.post) {
          return (
            (item.post.title || '').toLowerCase().includes(q) ||
            item.post.content.toLowerCase().includes(q) ||
            item.post.authorName.toLowerCase().includes(q) ||
            item.post.authorUsername.toLowerCase().includes(q)
          );
        }
        if (item.short) {
          return (
            item.short.title.toLowerCase().includes(q) ||
            item.short.authorName.toLowerCase().includes(q) ||
            item.short.authorUsername.toLowerCase().includes(q)
          );
        }
        return false;
      });
    }

    return items;
  }, [savedItems, activeCollectionId, mediaTypeFilter, searchQuery]);

  const handleOpenSaveModalForItem = (item: { id: string; type: 'post' | 'reel'; post?: Post; short?: ShortVideo }) => {
    setSelectedItemForSave(item);
    setIsSaveModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setMediaTypeFilter('all');
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
                <Bookmark className="text-[#EC4899] fill-[#EC4899]" size={26} />
                <h1 className="text-2xl font-black text-[#18181B] tracking-tight">Saved Content & Collections</h1>
              </div>
              <p className="text-xs text-[#71717A] font-bold mt-0.5">
                Organize your bookmarked creator posts, reels, and exclusive content in private folders.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() => {
                  setCollectionToEdit(null);
                  setIsCollectionModalOpen(true);
                }}
              >
                New Collection
              </Button>
            </div>
          </div>

          {/* Collections Grid / Carousel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
                <span>📁</span> Your Collections ({collections.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {collections.map((col) => {
                const isActive = activeCollectionId === col.id;
                const isMenuOpen = activeColMenuId === col.id;

                return (
                  <div
                    key={col.id}
                    onClick={() => setActiveCollectionId(col.id)}
                    className={`group relative rounded-[22px] overflow-hidden border transition-all cursor-pointer p-3.5 flex flex-col justify-between h-36 ${
                      isActive
                        ? 'bg-gradient-to-br from-[#FFF1F7] to-[#FCE7F3] border-[#EC4899] shadow-md shadow-[#EC4899]/10 ring-2 ring-[#EC4899]/20'
                        : 'bg-white border-[#F3DCE8] hover:border-[#FBCFE8] hover:shadow-sm'
                    }`}
                  >
                    {/* Background Banner image thumbnail */}
                    {col.coverUrl && (
                      <div className="absolute inset-0 z-0 opacity-15 group-hover:opacity-25 transition-opacity">
                        <img src={col.coverUrl} alt={col.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Top Row */}
                    <div className="relative z-10 flex items-start justify-between">
                      <span className="text-2xl p-1.5 bg-white/90 rounded-xl shadow-2xs">{col.icon || '📁'}</span>

                      <div className="flex items-center gap-1">
                        {col.isPrivate ? (
                          <span className="p-1 text-[#BE185D] bg-[#FCE7F3] rounded-lg border border-[#FBCFE8]" title="Private to you">
                            <Lock size={11} />
                          </span>
                        ) : (
                          <span className="p-1 text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200" title="Public">
                            <Globe size={11} />
                          </span>
                        )}

                        {col.id !== 'col-all' && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveColMenuId(isMenuOpen ? null : col.id);
                              }}
                              className="p-1 text-[#71717A] hover:text-[#18181B] hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                            >
                              <MoreVertical size={14} />
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 top-6 z-30 w-36 bg-white rounded-2xl border border-[#F3DCE8] shadow-xl py-1 text-xs animate-in fade-in duration-150">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveColMenuId(null);
                                    setCollectionToEdit(col);
                                    setIsCollectionModalOpen(true);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-[#FFF1F7] flex items-center gap-2 font-semibold text-[#18181B]"
                                >
                                  <Edit3 size={13} className="text-[#EC4899]" /> Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveColMenuId(null);
                                    deleteCollection(col.id);
                                    if (activeCollectionId === col.id) {
                                      setActiveCollectionId('col-all');
                                    }
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold border-t border-[#F3DCE8]"
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="relative z-10 space-y-0.5">
                      <h3 className={`font-extrabold text-sm truncate ${isActive ? 'text-[#BE185D]' : 'text-[#18181B]'}`}>
                        {col.title}
                      </h3>
                      <p className="text-[11px] font-bold text-[#71717A]">
                        {col.itemIds.length} {col.itemIds.length === 1 ? 'saved item' : 'saved items'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Collection Header Bar */}
          <div className="bg-white border border-[#F3DCE8] rounded-[24px] p-4 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeCollection?.icon || '📂'}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-base text-[#18181B]">{activeCollection?.title}</h2>
                  {activeCollection?.isPrivate ? (
                    <span className="text-[10px] text-[#BE185D] font-bold bg-[#FCE7F3] px-2 py-0.5 rounded-full border border-[#FBCFE8] flex items-center gap-1">
                      <Lock size={9} /> Private to you
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Globe size={9} /> Public Collection
                    </span>
                  )}
                </div>
                {activeCollection?.description && (
                  <p className="text-xs text-[#71717A] font-medium mt-0.5">{activeCollection.description}</p>
                )}
              </div>
            </div>

            {activeCollectionId !== 'col-all' && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit3 size={12} />}
                onClick={() => {
                  setCollectionToEdit(activeCollection);
                  setIsCollectionModalOpen(true);
                }}
              >
                Edit Folder
              </Button>
            )}
          </div>

          {/* Search bar inside Saved items */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeCollection?.title}...`}
              className="w-full bg-white border border-[#F3DCE8] focus:border-[#EC4899] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none transition-all shadow-inner font-semibold"
            />
          </div>

          {/* Media Type Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-[#F3DCE8] pb-2 text-xs font-bold overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: '📂 All Items' },
              { id: 'short', label: '🎥 Reels & Shorts' },
              { id: 'image', label: '🖼️ Images' },
              { id: 'video', label: '🎬 Videos' },
              { id: 'poll', label: '📊 Polls' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMediaTypeFilter(tab.id as any)}
                className={`px-4 py-2 rounded-2xl transition-all shrink-0 cursor-pointer ${
                  mediaTypeFilter === tab.id
                    ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-2xs'
                    : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Saved Items Content Area */}
          <div className="space-y-4">
            {filteredSavedItems.length === 0 ? (
              // Empty Bookmarks View
              <div className="text-center py-16 px-6 bg-white border border-[#F3DCE8] rounded-[28px] space-y-4 shadow-2xs">
                <Bookmark size={36} className="text-[#EC4899] opacity-40 mx-auto animate-pulse" />
                <h3 className="font-extrabold text-[#18181B] text-base">No Saved Content Found</h3>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto leading-relaxed font-semibold">
                  We couldn&apos;t find any saved items matching your criteria in <span className="text-[#EC4899] font-bold">&quot;{activeCollection?.title}&quot;</span>. Try adjusting your filters or bookmarking new posts!
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleResetFilters} leftIcon={<RefreshCw size={12} />}>
                    Reset Filters
                  </Button>
                  <Link href="/feed">
                    <Button variant="primary" size="sm">Explore Feed</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Render Reels in Grid layout if filtering reels */}
                {mediaTypeFilter === 'short' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filteredSavedItems.map((item) => (
                      item.short ? (
                        <SavedReelCard
                          key={item.id}
                          short={item.short}
                          activeCollectionId={activeCollectionId}
                          onOpenSaveModal={(short) => handleOpenSaveModalForItem({ id: short.id, type: 'reel', short })}
                        />
                      ) : null
                    ))}
                  </div>
                ) : (
                  filteredSavedItems.map((item) => {
                    if (item.itemType === 'reel' && item.short) {
                      return (
                        <div key={item.id} className="max-w-sm mx-auto sm:max-w-none">
                          <SavedReelCard
                            short={item.short}
                            activeCollectionId={activeCollectionId}
                            onOpenSaveModal={(short) => handleOpenSaveModalForItem({ id: short.id, type: 'reel', short })}
                          />
                        </div>
                      );
                    }

                    if (item.itemType === 'post' && item.post) {
                      return (
                        <div key={item.id} className="relative group">
                          <PostCard post={item.post} isMemberUnlocked={true} />
                          {/* Folder Option Bar over Post */}
                          <div className="mt-2 px-3 py-1.5 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl flex items-center justify-between text-xs font-semibold text-[#71717A]">
                            <span className="flex items-center gap-1.5 text-[11px]">
                              Saved in <span className="text-[#BE185D] font-bold">{item.collectionIds.length} collections</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenSaveModalForItem({ id: item.post!.id, type: 'post', post: item.post })}
                                className="text-[#BE185D] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <FolderOutput size={12} /> Manage Folders
                              </button>
                              <span>•</span>
                              <button
                                onClick={() => {
                                  if (activeCollectionId !== 'col-all') {
                                    removeFromCollection(item.post!.id, activeCollectionId);
                                  } else {
                                    unsaveItem(item.post!.id);
                                  }
                                }}
                                className="text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedItemForSave && (
        <SaveToCollectionModal
          isOpen={isSaveModalOpen}
          onClose={() => {
            setIsSaveModalOpen(false);
            setSelectedItemForSave(null);
          }}
          item={selectedItemForSave}
          onOpenCreateCollection={() => {
            setCollectionToEdit(null);
            setIsCollectionModalOpen(true);
          }}
        />
      )}

      <CreateEditCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => {
          setIsCollectionModalOpen(false);
          setCollectionToEdit(null);
        }}
        collectionToEdit={collectionToEdit}
      />

      <MobileNav />
    </div>
  );
}
