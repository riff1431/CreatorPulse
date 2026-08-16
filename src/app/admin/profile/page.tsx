'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Camera, Mail, Shield, Save, Key, Sparkles, RefreshCw, 
  CheckCircle2, AlertCircle, Info, Lock, Clock, ShieldCheck, 
  Check, FileText, Activity, BadgeCheck, Upload, Layers
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Avatar } from '@/components/admin/ui/Avatar';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/Toast';
import { MediaUploader } from '@/components/ui/MediaUploader';
import { AdminIcon } from '@/components/admin/ui/AdminIcon';

const AVATAR_PRESETS = [
  { id: 'admin-1', label: 'Chief Admin', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
  { id: 'admin-2', label: 'Tech Lead', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { id: 'admin-3', label: 'Product Manager', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'admin-4', label: 'Architect', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
  { id: 'admin-5', label: 'Security Specialist', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'admin-6', label: 'Operations Lead', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
];

export default function AdminProfilePage() {
  const { user, updateProfile, resetPassword } = useAuth();
  const { addToast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'security'>('profile');

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password State
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
    }
  }, [user]);

  const handleRandomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}`;
    setAvatarUrl(newAvatar);
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
          message: 'Your administrator profile and avatar have been updated successfully.',
          type: 'success',
        });
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
        message: 'An error occurred while saving changes.',
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
        setNewPassword('');
        setConfirmPassword('');
        addToast({
          title: 'Password Updated!',
          message: 'Your administrator account password has been updated successfully.',
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 opacity-15 blur-2xl w-96 h-96 bg-indigo-500 rounded-full" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('avatar')}>
              <Avatar src={avatarUrl || user?.avatarUrl} alt={fullName || 'Admin'} size="xl" className="border-4 border-white/20 shadow-2xl" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{fullName || user?.fullName || 'Chief Super Admin'}</h1>
                <BadgeCheck size={20} className="text-indigo-400 fill-indigo-400/20" />
              </div>
              <p className="text-xs sm:text-sm text-indigo-200/90 font-medium mt-0.5">
                @{username || user?.username || 'superadmin'} • {email || user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
                  {user?.role === 'super_admin' ? 'Super Administrator' : user?.role || 'Administrator'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active Session
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveProfile}
            isLoading={isSaving}
            icon={<Save size={15} />}
          >
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Sidebar Card */}
        <div className="space-y-4">
          <Card className="p-4 space-y-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Profile Navigation</h2>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AdminIcon icon={User} size="xs" variant={activeTab === 'profile' ? 'indigo' : 'neutral'} />
                  <span>Basic Profile Details</span>
                </div>
                {activeTab === 'profile' && <Check size={14} className="text-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('avatar')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'avatar'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AdminIcon icon={Camera} size="xs" variant={activeTab === 'avatar' ? 'indigo' : 'neutral'} />
                  <span>User Avatar & Presets</span>
                </div>
                {activeTab === 'avatar' && <Check size={14} className="text-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AdminIcon icon={Shield} size="xs" variant={activeTab === 'security' ? 'indigo' : 'neutral'} />
                  <span>Security & Password</span>
                </div>
                {activeTab === 'security' && <Check size={14} className="text-indigo-600" />}
              </button>
            </nav>
          </Card>

          <Card className="p-4 space-y-3 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-indigo-600" />
              <span>Privilege Summary</span>
            </h3>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>You are authenticated with full administrative rights over the platform.</p>
              <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px] text-slate-500 font-medium">
                <div className="flex justify-between">
                  <span>Role Type:</span>
                  <span className="font-bold text-slate-700">{user?.role || 'Super Admin'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Status:</span>
                  <span className="font-bold text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span className="font-bold text-slate-700">{user?.createdAt || '2025-01-01'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: BASIC PROFILE */}
          {activeTab === 'profile' && (
            <Card className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Edit Basic Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage your administrator account name, handle, email, and bio.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
                        placeholder="Chief Super Admin"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Username Handle <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full pl-8 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
                        placeholder="superadmin"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
                      placeholder="superadmin@creatorpulse.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bio / System Description
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 resize-none leading-relaxed"
                    placeholder="CreatorPulse Owner & Super Administrator."
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <Button type="submit" variant="primary" size="md" isLoading={isSaving} icon={<Save size={16} />}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 2: AVATAR MANAGEMENT */}
          {activeTab === 'avatar' && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">User Avatar & Media Branding</h2>
                <p className="text-xs text-slate-500 mt-0.5">Upload a custom profile photo, pick from presets, or generate a unique avatar.</p>
              </div>

              {/* Current Avatar Card */}
              <div className="p-4 bg-gradient-to-r from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar src={avatarUrl} alt="Avatar" size="xl" className="border-2 border-indigo-600 shadow-md" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Active Profile Avatar</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{avatarUrl}</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRandomizeAvatar}
                  icon={<RefreshCw size={14} />}
                >
                  Randomize
                </Button>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Upload Custom Avatar File
                </label>
                <MediaUploader
                  value={avatarUrl}
                  onChange={(url) => setAvatarUrl(url)}
                  folder="avatars"
                  label="Click or Drag Avatar Image Here"
                  description="Supports JPG, PNG, WebP, SVG up to 5MB"
                  aspectRatio="square"
                  showMediaLibraryButton={true}
                />
              </div>

              {/* Presets Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pick from Curated Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                        avatarUrl === preset.url
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Avatar src={preset.url} alt={preset.label} size="md" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{preset.label}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Preset Avatar</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                  icon={<Check size={16} />}
                >
                  Apply Avatar
                </Button>
              </div>
            </Card>
          )}

          {/* TAB 3: SECURITY & AUTH */}
          {activeTab === 'security' && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Security & Credentials</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage your administrator account password and security settings.</p>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <Button type="submit" variant="primary" size="md" isLoading={isSaving} icon={<Key size={16} />}>
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
