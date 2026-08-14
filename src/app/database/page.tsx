'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Database, Code, Copy, Check, Terminal, ExternalLink, Play, Server } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function DatabasePage() {
  const [selectedTable, setSelectedTable] = useState('profiles');
  const [copied, setCopied] = useState(false);
  const [activeQuery, setActiveQuery] = useState('SELECT * FROM public.profiles LIMIT 5;');

  const tables = [
    { name: 'profiles', rows: 4, columns: ['id', 'email', 'full_name', 'username', 'role', 'created_at'] },
    { name: 'creator_profiles', rows: 2, columns: ['id', 'headline', 'follower_count', 'subscriber_count', 'monthly_price', 'total_revenue'] },
    { name: 'posts', rows: 3, columns: ['id', 'author_id', 'title', 'post_type', 'visibility', 'likes_count'] },
    { name: 'stories', rows: 2, columns: ['id', 'creator_id', 'media_url', 'caption', 'expires_at'] },
    { name: 'memberships', rows: 2, columns: ['id', 'member_id', 'creator_id', 'tier_name', 'amount', 'status'] },
    { name: 'creator_applications', rows: 2, columns: ['id', 'user_id', 'category', 'reason', 'status'] },
    { name: 'reports', rows: 2, columns: ['id', 'reporter_id', 'post_id', 'reason', 'status'] }
  ];

  const currentTableObj = tables.find((t) => t.name === selectedTable) || tables[0];

  const handleCopySchema = () => {
    navigator.clipboard.writeText(`-- CreatorPulse Supabase Migration Script
-- Located at: supabase/schema.sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'member'
);
`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFF9FC] text-[#18181B] flex flex-col selection:bg-[#FCE7F3] selection:text-[#DB2777]">
      <RoleSwitcher />
      <Navbar />

      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6 px-4 lg:px-8 py-6">
        <Sidebar />

        <main className="flex-1 space-y-6 max-w-4xl mx-auto lg:mx-0 w-full pb-20 lg:pb-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3DCE8] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="text-[#EC4899]" size={24} />
                <h1 className="text-2xl font-black text-[#18181B]">Supabase Schema & Inspector</h1>
              </div>
              <p className="text-xs text-[#71717A] font-medium">Inspect PostgreSQL table structures, RLS policies, and query simulator.</p>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={handleCopySchema}
            >
              {copied ? 'Copied Migration Script!' : 'Copy SQL Schema'}
            </Button>
          </div>

          {/* Table List Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {tables.map((tbl) => (
              <button
                key={tbl.name}
                onClick={() => setSelectedTable(tbl.name)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedTable === tbl.name
                    ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-sm'
                    : 'bg-white text-[#71717A] border border-[#F3DCE8] hover:text-[#18181B]'
                }`}
              >
                {tbl.name} ({tbl.rows} rows)
              </button>
            ))}
          </div>

          {/* Table Structure Visualizer */}
          <Card className="p-0 overflow-x-auto">
            <div className="p-5 flex items-center justify-between border-b border-[#F3DCE8]">
              <div>
                <h3 className="font-bold text-base text-[#18181B] font-mono">public.{currentTableObj.name}</h3>
                <span className="text-xs text-[#71717A]">PostgreSQL Table • Row Level Security Enabled</span>
              </div>
              <Badge variant="pink" size="sm">RLS Protected</Badge>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#F3DCE8] text-[#71717A] bg-[#FFF9FC]">
                  <th className="py-3 px-4 font-bold">Column Name</th>
                  <th className="py-3 px-4 font-bold">PostgreSQL Type</th>
                  <th className="py-3 px-4 font-bold">Constraints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3DCE8] text-[#18181B]">
                {currentTableObj.columns.map((col, idx) => (
                  <tr key={idx} className="hover:bg-[#FFF9FC]">
                    <td className="py-3 px-4 font-bold text-[#BE185D]">{col}</td>
                    <td className="py-3 px-4 text-[#71717A]">
                      {col.includes('id') ? 'UUID' : col.includes('count') || col.includes('amount') ? 'NUMERIC/INT' : 'TEXT'}
                    </td>
                    <td className="py-3 px-4">
                      {idx === 0 ? (
                        <span className="text-[#F43F5E] font-bold">PRIMARY KEY</span>
                      ) : col.includes('id') ? (
                        <span className="text-purple-600 font-semibold">FOREIGN KEY</span>
                      ) : (
                        <span className="text-[#A1A1AA]">NOT NULL</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Interactive SQL Query Simulator */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="text-[#EC4899]" size={18} />
                <h3 className="font-bold text-sm text-[#18181B]">SQL Query Console Simulator</h3>
              </div>
              <Button variant="ghost" size="sm" leftIcon={<Play size={12} className="text-emerald-600" />}>
                Execute Query
              </Button>
            </div>

            <textarea
              value={activeQuery}
              onChange={(e) => setActiveQuery(e.target.value)}
              rows={3}
              className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl p-3 font-mono text-xs text-[#BE185D] focus:outline-none focus:border-[#EC4899] font-semibold"
            />
          </Card>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
