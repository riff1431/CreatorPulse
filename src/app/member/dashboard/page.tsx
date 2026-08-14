'use client';

import React from 'react';
import Link from 'next/link';
import { 
  User, CreditCard, Heart, Bookmark, 
  Settings, Clock, Bell, Wallet, Compass, Star 
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { useAuth } from '@/lib/auth/auth-context';

export default function FanDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-4xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#18181B]">Member Dashboard</h1>
              <p className="text-xs text-[#71717A] mt-1 font-medium">Welcome back, {user?.fullName || 'Member'}. Manage your subscriptions and saved posts.</p>
            </div>
            <Link href="/balance">
              <Button variant="outline" size="sm" leftIcon={<Wallet size={16} className="text-[#EC4899]" />}>
                My Balance
              </Button>
            </Link>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between text-[#71717A]">
                <span className="text-xs font-bold uppercase tracking-wider">Active Subs</span>
                <Star size={16} className="text-[#EC4899]" />
              </div>
              <p className="text-2xl font-black text-[#18181B]">2</p>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between text-[#71717A]">
                <span className="text-xs font-bold uppercase tracking-wider">Wallet Balance</span>
                <Wallet size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-[#18181B]">$45.00</p>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between text-[#71717A]">
                <span className="text-xs font-bold uppercase tracking-wider">Saved Posts</span>
                <Bookmark size={16} className="text-[#EC4899]" />
              </div>
              <p className="text-2xl font-black text-[#18181B]">84</p>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between text-[#71717A]">
                <span className="text-xs font-bold uppercase tracking-wider">Total Likes</span>
                <Heart size={16} className="text-[#F43F5E]" />
              </div>
              <p className="text-2xl font-black text-[#18181B]">342</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Subscriptions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-[#18181B] flex items-center gap-2">
                  <Star size={18} className="text-[#EC4899]" /> Subscribed Creators
                </h2>
                <Link href="/explore">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Find more
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Sarah Jenkins', role: 'Pro Designer Tier', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', days: 12 },
                  { name: 'Marcus Vance', role: 'VIP Developer Tier', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', days: 24 }
                ].map((c) => (
                  <Card key={c.name} className="p-4 flex items-start gap-4 hover:border-[#F472B6]/40 transition-colors">
                    <Avatar src={c.avatar} alt={c.name} size="md" isVerified />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#18181B] truncate">{c.name}</h3>
                      <p className="text-xs text-[#71717A] truncate font-medium">{c.role}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="emerald" size="sm">Active</Badge>
                        <span className="text-[10px] text-[#A1A1AA] font-semibold">Renews in {c.days} days</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-base font-extrabold text-[#18181B]">Quick Actions</h2>
              <Card className="p-3 space-y-1.5">
                <Link href="/feed" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FFF1F7] transition-colors text-xs text-[#18181B] font-bold">
                  <Compass size={18} className="text-[#EC4899]" /> Explore Home Feed
                </Link>
                <Link href="/shorts" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FFF1F7] transition-colors text-xs text-[#18181B] font-bold">
                  <Heart size={18} className="text-[#F43F5E]" /> Watch Vertical Shorts
                </Link>
                <Link href="/balance" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FFF1F7] transition-colors text-xs text-[#18181B] font-bold">
                  <CreditCard size={18} className="text-emerald-600" /> Deposit Wallet Funds
                </Link>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
