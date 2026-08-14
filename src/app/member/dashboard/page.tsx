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
          <p className="text-sm text-slate-400 mt-1">Manage your subscriptions and account</p>
        </div>
        <Link href="/settings">
          <Button variant="outline" size="sm" leftIcon={<Settings size={16} />}>
            Settings
          </Button>
        </Link>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subs</span>
            <Star size={16} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">12</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Wallet Balance</span>
            <Wallet size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">$45.00</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Saved Posts</span>
            <Bookmark size={16} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">84</p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Likes</span>
            <Heart size={16} className="text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white">342</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Subscriptions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star size={18} className="text-indigo-400" /> My Creators
            </h2>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-cyan-400 text-xs">
                Find more
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 flex items-start gap-4 hover:border-cyan-500/30 transition-colors">
                <Avatar 
                  src={`https://i.pravatar.cc/150?u=${i}`} 
                  alt="Creator" 
                  size="md" 
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-100 truncate">Creator {i}</h3>
                  <p className="text-xs text-slate-400 truncate">VIP Membership</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="indigo" size="sm">Active</Badge>
                    <span className="text-[10px] text-slate-500">Renews in 12 days</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Compass size={18} className="text-cyan-400" /> Quick Links
            </h2>
            <div className="space-y-2">
              <Link href="/balance">
                <Card className="p-3 flex items-center gap-3 hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Wallet size={16} />
                  </div>
                  <div className="flex-1 text-sm font-semibold text-slate-200">Add Funds to Wallet</div>
                </Card>
              </Link>
              <Link href="/saved">
                <Card className="p-3 flex items-center gap-3 hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Bookmark size={16} />
                  </div>
                  <div className="flex-1 text-sm font-semibold text-slate-200">View Saved Content</div>
                </Card>
              </Link>
              <Link href="/feed">
                <Card className="p-3 flex items-center gap-3 hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <User size={16} />
                  </div>
                  <div className="flex-1 text-sm font-semibold text-slate-200">Subscribed Feed</div>
                </Card>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-slate-400" /> Recent Transactions
            </h2>
            <Card className="divide-y divide-slate-800/60">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <CreditCard size={14} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">Monthly Subs</p>
                      <p className="text-[10px] text-slate-500">Oct 12, 2023</p>
                    </div>
                  </div>
                  <span className="font-bold text-rose-400">-$15.00</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
