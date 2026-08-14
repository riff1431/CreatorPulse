'use client';

import React, { useState } from 'react';
import { Users, Search, Filter, Shield, UserCheck, Ban, Clock, Mail, Calendar, CreditCard, Eye, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

const allUsersList = [
  { id: '1', name: 'Alex Vance', username: 'alexvance', email: 'alex@community.io', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', role: 'member', verified: false, status: 'active', joined: '2026-01-15', balance: '$45.00' },
  { id: '2', name: 'Sarah Jenkins', username: 'sarahdesign', email: 'sarah@designcode.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'creator', verified: true, status: 'active', joined: '2025-11-10', balance: '$4,850.00' },
  { id: '3', name: 'Marcus Vance', username: 'marcuscode', email: 'marcus@codemaster.io', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', role: 'creator', verified: true, status: 'active', joined: '2025-08-20', balance: '$8,200.00' },
  { id: '4', name: 'Elena Rostova', username: 'elena_admin', email: 'admin@creatorpulse.com', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', role: 'admin', verified: true, status: 'active', joined: '2025-01-01', balance: '$0.00' },
  { id: '5', name: 'Jordan Lee', username: 'jordanlee', email: 'jordan@email.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'member', verified: false, status: 'active', joined: '2026-03-22', balance: '$120.00' },
  { id: '6', name: 'Mia Wong', username: 'miawong', email: 'mia@email.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'member', verified: false, status: 'suspended', joined: '2026-05-01', balance: '$5.00' },
  { id: '7', name: 'crypto_bot_99', username: 'crypto_bot_99', email: 'bot99@spam.io', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150', role: 'member', verified: false, status: 'banned', joined: '2026-07-10', balance: '$0.00' },
];

type RoleFilter = 'all' | 'member' | 'creator' | 'admin';
type StatusFilter = 'all' | 'active' | 'suspended' | 'banned';

export default function AdminUsersPage() {
  const [users, setUsers] = useState(allUsersList);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<typeof allUsersList[0] | null>(null);
  const { showToast } = useToast();

  const handleUpdateStatus = (id: string, nextStatus: 'active' | 'suspended' | 'banned') => {
    setUsers(users.map((u) => {
      if (u.id === id) {
        showToast(`User status marked as ${nextStatus.toUpperCase()}.`, 'info');
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser({ ...selectedUser, status: nextStatus });
    }
  };

  const handleToggleVerified = (id: string) => {
    setUsers(users.map((u) => {
      if (u.id === id) {
        const nextVerified = !u.verified;
        showToast(nextVerified ? 'User marked as verified.' : 'User verification removed.', 'success');
        return { ...u, verified: nextVerified };
      }
      return u;
    }));
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser({ ...selectedUser, verified: !selectedUser.verified });
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (searchQuery &&
      !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !u.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Users className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B] tracking-tight">User Management</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Verify, moderate, and inspect profile permissions.</p>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={13} />
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#F3DCE8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium shadow-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#A1A1AA]" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
            className="bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-bold shadow-xs cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="member">Members</option>
            <option value="creator">Creators</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-bold shadow-xs cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Responsive Table with scrollability shadows */}
      <Card className="overflow-hidden p-0 border-[#F3DCE8]/80">
        <div className="overflow-x-auto relative">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] font-bold">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Joined</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Balance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3DCE8]/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#FFF9FC]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} alt={u.name} size="sm" isVerified={u.verified} />
                      <div>
                        <p className="font-bold text-[#18181B]">{u.name}</p>
                        <p className="text-[10px] text-[#71717A]">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#71717A] hidden sm:table-cell font-semibold">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === 'admin' ? 'rose' : u.role === 'creator' ? 'pink' : 'slate'} size="sm">
                      {u.role.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={u.status === 'active' ? 'emerald' : u.status === 'suspended' ? 'amber' : 'rose'} size="sm">
                      {u.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-[#A1A1AA] hidden md:table-cell font-bold">{u.joined}</td>
                  <td className="py-3 px-4 text-[#18181B] font-black hidden sm:table-cell">{u.balance}</td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm" leftIcon={<Eye size={13} />} onClick={() => setSelectedUser(u)}>
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#71717A] font-bold">
                    No users match your active filter settings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Inspection Detail Modal */}
      <Modal
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `Inspect User Profile: ${selectedUser.name}` : ''}
      >
        {selectedUser && (
          <div className="space-y-5">
            {/* Modal Avatar details */}
            <div className="flex items-center gap-4 pb-3 border-b border-[#F3DCE8]">
              <Avatar src={selectedUser.avatar} alt={selectedUser.name} size="lg" isVerified={selectedUser.verified} />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-[#18181B] tracking-tight">{selectedUser.name}</h4>
                <p className="text-[10px] text-[#71717A] font-bold">@{selectedUser.username} • User ID: #{selectedUser.id}</p>
                <div className="flex gap-1.5 pt-0.5">
                  <Badge variant={selectedUser.role === 'admin' ? 'rose' : selectedUser.role === 'creator' ? 'pink' : 'slate'} size="sm">
                    {selectedUser.role.toUpperCase()}
                  </Badge>
                  <Badge variant={selectedUser.status === 'active' ? 'emerald' : selectedUser.status === 'suspended' ? 'amber' : 'rose'} size="sm">
                    {selectedUser.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Profile Logs Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] flex items-center gap-2">
                <Mail size={14} className="text-[#EC4899] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-[#71717A] font-bold">Email Address</p>
                  <p className="font-extrabold text-[#18181B] truncate">{selectedUser.email}</p>
                </div>
              </div>
              <div className="p-3 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] flex items-center gap-2">
                <Calendar size={14} className="text-[#EC4899] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-[#71717A] font-bold">Member Since</p>
                  <p className="font-extrabold text-[#18181B] truncate">{selectedUser.joined}</p>
                </div>
              </div>
              <div className="p-3 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] flex items-center gap-2 col-span-2">
                <CreditCard size={14} className="text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-[#71717A] font-bold">Wallet / Wallet Balance</p>
                  <p className="font-extrabold text-[#18181B] truncate">{selectedUser.balance} Available</p>
                </div>
              </div>
            </div>

            {/* Management Actions */}
            <div className="space-y-2 pt-2 border-t border-[#F3DCE8]">
              <h5 className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-wider">Administrative Actions</h5>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleVerified(selectedUser.id)}
                >
                  {selectedUser.verified ? 'Remove Verification' : 'Grant Verification Badge'}
                </Button>

                {selectedUser.status === 'active' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-amber-600 border-amber-200 hover:bg-amber-50"
                      onClick={() => handleUpdateStatus(selectedUser.id, 'suspended')}
                    >
                      Suspend User
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedUser.id, 'banned')}
                    >
                      Ban Account
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedUser.id, 'active')}
                  >
                    Restore Account
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
