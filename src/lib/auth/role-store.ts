import { RolePermissionSet, UserProfile } from '../supabase/store';
import { logAuditEvent } from '../extensions/package-installer';

export interface DynamicRole {
  id: string;
  name: string;
  description: string;
  permissions: RolePermissionSet;
  is_builtin: boolean;
  status: 'active' | 'inactive';
  created_at: string;
}

const STORAGE_ROLES_KEY = 'creatorpulse_dynamic_roles';
const STORAGE_USERS_KEY = 'creatorpulse_users_directory';
const STORAGE_DEFAULT_SIGNUP_ROLE_KEY = 'creatorpulse_default_signup_role';

const DEFAULT_ROLES: DynamicRole[] = [
  {
    id: 'admin',
    name: 'Super Admin',
    description: 'Full administrative control over users, content, roles, and settings.',
    permissions: {
      view_dashboard: true,
      manage_users: true,
      manage_roles: true,
      manage_content: true,
      moderate_reports: true,
      manage_settings: true,
      view_audit_logs: true
    },
    is_builtin: true,
    status: 'active',
    created_at: '2026-01-01'
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'Can manage posts, reels, and stories, and view standard dashboard statistics.',
    permissions: {
      view_dashboard: true,
      manage_users: false,
      manage_roles: false,
      manage_content: true,
      moderate_reports: false,
      manage_settings: false,
      view_audit_logs: false
    },
    is_builtin: true,
    status: 'active',
    created_at: '2026-01-01'
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Standard viewer account that can follow and subscribe to creators.',
    permissions: {
      view_dashboard: false,
      manage_users: false,
      manage_roles: false,
      manage_content: false,
      moderate_reports: false,
      manage_settings: false,
      view_audit_logs: false
    },
    is_builtin: true,
    status: 'active',
    created_at: '2026-01-01'
  }
];

export const getRoles = (): DynamicRole[] => {
  if (typeof window === 'undefined') return DEFAULT_ROLES;
  try {
    const raw = localStorage.getItem(STORAGE_ROLES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(DEFAULT_ROLES));
      return DEFAULT_ROLES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_ROLES;
  }
};

export const getRoleById = (id: string): DynamicRole | undefined => {
  return getRoles().find((r) => r.id === id);
};

export const saveRole = (
  role: Omit<DynamicRole, 'created_at'>,
  actor: { fullName: string; role: string }
): { success: boolean; error?: string } => {
  if (typeof window === 'undefined') return { success: false, error: 'Server context' };

  try {
    const roles = getRoles();
    const existing = roles.find((r) => r.id === role.id);

    // Prevent privilege escalation or modifying built-in names
    if (existing) {
      if (existing.is_builtin) {
        // Builtin roles can only have permissions updated (and admin is fully locked)
        if (existing.id === 'admin') {
          return { success: false, error: 'The Super Admin role permissions are fully locked to prevent self-lockout.' };
        }
        role.name = existing.name; // Cannot rename
      }

      // Safeguard: Check self-lockout
      // If the actor is editing their own role, prevent deactivating it or removing permissions they need
      if (actor.role === role.id) {
        if (role.status === 'inactive') {
          return { success: false, error: 'Self-lockout protection: You cannot deactivate your own active role.' };
        }
        if (!role.permissions.manage_roles) {
          return { success: false, error: 'Self-lockout protection: You cannot remove "Manage Roles" permission from your own active role.' };
        }
      }
    }

    const newRole: DynamicRole = {
      ...role,
      created_at: existing ? existing.created_at : new Date().toISOString().split('T')[0]
    };

    const updated = existing
      ? roles.map((r) => (r.id === role.id ? newRole : r))
      : [...roles, newRole];

    localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(updated));

    // Audit Log
    logAuditEvent({
      action: existing ? 'PLUGIN_CONFIG_SAVED' : 'PLUGIN_INSTALLED', // reusing existing ledger category keys
      entityType: 'system',
      entityName: `Role: ${role.name}`,
      details: existing
        ? `Updated role details and permissions for "${role.name}"`
        : `Created new custom role "${role.name}"`,
      user: actor.fullName,
      role: actor.role,
      severity: 'success'
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to save role' };
  }
};

export const deleteRole = (
  roleId: string,
  actor: { fullName: string; role: string }
): { success: boolean; error?: string } => {
  if (typeof window === 'undefined') return { success: false, error: 'Server context' };

  try {
    const roles = getRoles();
    const roleToDelete = roles.find((r) => r.id === roleId);

    if (!roleToDelete) {
      return { success: false, error: 'Role not found' };
    }

    if (roleToDelete.is_builtin) {
      return { success: false, error: 'Protected role: Built-in roles cannot be deleted.' };
    }

    if (actor.role === roleId) {
      return { success: false, error: 'Self-lockout protection: You cannot delete your own active role.' };
    }

    // Check usage
    const usage = getRoleUsageCounts();
    if ((usage[roleId] || 0) > 0) {
      return { success: false, error: `Role is in use by ${usage[roleId]} users. Reassign users before deleting.` };
    }

    const updated = roles.filter((r) => r.id !== roleId);
    localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(updated));

    // Audit Log
    logAuditEvent({
      action: 'THEME_DELETED', // reusing generic delete key
      entityType: 'system',
      entityName: `Role: ${roleToDelete.name}`,
      details: `Deleted custom role "${roleToDelete.name}" (${roleId})`,
      user: actor.fullName,
      role: actor.role,
      severity: 'warning'
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to delete role' };
  }
};

export const getDefaultSignupRole = (): string => {
  if (typeof window === 'undefined') return 'member';
  return localStorage.getItem(STORAGE_DEFAULT_SIGNUP_ROLE_KEY) || 'member';
};

export const setDefaultSignupRole = (
  roleId: string,
  actor: { fullName: string; role: string }
): { success: boolean; error?: string } => {
  if (typeof window === 'undefined') return { success: false, error: 'Server context' };

  const roles = getRoles();
  const target = roles.find((r) => r.id === roleId);
  if (!target) {
    return { success: false, error: 'Role not found' };
  }

  if (target.status === 'inactive') {
    return { success: false, error: 'Cannot set inactive role as default signup role.' };
  }

  localStorage.setItem(STORAGE_DEFAULT_SIGNUP_ROLE_KEY, roleId);

  // Audit log
  logAuditEvent({
    action: 'PLUGIN_CONFIG_SAVED',
    entityType: 'system',
    entityName: 'Default Role Settings',
    details: `Set default user signup role to "${target.name}" (${roleId})`,
    user: actor.fullName,
    role: actor.role,
    severity: 'info'
  });

  return { success: true };
};

// Users directory store
export interface UserDirectoryItem {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  verified: boolean;
  status: 'active' | 'suspended' | 'banned';
  joined: string;
  balance: string;
}

const DEFAULT_USERS: UserDirectoryItem[] = [
  { id: '1', name: 'Alex Vance', username: 'alexvance', email: 'alex@community.io', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', role: 'member', verified: false, status: 'active', joined: '2026-01-15', balance: '$45.00' },
  { id: '2', name: 'Sarah Jenkins', username: 'sarahdesign', email: 'sarah@designcode.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'creator', verified: true, status: 'active', joined: '2025-11-10', balance: '$4,850.00' },
  { id: '3', name: 'Marcus Vance', username: 'marcuscode', email: 'marcus@codemaster.io', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', role: 'creator', verified: true, status: 'active', joined: '2025-08-20', balance: '$8,200.00' },
  { id: '4', name: 'Elena Rostova', username: 'elena_admin', email: 'admin@creatorpulse.com', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', role: 'admin', verified: true, status: 'active', joined: '2025-01-01', balance: '$0.00' },
  { id: '5', name: 'Jordan Lee', username: 'jordanlee', email: 'jordan@email.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'member', verified: false, status: 'active', joined: '2026-03-22', balance: '$120.00' },
  { id: '6', name: 'Mia Wong', username: 'miawong', email: 'mia@email.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', role: 'member', verified: false, status: 'suspended', joined: '2026-05-01', balance: '$5.00' },
  { id: '7', name: 'crypto_bot_99', username: 'crypto_bot_99', email: 'bot99@spam.io', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150', role: 'member', verified: false, status: 'banned', joined: '2026-07-10', balance: '$0.00' }
];

export const getUsers = (): UserDirectoryItem[] => {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      // Sync with any dynamically registered users
      const dynamicUsersRaw = localStorage.getItem('creatorpulse_registered_users');
      let merged = [...DEFAULT_USERS];
      if (dynamicUsersRaw) {
        const dynamicUsers: Record<string, any> = JSON.parse(dynamicUsersRaw);
        Object.values(dynamicUsers).forEach((du) => {
          if (!merged.find((u) => u.email === du.email)) {
            merged.push({
              id: du.id,
              name: du.fullName,
              username: du.username,
              email: du.email,
              avatar: du.avatarUrl,
              role: du.role || 'member',
              verified: du.isVerified || false,
              status: 'active',
              joined: du.createdAt || new Date().toISOString().split('T')[0],
              balance: '$0.00'
            });
          }
        });
      }
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(merged));
      return merged;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_USERS;
  }
};

export const getRoleUsageCounts = (): Record<string, number> => {
  const users = getUsers();
  const counts: Record<string, number> = {};
  users.forEach((u) => {
    counts[u.role] = (counts[u.role] || 0) + 1;
  });
  return counts;
};

export const saveUsers = (users: UserDirectoryItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

  // Sync back to registered users database so login works
  try {
    const dynamicUsersRaw = localStorage.getItem('creatorpulse_registered_users');
    const dynamicUsers: Record<string, any> = dynamicUsersRaw ? JSON.parse(dynamicUsersRaw) : {};
    users.forEach((u) => {
      // Find key matching user email
      const matchedKey = Object.keys(dynamicUsers).find((k) => k.toLowerCase() === u.email.toLowerCase());
      if (matchedKey) {
        dynamicUsers[matchedKey].role = u.role;
        dynamicUsers[matchedKey].isVerified = u.verified;
      }
    });
    localStorage.setItem('creatorpulse_registered_users', JSON.stringify(dynamicUsers));
  } catch (e) {
    console.error('Failed to sync users back to auth db', e);
  }
};

export const assignRoleToUsers = (
  userIds: string[],
  roleId: string,
  actor: { id: string; fullName: string; role: string }
): { success: boolean; error?: string } => {
  if (typeof window === 'undefined') return { success: false, error: 'Server context' };

  try {
    const users = getUsers();
    const roles = getRoles();
    const targetRole = roles.find((r) => r.id === roleId);

    if (!targetRole) {
      return { success: false, error: 'Target role not found' };
    }

    if (targetRole.status === 'inactive') {
      return { success: false, error: 'Cannot assign an inactive role.' };
    }

    // Privilege Escalation Prevention
    // Ensure the actor has permissions at least equal to the role they are granting.
    // For example, only a user with manage_roles can assign admin or other custom roles.
    const actorRoleObj = roles.find((r) => r.id === actor.role);
    if (!actorRoleObj) {
      return { success: false, error: 'Actor role not found' };
    }

    // If target role has permissions the actor role does not, throw error (Privilege Escalation)
    if (roleId === 'admin' && actor.role !== 'admin') {
      return { success: false, error: 'Privilege Escalation protection: Only Super Admins can assign the Super Admin role.' };
    }

    // Verify self-lockout
    // If the actor is in the target user list, and the new role is NOT admin, check if they are demoting themselves
    if (userIds.includes(actor.id) && roleId !== 'admin') {
      // Find if they are the last active admin
      const admins = users.filter((u) => u.role === 'admin' && u.status === 'active');
      if (admins.length <= 1 && admins.find((u) => u.id === actor.id)) {
        return { success: false, error: 'Self-lockout protection: You are the last active Super Admin. Demoting yourself is blocked.' };
      }
    }

    const updated = users.map((u) => {
      if (userIds.includes(u.id)) {
        // Trigger audit logs for each user
        logAuditEvent({
          action: 'PLUGIN_ACTIVATED', // Reusing activated key
          entityType: 'system',
          entityName: `User: @${u.username}`,
          details: `Changed role of user "${u.name}" (@${u.username}) from "${u.role}" to "${roleId}"`,
          user: actor.fullName,
          role: actor.role,
          severity: roleId === 'admin' ? 'warning' : 'info'
        });
        return { ...u, role: roleId };
      }
      return u;
    });

    saveUsers(updated);
    window.dispatchEvent(new CustomEvent('creatorpulse_users_updated'));
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to assign role' };
  }
};

export const updateUserStatusBulk = (
  userIds: string[],
  nextStatus: 'active' | 'suspended' | 'banned',
  actor: { fullName: string; role: string }
): { success: boolean; error?: string } => {
  if (typeof window === 'undefined') return { success: false, error: 'Server context' };

  try {
    const users = getUsers();
    const updated = users.map((u) => {
      if (userIds.includes(u.id)) {
        logAuditEvent({
          action: 'PLUGIN_CONFIG_SAVED',
          entityType: 'system',
          entityName: `User: @${u.username}`,
          details: `Updated account status for "${u.name}" to ${nextStatus.toUpperCase()}`,
          user: actor.fullName,
          role: actor.role,
          severity: nextStatus === 'banned' ? 'error' : 'warning'
        });
        return { ...u, status: nextStatus };
      }
      return u;
    });

    saveUsers(updated);
    window.dispatchEvent(new CustomEvent('creatorpulse_users_updated'));
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to update user statuses' };
  }
};

export const deleteUsersBulk = (
  userIds: string[],
  actor: { fullName: string; role: string }
): { success: boolean; error?: string } => {
  if (typeof window === 'undefined') return { success: false, error: 'Server context' };

  try {
    const users = getUsers();
    const targetUsers = users.filter((u) => userIds.includes(u.id));

    // Prevent deleting admins
    const containsAdmin = targetUsers.some((u) => u.role === 'admin');
    if (containsAdmin) {
      return { success: false, error: 'Protected Accounts: Cannot delete accounts with Super Admin privileges.' };
    }

    const updated = users.filter((u) => !userIds.includes(u.id));

    targetUsers.forEach((u) => {
      logAuditEvent({
        action: 'PLUGIN_DELETED',
        entityType: 'system',
        entityName: `User: @${u.username}`,
        details: `Deleted user profile "${u.name}" (${u.email})`,
        user: actor.fullName,
        role: actor.role,
        severity: 'warning'
      });
    });

    saveUsers(updated);
    window.dispatchEvent(new CustomEvent('creatorpulse_users_updated'));
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to delete users' };
  }
};

export interface UserActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: 'auth' | 'content' | 'role' | 'financial' | 'system';
}

export const getUserActivityLogs = (user: UserDirectoryItem): UserActivityItem[] => {
  return [
    {
      id: 'act-1',
      action: 'Account Registration',
      description: `Registered user account @${user.username} with email ${user.email}`,
      timestamp: `${user.joined} 09:12:00`,
      type: 'auth'
    },
    {
      id: 'act-2',
      action: 'Authentication Login',
      description: `User authenticated successfully from IP 192.168.1.100`,
      timestamp: '2026-08-14 18:22:40',
      type: 'auth'
    },
    {
      id: 'act-3',
      action: 'Role Assignment',
      description: `Current role authorization set to "${user.role.toUpperCase()}"`,
      timestamp: '2026-08-14 12:00:00',
      type: 'role'
    },
    {
      id: 'act-4',
      action: 'Wallet Transaction',
      description: `Available balance balance reported as ${user.balance}`,
      timestamp: '2026-08-13 15:45:10',
      type: 'financial'
    },
    {
      id: 'act-5',
      action: 'Content Activity',
      description: `Published platform posts and interactive content`,
      timestamp: '2026-08-12 11:30:00',
      type: 'content'
    }
  ];
};

