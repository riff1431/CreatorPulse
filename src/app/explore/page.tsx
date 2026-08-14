'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-4xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Compass className="text-cyan-400" size={24} />
              <h1 className="text-2xl font-black text-white">Explore Creators & Communities</h1>
            </div>
            <p className="text-xs text-slate-400">Discover verified educators, engineers, and digital artists.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by creator name, topic, or keyword..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'gradient-btn text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {creators.map((creator) => (
              <Card key={creator.id} hoverable className="space-y-4">
                <div className="relative h-28 rounded-xl overflow-hidden bg-slate-800 -mx-5 -mt-5 mb-2">
                  <img src={creator.coverImageUrl} alt={creator.fullName} className="w-full h-full object-cover" />
                </div>

                <div className="flex items-end justify-between -mt-10 relative z-10 px-1">
                  <Avatar alt={creator.fullName} src={creator.avatarUrl} size="xl" isVerified={creator.isVerified} />
                  <Badge variant="cyan" size="md">From ${creator.startingPrice}/mo</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-100">{creator.fullName}</h3>
                  <p className="text-xs text-cyan-400">@{creator.username} • {creator.category}</p>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">{creator.headline}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <span><strong>{creator.subscriberCount.toLocaleString()}</strong> Subscribers</span>
                  <span><strong>{creator.followerCount.toLocaleString()}</strong> Followers</span>
                </div>

                <Link href={`/c/${creator.username}`} className="block">
                  <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight size={14} />}>
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
