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

export default function FanDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Fan Dashboard</h1>
          <p className="text-sm text-pink-300/70 mt-1">Manage your subscriptions, saved posts, and account balance</p>
        </div>
        <Link href="/balance">
          <Button variant="outline" size="sm" leftIcon={<Wallet size={16} className="text-pink-400" />}>
            My Balance
          </Button>
        </Link>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2 border-pink-500/20">
          <div className="flex items-center justify-between text-pink-300/70">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subs</span>
            <Star size={16} className="text-pink-400" />
          </div>
          <p className="text-2xl font-black text-white">12</p>
        </Card>

        <Card className="p-4 space-y-2 border-pink-500/20">
          <div className="flex items-center justify-between text-pink-300/70">
            <span className="text-xs font-semibold uppercase tracking-wider">Wallet Balance</span>
            <Wallet size={16} className="text-pink-400" />
          </div>
          <p className="text-2xl font-black text-white">$45.00</p>
        </Card>

        <Card className="p-4 space-y-2 border-pink-500/20">
          <div className="flex items-center justify-between text-pink-300/70">
            <span className="text-xs font-semibold uppercase tracking-wider">Saved Posts</span>
            <Bookmark size={16} className="text-pink-400" />
          </div>
          <p className="text-2xl font-black text-white">84</p>
        </Card>

        <Card className="p-4 space-y-2 border-pink-500/20">
          <div className="flex items-center justify-between text-pink-300/70">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Likes</span>
            <Heart size={16} className="text-pink-400" />
          </div>
          <p className="text-2xl font-black text-white">342</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Subscriptions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star size={18} className="text-pink-400" /> My Creators
            </h2>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-pink-400 text-xs">
                Find more
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 flex items-start gap-4 border-pink-500/20 hover:border-pink-500/40 transition-colors">
                <Avatar 
                  src={`https://i.pravatar.cc/150?u=${i}`} 
                  alt="Creator" 
                  size="md" 
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-pink-100 truncate">Creator {i}</h3>
                  <p className="text-xs text-pink-300/70 truncate">VIP Membership</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="pink" size="sm">Active</Badge>
                    <span className="text-[10px] text-pink-300/50">Renews in 12 days</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          <Card className="p-4 space-y-2 border-pink-500/20">
            <Link href="/feed" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-pink-500/10 transition-colors text-sm text-pink-200">
              <Compass size={18} className="text-pink-400" /> Explore Home Feed
            </Link>
            <Link href="/shorts" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-pink-500/10 transition-colors text-sm text-pink-200">
              <Heart size={18} className="text-pink-400" /> Watch Vertical Shorts
            </Link>
            <Link href="/balance" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-pink-500/10 transition-colors text-sm text-pink-200">
              <CreditCard size={18} className="text-pink-400" /> Deposit Wallet Funds
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
