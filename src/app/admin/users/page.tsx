'use client';

import React, { useState } from 'react';
import { Users, Search, Filter, MoreVertical, Shield, UserCheck, Ban } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

const allUsers = [
  { id: '1', name: 'Alex Vance', username: 'alexvance', email: 'alex@community.io', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', role: 'member', verified: false, status: 'active', joined: '2026-01-15' },
  { id: '2', name: 'Sarah Jenkins', username: 'sarahdesign', email: 'sarah@designcode.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'creator', verified: true, status: 'active', joined: '2025-11-10' },
  { id: '3', name: 'Marcus Vance', username: 'marcuscode', email: 'marcus@codemaster.io', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', role: 'creator', verified: true, status: 'active', joined: '2025-08-20' },
  { id: '4', name: 'Elena Rostova', username: 'elena_admin', email: 'admin@creatorpulse.com', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', role: 'admin', verified: true, status: 'active', joined: '2025-01-01' },
  { id: '5', name: 'Jordan Lee', username: 'jordanlee', email: 'jordan@email.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'member', verified: false, status: 'active', joined: '2026-03-22' },
  { id: '6', name: 'Mia Wong', username: 'miawong', email: 'mia@email.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'member', verified: false, status: 'suspended', joined: '2026-05-01' },
  { id: '7', name: 'crypto_bot_99', username: 'crypto_bot_99', email: 'bot99@spam.io', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150', role: 'member', verified: false, status: 'banned', joined: '2026-07-10' },
];

type RoleFilter = 'all' | 'member' | 'creator' | 'admin';
type StatusFilter = 'all' | 'active' | 'suspended' | 'banned';

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = allUsers.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Users className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">User Management</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">View, search, and manage all platform users.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] focus:ring-2 focus:ring-[#EC4899]/15 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#A1A1AA]" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
          >
            <option value="all">All Roles</option>
            <option value="member">Members</option>
            <option value="creator">Creators</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] shadow-sm font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 font-bold">User</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Email</th>
              <th className="py-3.5 px-4 font-bold">Role</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold hidden md:table-cell">Joined</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} alt={u.name} size="sm" isVerified={u.verified} />
                    <div>
                      <p className="font-bold text-[#18181B]">{u.name}</p>
                      <p className="text-[10px] text-[#71717A]">@{u.username}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#71717A] hidden sm:table-cell font-medium">{u.email}</td>
                <td className="py-3 px-4">
                  <Badge
                    variant={u.role === 'admin' ? 'rose' : u.role === 'creator' ? 'pink' : 'slate'}
                    size="sm"
                  >
                    {u.role === 'admin' && <Shield size={10} />}
                    {u.role === 'creator' && <UserCheck size={10} />}
                    {u.role.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge
                    variant={u.status === 'active' ? 'emerald' : u.status === 'suspended' ? 'amber' : 'rose'}
                    size="sm"
                  >
                    {u.status === 'banned' && <Ban size={10} />}
                    {u.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-[#A1A1AA] hidden md:table-cell font-medium">{u.joined}</td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm">
                    <MoreVertical size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-sm text-[#71717A]">No users match your filters.</div>
        )}
      </Card>
    </div>
  );
}
