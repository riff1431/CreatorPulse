'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Calendar, CreditCard, Eye, AlertTriangle, ShieldAlert, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { Avatar } from '@/components/admin/ui/Avatar';
import { Modal } from '@/components/admin/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/auth-context';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { getUsers, getRoles, assignRoleToUsers, saveUsers, UserDirectoryItem, DynamicRole } from '@/lib/auth/role-store';

export default function AdminUsersPage() {
  const { user: actor, role: actorRole } = useAuth();
  const [users, setUsers] = useState<UserDirectoryItem[]>([]);
  const [roles, setRoles] = useState<DynamicRole[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDirectoryItem | null>(null);
  
  // Selection state for bulk actions
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkTargetRoleId, setBulkTargetRoleId] = useState('');
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  
  // Individual role edit state
  const [editUserRoleId, setEditUserRoleId] = useState('');
  const [isIndividualConfirmOpen, setIsIndividualConfirmOpen] = useState(false);

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

  const handleUpdateStatus = (id: string, nextStatus: 'active' | 'suspended' | 'banned') => {
    const updated = users.map((u) => {
      if (u.id === id) {
        showToast(`User status marked as ${nextStatus.toUpperCase()}.`, 'info');
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    saveUsers(updated);
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser({ ...selectedUser, status: nextStatus });
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

  // Toggle selection for a single user
  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  // Select/Deselect all filtered users
  const handleSelectAll = (filteredList: UserDirectoryItem[]) => {
    const filteredIds = filteredList.map(u => u.id);
    const allSelected = filteredIds.every(id => selectedUserIds.includes(id));
    
    if (allSelected) {
      // Remove all filtered ids
      setSelectedUserIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Add missing filtered ids
      setSelectedUserIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Trigger individual role change flow
  const handleRequestIndividualRoleChange = (roleId: string) => {
    if (!selectedUser) return;
    setEditUserRoleId(roleId);
    setIsIndividualConfirmOpen(true);
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
      setIsIndividualConfirmOpen(false);
      
      // Update selectedUser reference
      const updatedUser = getUsers().find(u => u.id === selectedUser.id);
      if (updatedUser) setSelectedUser(updatedUser);
      loadData();
    } else {
      showToast(res.error || 'Failed to assign role.', 'error');
      setIsIndividualConfirmOpen(false);
    }
  };

  // Trigger bulk role change flow
  const handleRequestBulkRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkTargetRoleId) {
      showToast('Please select a target role.', 'error');
      return;
    }
    setIsBulkConfirmOpen(true);
  };

  const executeBulkRoleChange = () => {
    if (!actor) return;
    const res = assignRoleToUsers(selectedUserIds, bulkTargetRoleId, {
      id: actor.id,
      fullName: actor.fullName,
      role: actorRole
    });

    if (res.success) {
      showToast(`Successfully changed roles for ${selectedUserIds.length} users!`, 'success');
      setSelectedUserIds([]);
      setBulkTargetRoleId('');
      setIsBulkConfirmOpen(false);
      loadData();
    } else {
      showToast(res.error || 'Bulk role assignment failed.', 'error');
      setIsBulkConfirmOpen(false);
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
    <RoleGuard
      requiredPermission="manage_users"
      fallbackTitle="Security Clearance Required"
      fallbackMessage="You do not have permission to view or manage platform user directories."
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="text-indigo-600" size={22} />
              <h1 className="text-xl font-black text-[#18181B] tracking-tight">Platform User Registry</h1>
            </div>
            <p className="text-xs text-[#71717A] mt-1 font-medium">Verify credentials, toggle verification badges, moderate accounts, and assign dynamic permissions.</p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={13} />} onClick={loadData}>
            Sync Registry
          </Button>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-4 border border-slate-200 rounded-2xl">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={13} />
              <input
                type="text"
                placeholder="Search by name, username, or email..."
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
            </div>
          </div>

          {/* Bulk Actions Form (Shows up when 1+ users checked) */}
          {selectedUserIds.length > 0 && (
            <form onSubmit={handleRequestBulkRoleChange} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-lg">
              <span className="text-[10px] text-indigo-400 font-extrabold uppercase whitespace-nowrap">
                {selectedUserIds.length} Selected
              </span>
              <select
                value={bulkTargetRoleId}
                onChange={(e) => setBulkTargetRoleId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">Bulk Assign Role...</option>
                {roles
                  .filter(r => r.status === 'active')
                  .map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
              </select>
              <Button type="submit" variant="primary" size="sm" className="py-1 text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600">
                Apply
              </Button>
            </form>
          )}
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden p-0 border-slate-200/80 shadow-sm">
          <div className="overflow-x-auto relative">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[#71717A] font-bold">
                  <th className="py-3 px-4 w-10">
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
                  <th className="py-3.5 px-2">User</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Joined</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Balance</th>
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
                            <p className="font-bold text-[#18181B]">{u.name}</p>
                            <p className="text-[10px] text-[#71717A]">@{u.username}</p>
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
                        <Button variant="ghost" size="sm" leftIcon={<Eye size={13} />} onClick={() => setSelectedUser(u)}>
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#71717A] font-bold">
                      No users match your active filter settings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: User Inspection & Role Adjustment */}
        <Modal
          isOpen={selectedUser !== null}
          onClose={() => setSelectedUser(null)}
          title={selectedUser ? `Inspect User Profile: ${selectedUser.name}` : ''}
        >
          {selectedUser && (
            <div className="space-y-5">
              {/* Modal Avatar details */}
              <div className="flex items-center gap-4 pb-3 border-b border-slate-200">
                <Avatar src={selectedUser.avatar} alt={selectedUser.name} size="lg" isVerified={selectedUser.verified} />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-[#18181B] tracking-tight">{selectedUser.name}</h4>
                  <p className="text-[10px] text-[#71717A] font-bold">@{selectedUser.username} • User ID: #{selectedUser.id}</p>
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

              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2">
                  <Mail size={14} className="text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#71717A] font-bold">Email Address</p>
                    <p className="font-extrabold text-[#18181B] truncate">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#71717A] font-bold">Member Since</p>
                    <p className="font-extrabold text-[#18181B] truncate">{selectedUser.joined}</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2 col-span-2">
                  <CreditCard size={14} className="text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-[#71717A] font-bold">Wallet Balance</p>
                    <p className="font-extrabold text-[#18181B] truncate">{selectedUser.balance} Available</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Role Modification Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h5 className="text-[10px] font-black uppercase text-[#71717A] tracking-wider">Modify User Authorization Role</h5>
                <p className="text-[10px] text-[#A1A1AA]">
                  Updating this role instantly updates the RLS clearances of this user profile.
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

              {/* Moderation Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h5 className="text-[10px] font-black uppercase text-[#A1A1AA] tracking-wider">Account Moderation Actions</h5>
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

        {/* Modal: Confirm Bulk Role Change */}
        <Modal
          isOpen={isBulkConfirmOpen}
          onClose={() => setIsBulkConfirmOpen(false)}
          title="Confirm Bulk Role Assignment"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
              <ShieldAlert className="shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-extrabold">Warning: Administrative Scoping Action</p>
                <p className="mt-1 leading-snug">
                  You are about to assign the role <strong>"{roles.find(r => r.id === bulkTargetRoleId)?.name}"</strong> to <strong>{selectedUserIds.length} users</strong>. This will override their current authorization groups and immediately grant/revoke permissions.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#71717A] leading-relaxed">
              If elevating user scopes to Super Admin (<code>admin</code>), verify that all targeted accounts are fully trusted. The ledger will record this administrative operation.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsBulkConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={executeBulkRoleChange}>
                Confirm & Re-Scope Users
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Confirm Individual Role Change */}
        <Modal
          isOpen={isIndividualConfirmOpen}
          onClose={() => setIsIndividualConfirmOpen(false)}
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

            <p className="text-xs text-[#71717A] leading-relaxed">
              This action will instantly modify authorization states, menu layouts, and backend clearances for this account.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsIndividualConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={executeIndividualRoleChange}>
                Confirm Change
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
