'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Mail, Calendar, CreditCard, Eye, AlertTriangle, 
  ShieldAlert, CheckSquare, Square, RefreshCw, UserCheck, Shield, Trash2, 
  CheckCircle2, Clock, FileText, Film, Activity, Lock, Unlock, UserX
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { Avatar } from '@/components/admin/ui/Avatar';
import { Modal } from '@/components/admin/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/auth-context';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { 
  getUsers, 
  getRoles, 
  assignRoleToUsers, 
  updateUserStatusBulk,
  deleteUsersBulk,
  getUserActivityLogs,
  saveUsers, 
  UserDirectoryItem, 
  DynamicRole,
  UserActivityItem
} from '@/lib/auth/role-store';

export default function AdminUsersPage() {
  const { user: actor, role: actorRole } = useAuth();
  const [users, setUsers] = useState<UserDirectoryItem[]>([]);
  const [roles, setRoles] = useState<DynamicRole[]>([]);
  
  // Filter state
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected user for inspection modal
  const [selectedUser, setSelectedUser] = useState<UserDirectoryItem | null>(null);
  const [userModalTab, setUserModalTab] = useState<'overview' | 'activity' | 'content'>('overview');
  
  // Bulk selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkTargetRoleId, setBulkTargetRoleId] = useState('');
  const [isBulkRoleConfirmOpen, setIsBulkRoleConfirmOpen] = useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
  
  // Individual role edit state
  const [editUserRoleId, setEditUserRoleId] = useState('');
  const [isIndividualRoleConfirmOpen, setIsIndividualRoleConfirmOpen] = useState(false);

  const { showToast } = useToast();

  const loadData = () => {
    setUsers(getUsers());
    setRoles(getRoles());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('creatorpulse_users_updated', loadData);
    return () => {
      window.removeEventListener('creatorpulse_users_updated', loadData);
    };
  }, []);

  const handleUpdateSingleStatus = (id: string, nextStatus: 'active' | 'suspended' | 'banned') => {
    if (!actor) return;
    const res = updateUserStatusBulk([id], nextStatus, { fullName: actor.fullName, role: actorRole });
    if (res.success) {
      showToast(`User status marked as ${nextStatus.toUpperCase()}.`, 'info');
      loadData();
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser({ ...selectedUser, status: nextStatus });
      }
    } else {
      showToast(res.error || 'Failed to update status', 'error');
    }
  };

  const handleToggleVerified = (id: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const nextVerified = !u.verified;
        showToast(nextVerified ? 'User marked as verified.' : 'User verification removed.', 'success');
        return { ...u, verified: nextVerified };
      }
      return u;
    });
    setUsers(updated);
    saveUsers(updated);
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser({ ...selectedUser, verified: !selectedUser.verified });
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (filteredList: UserDirectoryItem[]) => {
    const filteredIds = filteredList.map(u => u.id);
    const allSelected = filteredIds.every(id => selectedUserIds.includes(id));
    
    if (allSelected) {
      setSelectedUserIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedUserIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleRequestIndividualRoleChange = (roleId: string) => {
    if (!selectedUser) return;
    setEditUserRoleId(roleId);
    setIsIndividualRoleConfirmOpen(true);
  };

  const executeIndividualRoleChange = () => {
    if (!selectedUser || !actor) return;
    
    const res = assignRoleToUsers([selectedUser.id], editUserRoleId, {
      id: actor.id,
      fullName: actor.fullName,
      role: actorRole
    });

    if (res.success) {
      showToast(`User role updated to ${editUserRoleId.toUpperCase()}.`, 'success');
      setIsIndividualRoleConfirmOpen(false);
      
      const updatedUser = getUsers().find(u => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
      loadData();
    } else {
      showToast(res.error || 'Failed to assign role.', 'error');
      setIsIndividualRoleConfirmOpen(false);
    }
  };

  const executeBulkRoleChange = () => {
    if (!actor) return;
    const res = assignRoleToUsers(selectedUserIds, bulkTargetRoleId, {
      id: actor.id,
      fullName: actor.fullName,
      role: actorRole
    });

    if (res.success) {
      showToast(`Successfully assigned role to ${selectedUserIds.length} users!`, 'success');
      setSelectedUserIds([]);
      setBulkTargetRoleId('');
      setIsBulkRoleConfirmOpen(false);
      loadData();
    } else {
      showToast(res.error || 'Bulk role assignment failed.', 'error');
      setIsBulkRoleConfirmOpen(false);
    }
  };

  const executeBulkStatusChange = (nextStatus: 'active' | 'suspended' | 'banned') => {
    if (!actor) return;
    const res = updateUserStatusBulk(selectedUserIds, nextStatus, { fullName: actor.fullName, role: actorRole });
    if (res.success) {
      showToast(`Bulk updated status to ${nextStatus.toUpperCase()} for ${selectedUserIds.length} users.`, 'info');
      setSelectedUserIds([]);
      loadData();
    } else {
      showToast(res.error || 'Bulk status update failed', 'error');
    }
  };

  const executeBulkDelete = () => {
    if (!actor) return;
    const res = deleteUsersBulk(selectedUserIds, { fullName: actor.fullName, role: actorRole });
    if (res.success) {
      showToast(`Successfully deleted ${selectedUserIds.length} user profiles.`, 'success');
      setSelectedUserIds([]);
      setIsBulkDeleteConfirmOpen(false);
      loadData();
    } else {
      showToast(res.error || 'Bulk delete failed', 'error');
      setIsBulkDeleteConfirmOpen(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (verifiedFilter === 'verified' && !u.verified) return false;
    if (verifiedFilter === 'unverified' && u.verified) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchUsername = u.username.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      return matchName || matchEmail || matchUsername || matchId;
    }
    return true;
  });

  return (
    <RoleGuard
      requiredPermission="manage_users"
      fallbackTitle="Security Clearance Required"
      fallbackMessage="You do not have permission to view or manage platform user directories."
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="text-indigo-600" size={24} />
              <h1 className="text-xl font-black text-[#18181B] tracking-tight">Dynamic User Management Center</h1>
            </div>
            <p className="text-xs text-[#71717A] mt-1 font-medium">
              Inspect live database user profiles, verify credentials, manage account status, assign dynamic authorization roles, and track full activity history.
            </p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={13} />} onClick={loadData}>
            Sync User Registry
          </Button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-4 border border-slate-200 rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={13} />
              <input
                type="text"
                placeholder="Search by name, username, email, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-indigo-500 font-medium shadow-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-[#A1A1AA]" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold shadow-xs cursor-pointer"
              >
                <option value="all">All Roles</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold shadow-xs cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold shadow-xs cursor-pointer"
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions Control Bar */}
          {selectedUserIds.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-lg flex-wrap">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase whitespace-nowrap">
                {selectedUserIds.length} Selected
              </span>
              
              <div className="flex items-center gap-1.5">
                <select
                  value={bulkTargetRoleId}
                  onChange={(e) => setBulkTargetRoleId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Bulk Assign Role...</option>
                  {roles
                    .filter(r => r.status === 'active')
                    .map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
                <Button 
                  type="button" 
                  variant="primary" 
                  size="sm" 
                  disabled={!bulkTargetRoleId}
                  onClick={() => setIsBulkRoleConfirmOpen(true)}
                  className="py-1 text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Apply Role
                </Button>
              </div>

              <div className="h-4 w-[1px] bg-slate-700 mx-1" />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => executeBulkStatusChange('active')}
                className="py-1 text-[10px] text-emerald-400 border-emerald-900/50 hover:bg-emerald-950"
              >
                Activate
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => executeBulkStatusChange('suspended')}
                className="py-1 text-[10px] text-amber-400 border-amber-900/50 hover:bg-amber-950"
              >
                Suspend
              </Button>

              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setIsBulkDeleteConfirmOpen(true)}
                className="py-1 text-[10px]"
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {/* Users Data Table */}
        <Card className="overflow-hidden p-0 border-slate-200/80 shadow-sm">
          <div className="overflow-x-auto relative">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[#71717A] font-bold">
                  <th className="py-3.5 px-4 w-10">
                    <button 
                      onClick={() => handleSelectAll(filteredUsers)}
                      className="text-indigo-600 hover:opacity-80 p-0.5 cursor-pointer flex items-center justify-center"
                    >
                      {filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id)) ? (
                        <CheckSquare size={15} />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-2">User Profile</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Joined Date</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Wallet Balance</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {filteredUsers.map((u) => {
                  const roleObj = roles.find(r => r.id === u.role);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => handleToggleSelectUser(u.id)}
                          className="text-[#71717A] hover:text-indigo-600 cursor-pointer flex items-center justify-center"
                        >
                          {selectedUserIds.includes(u.id) ? (
                            <CheckSquare size={15} className="text-indigo-600" />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <Avatar src={u.avatar} alt={u.name} size="sm" isVerified={u.verified} />
                          <div>
                            <p className="font-bold text-[#18181B] flex items-center gap-1">
                              {u.name}
                              {u.verified && <CheckCircle2 size={12} className="text-blue-500 fill-blue-500/10" />}
                            </p>
                            <p className="text-[10px] text-[#71717A]">@{u.username} • ID: #{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#71717A] hidden sm:table-cell font-semibold">{u.email}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={u.role === 'admin' ? 'rose' : u.role === 'creator' ? 'pink' : 'slate'} 
                          size="sm"
                        >
                          {roleObj ? roleObj.name : u.role.toUpperCase()}
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          leftIcon={<Eye size={13} />} 
                          onClick={() => {
                            setSelectedUser(u);
                            setUserModalTab('overview');
                          }}
                        >
                          Inspect & Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#71717A] font-bold">
                      No user accounts match your active search and filter settings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Comprehensive User Inspection & Detail Drawer */}
        <Modal
          isOpen={selectedUser !== null}
          onClose={() => setSelectedUser(null)}
          title={selectedUser ? `User Detail Inspector: ${selectedUser.name}` : ''}
        >
          {selectedUser && (
            <div className="space-y-5">
              {/* Modal User Header Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <Avatar src={selectedUser.avatar} alt={selectedUser.name} size="lg" isVerified={selectedUser.verified} />
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-[#18181B] tracking-tight flex items-center gap-1.5">
                      {selectedUser.name}
                      {selectedUser.verified && <Badge variant="blue" size="sm">Verified</Badge>}
                    </h4>
                    <p className="text-[10px] text-[#71717A] font-bold">@{selectedUser.username} • Account ID: #{selectedUser.id}</p>
                    <div className="flex gap-1.5 pt-0.5">
                      <Badge variant={selectedUser.role === 'admin' ? 'rose' : selectedUser.role === 'creator' ? 'pink' : 'slate'} size="sm">
                        {roles.find(r => r.id === selectedUser.role)?.name || selectedUser.role.toUpperCase()}
                      </Badge>
                      <Badge variant={selectedUser.status === 'active' ? 'emerald' : selectedUser.status === 'suspended' ? 'amber' : 'rose'} size="sm">
                        {selectedUser.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setUserModalTab('overview')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      userModalTab === 'overview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setUserModalTab('activity')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      userModalTab === 'activity' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Activity History
                  </button>
                  <button
                    onClick={() => setUserModalTab('content')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      userModalTab === 'content' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Content & Stats
                  </button>
                </div>
              </div>

              {/* Tab 1: Overview & Moderation Controls */}
              {userModalTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2">
                      <Mail size={14} className="text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-[#71717A] font-bold uppercase">Email Address</p>
                        <p className="font-extrabold text-[#18181B] truncate">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2">
                      <Calendar size={14} className="text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-[#71717A] font-bold uppercase">Registration Date</p>
                        <p className="font-extrabold text-[#18181B] truncate">{selectedUser.joined}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2 col-span-2">
                      <CreditCard size={14} className="text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-[#71717A] font-bold uppercase">Available Wallet Balance</p>
                        <p className="font-extrabold text-[#18181B] truncate">{selectedUser.balance}</p>
                      </div>
                    </div>
                  </div>

                  {/* Role Assignment Control */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <h5 className="text-[10px] font-black uppercase text-[#71717A] tracking-wider">Modify Role Assignment</h5>
                    <p className="text-[10px] text-[#A1A1AA]">
                      Assigning a new role dynamically updates permission access across the platform.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <select
                        value={selectedUser.role}
                        onChange={(e) => handleRequestIndividualRoleChange(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#18181B] focus:outline-none focus:border-indigo-500 font-bold cursor-pointer flex-1"
                      >
                        {roles
                          .filter(r => r.status === 'active')
                          .map(r => (
                            <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Moderation Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <h5 className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-wider">Account Moderation Toggles</h5>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVerified(selectedUser.id)}
                      >
                        {selectedUser.verified ? 'Remove Verification Badge' : 'Grant Verified Creator Badge'}
                      </Button>

                      {selectedUser.status === 'active' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => handleUpdateSingleStatus(selectedUser.id, 'suspended')}
                          >
                            Suspend Account
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUpdateSingleStatus(selectedUser.id, 'banned')}
                          >
                            Ban User Account
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateSingleStatus(selectedUser.id, 'active')}
                        >
                          Restore Active Account
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Activity History Ledger */}
              {userModalTab === 'activity' && (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase text-[#71717A] tracking-wider">User Activity History & Event Log</h5>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {getUserActivityLogs(selectedUser).map((act) => (
                      <div key={act.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0 mt-0.5">
                          <Activity size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[#18181B]">{act.action}</p>
                            <span className="text-[10px] font-mono text-slate-400">{act.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{act.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Content & Stats */}
              {userModalTab === 'content' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <FileText size={16} className="mx-auto text-indigo-600 mb-1" />
                      <p className="text-lg font-black text-slate-900">14</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Posts</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <Film size={16} className="mx-auto text-pink-600 mb-1" />
                      <p className="text-lg font-black text-slate-900">6</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Reels</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <Users size={16} className="mx-auto text-emerald-600 mb-1" />
                      <p className="text-lg font-black text-slate-900">1,240</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Followers</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <CreditCard size={16} className="mx-auto text-amber-600 mb-1" />
                      <p className="text-lg font-black text-slate-900">42</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Subscribers</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                    <p className="font-bold text-slate-800">Database Synchronization</p>
                    <p className="text-slate-600 text-[11px]">
                      This account is synchronized with PostgreSQL table <code>public.profiles</code> (id: <code>{selectedUser.id}</code>).
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Modal: Confirm Bulk Role Assignment */}
        <Modal
          isOpen={isBulkRoleConfirmOpen}
          onClose={() => setIsBulkRoleConfirmOpen(false)}
          title="Confirm Bulk Role Assignment"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
              <ShieldAlert className="shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-extrabold">Warning: Administrative Scoping Action</p>
                <p className="mt-1 leading-snug">
                  You are about to assign the role <strong>"{roles.find(r => r.id === bulkTargetRoleId)?.name}"</strong> to <strong>{selectedUserIds.length} users</strong>. This will override their current authorization permissions.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsBulkRoleConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={executeBulkRoleChange}>
                Confirm Bulk Re-Scope
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Confirm Bulk Delete */}
        <Modal
          isOpen={isBulkDeleteConfirmOpen}
          onClose={() => setIsBulkDeleteConfirmOpen(false)}
          title="Confirm Bulk User Deletion"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertTriangle className="shrink-0 mt-0.5 text-rose-600" size={16} />
              <div>
                <p className="font-extrabold">Irreversible Action: Permanent Profile Purge</p>
                <p className="mt-1 leading-snug">
                  You are about to permanently delete <strong>{selectedUserIds.length} user accounts</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsBulkDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={executeBulkDelete}>
                Delete User Profiles
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Confirm Individual Role Change */}
        <Modal
          isOpen={isIndividualRoleConfirmOpen}
          onClose={() => setIsIndividualRoleConfirmOpen(false)}
          title="Confirm Role Change"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
              <AlertTriangle className="shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-extrabold">Confirm Credential Scoping Change</p>
                <p className="mt-1 leading-snug">
                  Changing user role for <strong>{selectedUser?.name}</strong> to <strong>"{roles.find(r => r.id === editUserRoleId)?.name}"</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsIndividualRoleConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={executeIndividualRoleChange}>
                Confirm Role Change
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
