'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Camera, Mail, Shield, Check, Save, Sparkles, X, 
  Key, RefreshCw, Link as LinkIcon, Upload, CheckCircle2, AlertCircle, Info, Lock
} from 'lucide-react';
import { Modal } from '@/components/admin/ui/Modal';
import { Avatar } from '@/components/admin/ui/Avatar';
import { Button } from '@/components/admin/ui/Button';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/Toast';
import { MediaUploader } from '@/components/ui/MediaUploader';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  { id: 'admin-1', label: 'Chief Admin', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
  { id: 'admin-2', label: 'Tech Lead', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { id: 'admin-3', label: 'Product Manager', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'admin-4', label: 'Architect', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
  { id: 'admin-5', label: 'Security Specialist', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'admin-6', label: 'Operations Lead', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, resetPassword } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setCustomAvatarInput(user.avatarUrl || '');
    }
  }, [user, isOpen]);

  const handleRandomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}`;
    setAvatarUrl(newAvatar);
    setCustomAvatarInput(newAvatar);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast({ title: 'Validation Error', message: 'Full name is required.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase().replace(/\s+/g, '_'),
        email: email.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl || user?.avatarUrl,
      });

      if (res.success) {
        addToast({
          title: 'Profile Updated!',
          message: 'Your profile information and avatar have been saved successfully.',
          type: 'success',
        });
        onClose();
      } else {
        addToast({
          title: 'Update Failed',
          message: res.error || 'Failed to update profile.',
          type: 'error',
        });
      }
    } catch (err) {
      addToast({
        title: 'Error',
        message: 'An unexpected error occurred while saving profile.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await resetPassword(newPassword);
      if (res.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        addToast({
          title: 'Password Changed!',
          message: 'Your account password has been updated successfully.',
          type: 'success',
        });
      } else {
        setPasswordError(res.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError('An error occurred while updating password.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile Settings">
      <div className="space-y-5">
        {/* User Card Top Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-4 text-white shadow-md">
          <div className="absolute right-0 top-0 opacity-10 blur-xl w-32 h-32 bg-indigo-400 rounded-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('avatar')}>
              <Avatar src={avatarUrl || user?.avatarUrl} alt={fullName || 'User'} size="lg" className="border-2 border-white/20 shadow-lg" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={16} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">{fullName || user?.fullName || 'User Profile'}</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-extrabold uppercase tracking-wider">
                  {user?.role === 'super_admin' ? 'Super Admin' : user?.role || 'Admin'}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium">@{username || user?.username || 'admin'} • {email || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <User size={14} />
            <span>Basic Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'avatar'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Camera size={14} />
            <span>Avatar & Branding</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Shield size={14} />
            <span>Security & Auth</span>
          </button>
        </div>

        {/* TAB 1: BASIC PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Chief Super Admin"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username Handle <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="username"
                    className="w-full pl-7 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@domain.com"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bio & Administrator Notes
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Brief summary of your admin profile or system privileges..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} icon={<Save size={14} />}>
                Save Profile
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: AVATAR SELECTION & PRESETS */}
        {activeTab === 'avatar' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800">Current Avatar Preview</p>
                <button
                  type="button"
                  onClick={handleRandomizeAvatar}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Randomize Avatar</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Avatar src={avatarUrl} alt="Avatar Preview" size="lg" className="border-2 border-indigo-500 shadow-md" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{avatarUrl || 'Default Avatar'}</p>
                  <p className="text-[10px] text-slate-500">Live preview synchronized across topbar, sidebar, & admin logs.</p>
                </div>
              </div>
            </div>

            {/* Upload or Custom URL */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Upload New Avatar Image
              </label>
              <MediaUploader
                value={avatarUrl}
                onChange={(url) => {
                  setAvatarUrl(url);
                  setCustomAvatarInput(url);
                }}
                folder="avatars"
                label="Drop custom avatar image"
                description="PNG, JPG, SVG or WebP up to 5MB"
                aspectRatio="square"
                showMediaLibraryButton={true}
              />
            </div>

            {/* Presets Gallery */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Select from Curated Presets
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(preset.url);
                      setCustomAvatarInput(preset.url);
                    }}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      avatarUrl === preset.url
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Avatar src={preset.url} alt={preset.label} size="md" />
                    <span className="text-[9px] font-bold text-slate-600 truncate w-full text-center">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveProfile}
                isLoading={isSaving}
                icon={<Check size={14} />}
              >
                Apply Avatar
              </Button>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-900">
              <Lock size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Password & Credential Security</p>
                <p className="text-[11px] text-indigo-700/90 leading-tight mt-0.5">
                  Update your admin account password to ensure platform protection. Minimum 6 characters required.
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
                <AlertCircle size={14} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Password updated successfully!</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} icon={<Key size={14} />}>
                Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
