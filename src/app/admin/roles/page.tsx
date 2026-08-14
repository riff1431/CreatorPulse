'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Plus, Edit2, Trash2, CheckCircle2, XCircle, Info, Sparkles, Settings, UserCheck, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth/auth-context';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { getRoles, saveRole, deleteRole, getDefaultSignupRole, setDefaultSignupRole, getRoleUsageCounts, DynamicRole } from '@/lib/auth/role-store';
import { PERMISSION_LABELS, RolePermissionSet } from '@/lib/supabase/store';

const initialPermissions: RolePermissionSet = {
  view_dashboard: false,
  manage_users: false,
  manage_roles: false,
  manage_content: false,
  moderate_reports: false,
  manage_settings: false,
  view_audit_logs: false
};

export default function AdminRolesPage() {
  const { user, role: actorRole } = useAuth();
  const [roles, setRoles] = useState<DynamicRole[]>([]);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [defaultRole, setDefaultRole] = useState('member');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  // Form State
  const [roleId, setRoleId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleStatus, setRoleStatus] = useState<'active' | 'inactive'>('active');
  const [selectedPermissions, setSelectedPermissions] = useState<RolePermissionSet>(initialPermissions);
  const [roleToDelete, setRoleToDelete] = useState<DynamicRole | null>(null);

  const { showToast } = useToast();

  const loadData = () => {
    setRoles(getRoles());
    setUsageCounts(getRoleUsageCounts());
    setDefaultRole(getDefaultSignupRole());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('creatorpulse_users_updated', loadData);
    return () => {
      window.removeEventListener('creatorpulse_users_updated', loadData);
    };
  }, []);

  const resetForm = () => {
    setRoleId('');
    setRoleName('');
    setRoleDesc('');
    setRoleStatus('active');
    setSelectedPermissions(initialPermissions);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (r: DynamicRole) => {
    setRoleId(r.id);
    setRoleName(r.name);
    setRoleDesc(r.description);
    setRoleStatus(r.status);
    setSelectedPermissions(r.permissions);
    setIsEditModalOpen(true);
  };

  const handlePermissionToggle = (key: keyof RolePermissionSet) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleId.trim() || !roleName.trim()) {
      showToast('Role ID and Role Name are required.', 'error');
      return;
    }

    const cleanId = roleId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    // Check if ID already exists
    if (roles.find(r => r.id === cleanId)) {
      showToast(`Role with ID "${cleanId}" already exists.`, 'error');
      return;
    }

    const res = saveRole({
      id: cleanId,
      name: roleName.trim(),
      description: roleDesc.trim(),
      permissions: selectedPermissions,
      is_builtin: false,
      status: roleStatus
    }, {
      fullName: user?.fullName || 'Administrator',
      role: actorRole
    });

    if (res.success) {
      showToast(`Role "${roleName}" created successfully!`, 'success');
      setIsCreateModalOpen(false);
      loadData();
    } else {
      showToast(res.error || 'Failed to create role.', 'error');
    }
  };

  const handleEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast('Role Name is required.', 'error');
      return;
    }

    // Trigger warning/confirmation if editing role status or permissions
    const res = saveRole({
      id: roleId,
      name: roleName.trim(),
      description: roleDesc.trim(),
      permissions: selectedPermissions,
      is_builtin: roles.find(r => r.id === roleId)?.is_builtin || false,
      status: roleStatus
    }, {
      fullName: user?.fullName || 'Administrator',
      role: actorRole
    });

    if (res.success) {
      showToast(`Role "${roleName}" updated successfully!`, 'success');
      setIsEditModalOpen(false);
      loadData();
    } else {
      showToast(res.error || 'Failed to update role.', 'error');
    }
  };

  const handleDeleteRequest = (r: DynamicRole) => {
    setRoleToDelete(r);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteRole = () => {
    if (!roleToDelete) return;
    const res = deleteRole(roleToDelete.id, {
      fullName: user?.fullName || 'Administrator',
      role: actorRole
    });

    if (res.success) {
      showToast(`Role "${roleToDelete.name}" deleted successfully.`, 'success');
      setIsConfirmDeleteOpen(false);
      setRoleToDelete(null);
      loadData();
    } else {
      showToast(res.error || 'Failed to delete role.', 'error');
      setIsConfirmDeleteOpen(false);
    }
  };

  const handleSetDefaultRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const res = setDefaultSignupRole(val, {
      fullName: user?.fullName || 'Administrator',
      role: actorRole
    });

    if (res.success) {
      showToast(`Default signup role changed to ${val.toUpperCase()}.`, 'success');
      loadData();
    } else {
      showToast(res.error || 'Failed to update default role.', 'error');
    }
  };

  return (
    <RoleGuard
      requiredPermission="manage_roles"
      fallbackTitle="Security Clearance Required"
      fallbackMessage="You do not have permission to manage roles and credentials. Contact the administrator to obtain 'manage_roles' privilege."
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3DCE8] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="text-[#EC4899]" size={22} />
              <h1 className="text-xl font-black text-[#18181B] tracking-tight">Role & Permission Engine</h1>
            </div>
            <p className="text-xs text-[#71717A] mt-1 font-medium">Define custom authorization roles, set granular permission gates, and manage default signup scopes.</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={handleOpenCreateModal}
          >
            Create Custom Role
          </Button>
        </div>

        {/* Global Settings & Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 flex items-center gap-4 bg-[#FFF9FC] border-[#F3DCE8]/80 col-span-1 md:col-span-2">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-[#EC4899] shrink-0 shadow-sm border border-pink-200">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-[#18181B]">Granular Authorization Engine</h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Changes made here immediately affect RLS rules, route middleware clearances, and dynamic UI panels. Built-in system roles are protected by default to prevent lockout.
              </p>
            </div>
          </Card>

          <Card className="p-5 space-y-3 bg-white border-[#F3DCE8]/80">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#71717A]">
              <Settings size={14} className="text-[#EC4899]" />
              <span>Default Signup Role</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              Set the default role automatically assigned to new users upon registering.
            </p>
            <div className="relative">
              <select
                value={defaultRole}
                onChange={handleSetDefaultRole}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-bold shadow-xs cursor-pointer"
              >
                {roles
                  .filter((r) => r.status === 'active')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.id})
                    </option>
                  ))}
              </select>
            </div>
          </Card>
        </div>

        {/* Roles Table */}
        <Card className="p-0 overflow-hidden border-[#F3DCE8]/80">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] font-bold">
                  <th className="py-3.5 px-5">Role Information</th>
                  <th className="py-3.5 px-5">Identifier</th>
                  <th className="py-3.5 px-5">Users Count</th>
                  <th className="py-3.5 px-5">Active Permissions</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3DCE8]/60">
                {roles.map((r) => {
                  const usage = usageCounts[r.id] || 0;
                  const activePermCount = Object.values(r.permissions).filter(Boolean).length;
                  const totalPermCount = Object.keys(r.permissions).length;
                  
                  return (
                    <tr key={r.id} className="hover:bg-[#FFF9FC]/50 transition-colors">
                      <td className="py-4 px-5 max-w-sm">
                        <div>
                          <p className="font-extrabold text-[#18181B] text-sm flex items-center gap-1.5">
                            {r.name}
                            {r.is_builtin && (
                              <Badge variant="slate" size="sm">System Builtin</Badge>
                            )}
                          </p>
                          <p className="text-[11px] text-[#71717A] mt-0.5 line-clamp-1 font-medium">{r.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <code className="bg-[#FFF1F7] text-[#BE185D] px-2 py-0.5 rounded-lg border border-[#FBCFE8] font-mono text-[10px] font-bold">
                          {r.id}
                        </code>
                      </td>
                      <td className="py-4 px-5 font-black text-[#18181B]">{usage} users</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                            <div 
                              className="bg-[#EC4899] h-full rounded-full transition-all duration-300"
                              style={{ width: `${(activePermCount / totalPermCount) * 100}%` }}
                            />
                          </div>
                          <span className="font-bold text-[#71717A] text-[10px]">
                            {activePermCount} / {totalPermCount}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant={r.status === 'active' ? 'emerald' : 'slate'} size="sm">
                          {r.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-right space-x-1 whitespace-nowrap">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          leftIcon={<Edit2 size={12} />}
                          onClick={() => handleOpenEditModal(r)}
                        >
                          Permissions
                        </Button>
                        {!r.is_builtin && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            leftIcon={<Trash2 size={12} />}
                            onClick={() => handleDeleteRequest(r)}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Create Custom Role */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Custom Role"
        >
          <form onSubmit={handleCreateRole} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#71717A]">Unique Identifier (Slug)</label>
                <input
                  type="text"
                  placeholder="e.g. moderator"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[#71717A]">Role Label Name</label>
                <input
                  type="text"
                  placeholder="e.g. Content Moderator"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full bg-white border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#71717A]">Description</label>
              <textarea
                placeholder="Brief summary of duties and credentials..."
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
                rows={2}
                className="w-full bg-white border border-[#F3DCE8] rounded-xl p-3 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-[#71717A]">Granular Permissions Checklist</label>
              <div className="max-h-48 overflow-y-auto border border-[#F3DCE8] rounded-2xl divide-y divide-[#F3DCE8]/60 p-2 bg-[#FFF9FC]/50 space-y-1.5">
                {(Object.keys(PERMISSION_LABELS) as Array<keyof RolePermissionSet>).map((key) => {
                  const info = PERMISSION_LABELS[key];
                  return (
                    <label key={key} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPermissions[key]}
                        onChange={() => handlePermissionToggle(key)}
                        className="mt-0.5 accent-[#EC4899] h-3.5 w-3.5"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#18181B]">{info.title}</p>
                        <p className="text-[10px] text-[#71717A] mt-0.5 leading-snug">{info.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase text-[#71717A]">Initial Status:</label>
              <select
                value={roleStatus}
                onChange={(e) => setRoleStatus(e.target.value as 'active' | 'inactive')}
                className="bg-white border border-[#F3DCE8] rounded-xl px-2 py-1 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-bold"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#F3DCE8]">
              <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create Role
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Permissions / Details */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Role: ${roleName}`}
        >
          <form onSubmit={handleEditRole} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#71717A]">Role Label Name</label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                disabled={roles.find(r => r.id === roleId)?.is_builtin}
                className="w-full bg-white disabled:bg-slate-50 border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                required
              />
              {roles.find(r => r.id === roleId)?.is_builtin && (
                <p className="text-[9px] text-[#A1A1AA] italic">System-built roles cannot be renamed.</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-[#71717A]">Description</label>
              <textarea
                value={roleDesc}
                onChange={(e) => setRoleDesc(e.target.value)}
                rows={2}
                className="w-full bg-white border border-[#F3DCE8] rounded-xl p-3 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-[#71717A]">Granular Permissions Checklist</label>
              <div className="max-h-48 overflow-y-auto border border-[#F3DCE8] rounded-2xl divide-y divide-[#F3DCE8]/60 p-2 bg-[#FFF9FC]/50 space-y-1.5">
                {(Object.keys(PERMISSION_LABELS) as Array<keyof RolePermissionSet>).map((key) => {
                  const info = PERMISSION_LABELS[key];
                  const isDisabled = roleId === 'admin'; // admin is fully locked
                  return (
                    <label key={key} className={`flex items-start gap-2.5 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer ${isDisabled ? 'opacity-70' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedPermissions[key]}
                        onChange={() => handlePermissionToggle(key)}
                        disabled={isDisabled}
                        className="mt-0.5 accent-[#EC4899] h-3.5 w-3.5"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#18181B]">{info.title}</p>
                        <p className="text-[10px] text-[#71717A] mt-0.5 leading-snug">{info.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {roleId === 'admin' && (
                <p className="text-[9px] text-amber-600 font-bold flex items-center gap-1">
                  <ShieldAlert size={12} /> Super Admin permissions are fully locked to prevent lockouts.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase text-[#71717A]">Role Status:</label>
              <select
                value={roleStatus}
                onChange={(e) => setRoleStatus(e.target.value as 'active' | 'inactive')}
                disabled={roles.find(r => r.id === roleId)?.is_builtin}
                className="bg-white disabled:bg-slate-50 border border-[#F3DCE8] rounded-xl px-2 py-1 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-bold"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {roles.find(r => r.id === roleId)?.is_builtin && (
                <p className="text-[9px] text-[#A1A1AA] italic">System-built roles cannot be deactivated.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#F3DCE8]">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Confirm Delete */}
        <Modal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          title="Confirm Role Deletion"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertTriangle className="shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-extrabold">Warning: Critical Security Action</p>
                <p className="mt-1 leading-snug">
                  You are deleting the custom role <strong>"{roleToDelete?.name}"</strong>. This will permanently remove it from the authorization registry. This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#71717A] leading-relaxed">
              Before proceeding, please verify that no dynamic filters or middleware gates depend directly on this role slug (<code>{roleToDelete?.id}</code>).
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#F3DCE8]">
              <Button variant="outline" size="sm" onClick={() => setIsConfirmDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDeleteRole}>
                Permanently Delete Role
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </RoleGuard>
  );
}
