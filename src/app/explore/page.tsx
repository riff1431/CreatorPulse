'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Compass, Sparkles, Filter, Users, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_CREATOR_DETAILS } from '@/lib/supabase/store';

function ExplorePageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  // Read search term from URL query parameter (e.g. from global search)
  useEffect(() => {
    const query = searchParams.get('q');
    if (query !== null) {
      const timer = setTimeout(() => {
        setSearchQuery(query);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const categories = ['All', 'Art & Design', 'Education & Tech', 'Fitness & Wellness', 'Business & Coaching', 'Music & Sound'];

  const creators = Object.values(MOCK_CREATOR_DETAILS).filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex theme-layout-wrapper theme-gap px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-4xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Compass className="text-[#EC4899]" size={24} />
              <h1 className="text-2xl font-black text-[#18181B]">Explore Creators & Communities</h1>
            </div>
            <p className="text-xs text-[#71717A] font-medium">Discover verified educators, engineers, and digital artists.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by creator name, topic, or keyword..."
              className="w-full bg-white border border-[#F3DCE8] focus:border-[#EC4899] rounded-2xl pl-11 pr-4 py-3 text-sm text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:ring-3 focus:ring-[#EC4899]/15 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'gradient-btn text-white shadow-md shadow-[#EC4899]/20'
                    : 'bg-white text-[#71717A] hover:text-[#18181B] border border-[#F3DCE8] hover:border-[#F472B6]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {creators.map((creator) => (
              <Card key={creator.id} hoverable className="space-y-4">
                <div className="relative h-28 rounded-2xl overflow-hidden bg-[#FFF1F7] -mx-5 -mt-5 mb-2">
                  <img src={creator.coverImageUrl} alt={creator.fullName} className="w-full h-full object-cover" />
                </div>

                <div className="flex items-end justify-between -mt-10 relative z-10 px-1">
                  <Avatar alt={creator.fullName} src={creator.avatarUrl} size="xl" isVerified={creator.isVerified} />
                  <Badge variant="pink" size="md">From ${creator.startingPrice}/mo</Badge>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#18181B]">{creator.fullName}</h3>
                  <p className="text-xs text-[#BE185D] font-bold">@{creator.username} • {creator.category}</p>
                  <p className="text-xs text-[#71717A] mt-2 line-clamp-2 leading-relaxed">{creator.headline}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-[#71717A] border-t border-[#F3DCE8] pt-3 font-medium">
                  <span><strong className="text-[#18181B]">{creator.subscriberCount.toLocaleString()}</strong> Subscribers</span>
                  <span><strong className="text-[#18181B]">{creator.followerCount.toLocaleString()}</strong> Followers</span>
                </div>

                <Link href={`/c/${creator.username}`} className="block">
                  <Button variant="secondary" size="sm" className="w-full" rightIcon={<ArrowRight size={14} />}>
                    View Creator Profile
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col justify-center items-center">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <Compass className="text-[#EC4899] animate-spin" size={32} />
          <p className="text-xs text-[#71717A] font-medium">Loading Explore...</p>
        </div>
      </div>
    }>
      <ExplorePageContent />
    </Suspense>
  );
}
