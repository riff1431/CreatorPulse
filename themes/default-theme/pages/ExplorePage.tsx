'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { MOCK_CREATOR_DETAILS, CreatorProfile } from '@/lib/supabase/store';
import { Compass, Search, TrendingUp, Sparkles, Filter, Users, ArrowRight, X } from 'lucide-react';
import { prefersReducedMotion } from '../utils/animations';

const CATEGORIES = ['All', 'Art & Design', 'Music & Audio', 'Fitness & Wellness', 'Education & Tech', 'Photography'];

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const gridRef = useRef<HTMLDivElement>(null);

  const creators = Object.values(MOCK_CREATOR_DETAILS);

  const filteredCreators = creators.filter((creator) => {
    const matchesCategory = selectedCategory === 'All' || creator.category === selectedCategory;
    const matchesSearch =
      creator.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (gridRef.current && !prefersReducedMotion()) {
      gsap.fromTo(
        gridRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, [selectedCategory, searchQuery]);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#FFF1F7] to-[#FCE7F3] dark:from-[#241A30] dark:to-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="text-[#EC4899]" size={24} />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#18181B] dark:text-[#FDF2F8]">
              Explore Creators
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#D4B8D0] max-w-xl">
            Discover verified artists, educators, and content creators. Unlock VIP passes and private feeds.
          </p>

          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by creator name, topic, or keyword..."
              className="w-full bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] focus:border-[#EC4899] rounded-2xl pl-10 pr-10 py-2.5 text-xs text-[#18181B] dark:text-[#FDF2F8] placeholder-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B] cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#EC4899] text-white shadow-sm shadow-pink-500/25'
                  : 'bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] text-[#71717A] dark:text-[#D4B8D0] hover:text-[#EC4899]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Creators Grid */}
        {filteredCreators.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCreators.map((creator) => (
              <Card key={creator.id} hoverable className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={creator.avatarUrl}
                      alt={creator.fullName}
                      size="lg"
                      isVerified={creator.isVerified}
                      hasStory={true}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-[#18181B] dark:text-[#FDF2F8] truncate">{creator.fullName}</h3>
                      <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] truncate">@{creator.username}</p>
                      <span className="text-[10px] font-extrabold text-[#BE185D] dark:text-[#F472B6] bg-[#FCE7F3] dark:bg-[#381A2B] px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {creator.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#52525B] dark:text-[#D4B8D0] line-clamp-2 leading-relaxed">
                    {creator.bio}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#71717A] dark:text-[#D4B8D0]">
                    <span>{(creator.subscriberCount || 0).toLocaleString()} Subscribers</span>
                    <span>{(creator.followerCount || 0).toLocaleString()} Followers</span>
                  </div>

                  <Link href={`/c/${creator.username}`} className="block">
                    <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight size={13} />}>
                      View VIP Studio
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#1A1222] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-3xl space-y-3">
            <Compass size={32} className="mx-auto text-[#A1A1AA]" />
            <h3 className="font-bold text-sm text-[#18181B] dark:text-[#FDF2F8]">No creators found</h3>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0]">Try adjusting your search query or selecting a different category.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default ExplorePage;
