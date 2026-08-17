'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Users, UserCheck, UserPlus, UserX, Search, MessageSquare, 
  Shield, Lock, Unlock, Sparkles, CheckCircle2, ChevronRight, 
  ArrowUpRight, AlertCircle, X, Check, Filter, SlidersHorizontal, 
  RefreshCw, Globe, ShieldCheck, Heart, UserMinus
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Switch } from '../components/Switch';
import { useFollow } from '@/lib/follow/use-follow';
import { useAuth } from '@/lib/auth/auth-context';
import { ConnectionUser, SuggestedCreator } from '@/lib/follow/follow-store';

export function ConnectionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get('tab') as 'followers' | 'following' | 'requests' | 'suggestions' | 'mutuals') || 'followers';

  const { user } = useAuth();
  const activeUserId = user?.id || 'user-member';

  const {
    currentUserId,
    isPrivate,
    counts,
    follow,
    unfollow,
    removeFollower,
    acceptRequest,
    declineRequest,
    cancelRequest,
    setPrivacy,
    getFollowers,
    getFollowing,
    getPendingRequests,
    getMutualConnections,
    getSuggestedCreators,
  } = useFollow(activeUserId);

  const [activeTab, setActiveTab] = useState<'followers' | 'following' | 'requests' | 'suggestions' | 'mutuals'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'creator' | 'member' | 'subscriber'>('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'name'>('recent');

  // Confirmation Modals State
  const [userToRemove, setUserToRemove] = useState<ConnectionUser | null>(null);
  const [userToUnfollow, setUserToUnfollow] = useState<ConnectionUser | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- DATA FETCHING & FILTERING ---
  const rawFollowers = getFollowers(searchQuery);
  const rawFollowing = getFollowing(searchQuery);
  const { incoming: pendingIncoming, outgoing: pendingOutgoing } = getPendingRequests();
  const rawMutuals = getMutualConnections();
  const rawSuggestions = getSuggestedCreators();

  // Filter Followers
  const filteredFollowers = useMemo(() => {
    let list = [...rawFollowers];
    if (roleFilter === 'creator') list = list.filter((u) => u.role === 'creator');
    if (roleFilter === 'member') list = list.filter((u) => u.role === 'member');
    if (roleFilter === 'subscriber') list = list.filter((u) => u.isSubscriber);

    if (sortOrder === 'name') {
      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }
    return list;
  }, [rawFollowers, roleFilter, sortOrder]);

  // Filter Following
  const filteredFollowing = useMemo(() => {
    let list = [...rawFollowing];
    if (roleFilter === 'creator') list = list.filter((u) => u.role === 'creator');
    if (roleFilter === 'member') list = list.filter((u) => u.role === 'member');
    if (roleFilter === 'subscriber') list = list.filter((u) => u.isSubscriber);

    if (sortOrder === 'name') {
      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }
    return list;
  }, [rawFollowing, roleFilter, sortOrder]);

  // Filter Suggestions
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return rawSuggestions;
    const q = searchQuery.toLowerCase();
    return rawSuggestions.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.bio.toLowerCase().includes(q)
    );
  }, [rawSuggestions, searchQuery]);

  // Handlers
  const handleRemoveFollowerConfirm = () => {
    if (userToRemove) {
      removeFollower(userToRemove.id);
      showToast(`Removed @${userToRemove.username} from your followers.`, 'info');
      setUserToRemove(null);
    }
  };

  const handleUnfollowConfirm = () => {
    if (userToUnfollow) {
      unfollow(userToUnfollow.id);
      showToast(`Unfollowed @${userToUnfollow.username}.`, 'info');
      setUserToUnfollow(null);
    }
  };

  const handleAcceptRequest = (reqUser: ConnectionUser) => {
    acceptRequest(reqUser.id);
    showToast(`Accepted follow request from @${reqUser.username}!`, 'success');
  };

  const handleDeclineRequest = (reqUser: ConnectionUser) => {
    declineRequest(reqUser.id);
    showToast(`Declined request from @${reqUser.username}.`, 'info');
  };

  const handleCancelOutgoing = (reqUser: ConnectionUser) => {
    cancelRequest(reqUser.id);
    showToast(`Cancelled follow request to @${reqUser.username}.`, 'info');
  };

  const handleTogglePrivacy = (checked: boolean) => {
    setPrivacy(checked);
    showToast(
      checked
        ? 'Account set to Private. New followers must request approval.'
        : 'Account set to Public. Anyone can follow your profile.',
      'info'
    );
  };

  const handleQuickFollow = (targetId: string, username: string) => {
    const res = follow(targetId);
    if (res === 'pending') {
      showToast(`Follow request sent to @${username}.`, 'info');
    } else {
      showToast(`Now following @${username}!`, 'success');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">

        {/* 1. Header Banner & Profile Summary */}
        <Card className="p-6 overflow-hidden relative border border-[var(--color-border)] shadow-sm shadow-[#EC4899]/5 bg-gradient-to-br from-white via-[#FFF9FC] to-[#FFF0F6] dark:from-[#180E24] dark:via-[#1A0E28] dark:to-[#241130]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={user?.fullName || 'Active User'}
                size="lg"
                isVerified={user?.isVerified}
                className="border-2 border-pink-500/30 ring-4 ring-pink-500/10 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
                    {user?.fullName || 'Alex Vance'}
                  </h1>
                  <Badge variant="pink" size="sm">
                    {user?.role === 'creator' ? 'Creator Account' : 'Fan Account'}
                  </Badge>
                  {isPrivate && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded-full">
                      <Lock size={12} /> Private Profile
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-primary)] font-bold">@{user?.username || 'alexvance'}</p>
                <p className="text-xs text-[var(--color-text-secondary)] font-medium max-w-xl">
                  Manage your connections, followers, follow requests, and discover recommended creators.
                </p>
              </div>
            </div>

            {/* Quick Privacy Toggle */}
            <div className="flex items-center gap-3 bg-white/80 dark:bg-[#12081C]/80 backdrop-blur-md p-3.5 rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] shrink-0 self-start md:self-auto">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-primary)]">
                  {isPrivate ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} className="text-emerald-500" />}
                  Private Account
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
                  {isPrivate ? 'Approval required for new follows' : 'Anyone can follow your profile'}
                </p>
              </div>
              <Switch checked={isPrivate} onChange={handleTogglePrivacy} />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#F3DCE8]/80 dark:border-[#3A2A4C]/80">
            <button
              onClick={() => setActiveTab('followers')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === 'followers'
                  ? 'bg-[#FCE7F3]/70 dark:bg-[#381A2B] border-[#EC4899] text-[#BE185D] dark:text-[#F472B6]'
                  : 'bg-white/60 dark:bg-[#160B22]/60 border-[var(--color-border)] hover:bg-white dark:hover:bg-[#1A0E28]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[var(--color-text-secondary)]">Followers</span>
                <Users size={14} className="text-[#EC4899]" />
              </div>
              <p className="text-xl font-black text-[var(--color-text-primary)]">
                {counts.followersCount.toLocaleString()}
              </p>
            </button>

            <button
              onClick={() => setActiveTab('following')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === 'following'
                  ? 'bg-[#FCE7F3]/70 dark:bg-[#381A2B] border-[#EC4899] text-[#BE185D] dark:text-[#F472B6]'
                  : 'bg-white/60 dark:bg-[#160B22]/60 border-[var(--color-border)] hover:bg-white dark:hover:bg-[#1A0E28]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[var(--color-text-secondary)]">Following</span>
                <UserCheck size={14} className="text-[#EC4899]" />
              </div>
              <p className="text-xl font-black text-[var(--color-text-primary)]">
                {counts.followingCount.toLocaleString()}
              </p>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                activeTab === 'requests'
                  ? 'bg-[#FCE7F3]/70 dark:bg-[#381A2B] border-[#EC4899] text-[#BE185D] dark:text-[#F472B6]'
                  : 'bg-white/60 dark:bg-[#160B22]/60 border-[var(--color-border)] hover:bg-white dark:hover:bg-[#1A0E28]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[var(--color-text-secondary)]">Follow Requests</span>
                <Shield size={14} className="text-amber-500" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-black text-[var(--color-text-primary)]">
                  {counts.pendingIncomingCount}
                </p>
                {counts.pendingIncomingCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-500 text-white rounded-full animate-pulse">
                    New
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('mutuals')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === 'mutuals'
                  ? 'bg-[#FCE7F3]/70 dark:bg-[#381A2B] border-[#EC4899] text-[#BE185D] dark:text-[#F472B6]'
                  : 'bg-white/60 dark:bg-[#160B22]/60 border-[var(--color-border)] hover:bg-white dark:hover:bg-[#1A0E28]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[var(--color-text-secondary)]">Mutual Connections</span>
                <Sparkles size={14} className="text-emerald-500" />
              </div>
              <p className="text-xl font-black text-[var(--color-text-primary)]">
                {counts.mutualCount}
              </p>
            </button>
          </div>
        </Card>

        {/* 2. Main Navigation Tabs */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none border-b border-[var(--color-border)] pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('followers')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'followers'
                  ? 'bg-[#EC4899] text-white shadow-md shadow-pink-500/20'
                  : 'bg-white dark:bg-[#1A0E28] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              <Users size={14} />
              Followers
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'followers' ? 'bg-white/20 text-white' : 'bg-pink-100 text-[#EC4899] dark:bg-pink-950 dark:text-pink-300'}`}>
                {counts.followersCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'following'
                  ? 'bg-[#EC4899] text-white shadow-md shadow-pink-500/20'
                  : 'bg-white dark:bg-[#1A0E28] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              <UserCheck size={14} />
              Following
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'following' ? 'bg-white/20 text-white' : 'bg-pink-100 text-[#EC4899] dark:bg-pink-950 dark:text-pink-300'}`}>
                {counts.followingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-[#EC4899] text-white shadow-md shadow-pink-500/20'
                  : 'bg-white dark:bg-[#1A0E28] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              <Shield size={14} />
              Follow Requests
              {counts.pendingIncomingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-extrabold animate-pulse">
                  {counts.pendingIncomingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'suggestions'
                  ? 'bg-[#EC4899] text-white shadow-md shadow-pink-500/20'
                  : 'bg-white dark:bg-[#1A0E28] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              <Sparkles size={14} />
              Suggested Creators
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                Hot
              </span>
            </button>

            <button
              onClick={() => setActiveTab('mutuals')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'mutuals'
                  ? 'bg-[#EC4899] text-white shadow-md shadow-pink-500/20'
                  : 'bg-white dark:bg-[#1A0E28] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
              }`}
            >
              <UserCheck size={14} />
              Mutuals ({counts.mutualCount})
            </button>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        {(activeTab === 'followers' || activeTab === 'following' || activeTab === 'suggestions') && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#160B22] p-3 rounded-2xl border border-[var(--color-border)] shadow-xs">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={15} />
              <input
                type="text"
                placeholder={
                  activeTab === 'followers'
                    ? 'Search followers by name, username, bio...'
                    : activeTab === 'following'
                    ? 'Search followed users or creators...'
                    : 'Search suggested creators by category...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[#A1A1AA] focus:outline-none focus:border-[#EC4899] font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#18181B]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {activeTab !== 'suggestions' && (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#EC4899]"
                >
                  <option value="all">All Account Types</option>
                  <option value="creator">Creators Only</option>
                  <option value="member">Fans / Members Only</option>
                  <option value="subscriber">Active VIP Subscribers</option>
                </select>
              )}

              {activeTab !== 'suggestions' && (
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[#EC4899]"
                >
                  <option value="recent">Sort by: Most Recent</option>
                  <option value="name">Sort by: Name (A-Z)</option>
                </select>
              )}
            </div>
          </div>
        )}

        {/* 4. TAB CONTENTS */}

        {/* --- TAB 1: FOLLOWERS --- */}
        {activeTab === 'followers' && (
          <Card className="p-0 overflow-hidden border border-[var(--color-border)]">
            {filteredFollowers.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Users size={36} className="mx-auto text-[#A1A1AA]" />
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">No followers found</h3>
                <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                  {searchQuery
                    ? `No followers matching "${searchQuery}". Try adjusting your search query.`
                    : 'You do not have any followers yet. Share your profile link to grow your community!'}
                </p>
                {searchQuery && (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] text-left">
                      <th className="py-3.5 px-4 font-bold">User</th>
                      <th className="py-3.5 px-4 font-bold">Relationship</th>
                      <th className="py-3.5 px-4 font-bold hidden md:table-cell">Category / Bio</th>
                      <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Followed</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {filteredFollowers.map((f) => (
                      <tr key={f.id} className="hover:bg-[#FFF9FC] dark:hover:bg-[#1A0E28] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={f.avatarUrl} alt={f.fullName} size="md" isVerified={f.isVerified} />
                            <div>
                              <Link
                                href={f.role === 'creator' ? `/c/${f.username}` : '#'}
                                className="font-bold text-[var(--color-text-primary)] hover:text-[#EC4899] transition-colors flex items-center gap-1.5"
                              >
                                {f.fullName}
                                {f.isVerified && <ShieldCheck size={13} className="text-emerald-500" />}
                              </Link>
                              <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">@{f.username}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            {f.isMutual ? (
                              <Badge variant="pink" size="sm">
                                <Sparkles size={11} /> Mutual Follow
                              </Badge>
                            ) : (
                              <Badge variant="slate" size="sm">
                                Follows You
                              </Badge>
                            )}
                            {f.isSubscriber && (
                              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200">
                                VIP Subscriber
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 hidden md:table-cell max-w-xs">
                          <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1 font-medium">
                            {f.bio || 'Community member'}
                          </p>
                          {f.category && (
                            <span className="text-[9px] font-bold text-[#EC4899] uppercase tracking-wide">
                              {f.category}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[#A1A1AA] hidden sm:table-cell font-medium">
                          {f.followedAt || 'Recently'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/messages?user=${f.username}`}>
                              <Button variant="ghost" size="sm" leftIcon={<MessageSquare size={13} />}>
                                Message
                              </Button>
                            </Link>

                            {!f.isMutual && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleQuickFollow(f.id, f.username)}
                                leftIcon={<UserPlus size={13} />}
                              >
                                Follow Back
                              </Button>
                            )}

                            <button
                              onClick={() => setUserToRemove(f)}
                              title="Remove Follower"
                              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                            >
                              <UserMinus size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* --- TAB 2: FOLLOWING --- */}
        {activeTab === 'following' && (
          <Card className="p-0 overflow-hidden border border-[var(--color-border)]">
            {filteredFollowing.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <UserCheck size={36} className="mx-auto text-[#A1A1AA]" />
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">Not following anyone yet</h3>
                <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                  {searchQuery
                    ? `No users matching "${searchQuery}".`
                    : 'Explore creators and community members to follow their latest posts and exclusive drops.'}
                </p>
                <Button variant="primary" size="sm" onClick={() => setActiveTab('suggestions')}>
                  Discover Creators
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] text-left">
                      <th className="py-3.5 px-4 font-bold">User / Creator</th>
                      <th className="py-3.5 px-4 font-bold">Relationship</th>
                      <th className="py-3.5 px-4 font-bold hidden md:table-cell">Bio & Category</th>
                      <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Followed</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {filteredFollowing.map((f) => (
                      <tr key={f.id} className="hover:bg-[#FFF9FC] dark:hover:bg-[#1A0E28] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={f.avatarUrl} alt={f.fullName} size="md" isVerified={f.isVerified} />
                            <div>
                              <Link
                                href={f.role === 'creator' ? `/c/${f.username}` : '#'}
                                className="font-bold text-[var(--color-text-primary)] hover:text-[#EC4899] transition-colors flex items-center gap-1.5"
                              >
                                {f.fullName}
                                {f.isVerified && <ShieldCheck size={13} className="text-emerald-500" />}
                              </Link>
                              <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">@{f.username}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            {f.isMutual ? (
                              <Badge variant="pink" size="sm">
                                <Sparkles size={11} /> Mutual Follow
                              </Badge>
                            ) : (
                              <Badge variant="emerald" size="sm">
                                Following
                              </Badge>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 hidden md:table-cell max-w-xs">
                          <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1 font-medium">
                            {f.bio || 'Creator on CreatorPulse'}
                          </p>
                          {f.category && (
                            <span className="text-[9px] font-bold text-[#EC4899] uppercase tracking-wide">
                              {f.category}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[#A1A1AA] hidden sm:table-cell font-medium">
                          {f.followedAt || 'Recently'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/messages?user=${f.username}`}>
                              <Button variant="ghost" size="sm" leftIcon={<MessageSquare size={13} />}>
                                Message
                              </Button>
                            </Link>

                            {f.role === 'creator' && (
                              <Link href={`/c/${f.username}`}>
                                <Button variant="outline" size="sm">
                                  View Profile
                                </Button>
                              </Link>
                            )}

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setUserToUnfollow(f)}
                              leftIcon={<UserX size={13} className="text-rose-500" />}
                            >
                              Unfollow
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* --- TAB 3: FOLLOW REQUESTS --- */}
        {activeTab === 'requests' && (
          <div className="space-y-6">

            {/* Section 1: Incoming Requests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[var(--color-text-primary)] flex items-center gap-2">
                  <Shield size={16} className="text-amber-500" />
                  Incoming Follow Requests ({pendingIncoming.length})
                </h3>
                {isPrivate && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Private Mode Active — Only approved requests can see your updates
                  </span>
                )}
              </div>

              {pendingIncoming.length === 0 ? (
                <Card className="p-6 text-center text-xs text-[var(--color-text-secondary)] font-medium">
                  No pending incoming follow requests.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingIncoming.map((req) => (
                    <Card key={req.id} className="p-4 border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={req.avatarUrl} alt={req.fullName} size="md" isVerified={req.isVerified} />
                          <div>
                            <p className="font-bold text-xs text-[var(--color-text-primary)]">{req.fullName}</p>
                            <p className="text-[10px] text-[var(--color-text-secondary)]">@{req.username}</p>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                              Requested {req.requestedAt}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAcceptRequest(req)}
                            leftIcon={<Check size={13} />}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeclineRequest(req)}
                            leftIcon={<X size={13} />}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Outgoing Pending Requests */}
            <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
              <h3 className="text-sm font-extrabold text-[var(--color-text-primary)] flex items-center gap-2">
                <Lock size={16} className="text-[#EC4899]" />
                Sent Pending Requests ({pendingOutgoing.length})
              </h3>

              {pendingOutgoing.length === 0 ? (
                <Card className="p-6 text-center text-xs text-[var(--color-text-secondary)] font-medium">
                  You have no pending outgoing follow requests.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingOutgoing.map((req) => (
                    <Card key={req.id} className="p-4 border border-[var(--color-border)]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={req.avatarUrl} alt={req.fullName} size="md" isVerified={req.isVerified} />
                          <div>
                            <p className="font-bold text-xs text-[var(--color-text-primary)]">{req.fullName}</p>
                            <p className="text-[10px] text-[var(--color-text-secondary)]">@{req.username}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                              <Lock size={11} /> Awaiting Creator Approval
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelOutgoing(req)}
                          leftIcon={<X size={13} />}
                        >
                          Cancel Request
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- TAB 4: SUGGESTED CREATORS --- */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[var(--color-text-primary)]">Recommended Creators</h3>
                <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                  Hand-picked creators tailored to your interests and mutual connections.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuggestions.map((sc) => (
                <Card key={sc.id} className="p-5 flex flex-col justify-between space-y-4 border border-[var(--color-border)] hover:border-[#EC4899] transition-all group">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={sc.avatarUrl} alt={sc.fullName} size="lg" isVerified={sc.isVerified} />
                        <div>
                          <Link href={`/c/${sc.username}`} className="font-extrabold text-sm text-[var(--color-text-primary)] group-hover:text-[#EC4899] transition-colors flex items-center gap-1">
                            {sc.fullName}
                            {sc.isVerified && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}
                          </Link>
                          <p className="text-xs text-[var(--color-primary)] font-bold">@{sc.username}</p>
                        </div>
                      </div>
                      <Badge variant="pink" size="sm">{sc.category}</Badge>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)] line-clamp-1">{sc.headline}</p>
                      <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 mt-1 font-medium">{sc.bio}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[10px] text-[var(--color-text-secondary)] font-bold flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#EC4899] shrink-0" />
                      <span>{sc.reason}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[var(--color-text-secondary)] block font-medium">Followers</span>
                      <span className="text-xs font-black text-[var(--color-text-primary)]">
                        {sc.followerCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/c/${sc.username}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleQuickFollow(sc.id, sc.username)}
                        leftIcon={<UserPlus size={13} />}
                      >
                        Follow
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: MUTUAL CONNECTIONS --- */}
        {activeTab === 'mutuals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[var(--color-text-primary)]">Mutual Connections</h3>
                <p className="text-xs text-[var(--color-text-secondary)] font-medium">
                  Users and creators who follow you and whom you follow back.
                </p>
              </div>
            </div>

            {rawMutuals.length === 0 ? (
              <Card className="p-12 text-center space-y-3">
                <Sparkles size={36} className="mx-auto text-[#A1A1AA]" />
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">No mutual connections yet</h3>
                <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                  When a user follows you and you follow them back, they will appear in your mutual connections circle.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rawMutuals.map((m) => (
                  <Card key={m.id} className="p-4 border border-pink-200 dark:border-pink-950/60 bg-gradient-to-br from-white to-[#FFF9FC] dark:from-[#180E24] dark:to-[#1F0F30]">
                    <div className="flex items-center gap-3">
                      <Avatar src={m.avatarUrl} alt={m.fullName} size="lg" isVerified={m.isVerified} />
                      <div className="space-y-0.5">
                        <Link href={m.role === 'creator' ? `/c/${m.username}` : '#'} className="font-extrabold text-xs text-[var(--color-text-primary)] hover:text-[#EC4899] flex items-center gap-1">
                          {m.fullName}
                          {m.isVerified && <ShieldCheck size={13} className="text-emerald-500" />}
                        </Link>
                        <p className="text-[10px] text-[var(--color-primary)] font-bold">@{m.username}</p>
                        <Badge variant="pink" size="sm">
                          <Sparkles size={10} /> Mutual Friend
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                      <p className="text-[10px] text-[var(--color-text-secondary)] font-medium line-clamp-1">
                        {m.bio || 'Active Member'}
                      </p>
                      <Link href={`/messages?user=${m.username}`}>
                        <Button variant="ghost" size="sm" leftIcon={<MessageSquare size={13} />}>
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- CONFIRMATION MODAL: REMOVE FOLLOWER --- */}
      {userToRemove && (
        <Modal
          isOpen={Boolean(userToRemove)}
          onClose={() => setUserToRemove(null)}
          title="Remove Follower"
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
              <Avatar src={userToRemove.avatarUrl} alt={userToRemove.fullName} size="md" />
              <div>
                <p className="font-bold text-xs text-[var(--color-text-primary)]">{userToRemove.fullName}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)]">@{userToRemove.username}</p>
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">
              Are you sure you want to remove <strong className="text-[var(--color-text-primary)]">@{userToRemove.username}</strong> from your followers list? They will no longer follow your updates unless they request to follow again.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setUserToRemove(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleRemoveFollowerConfirm}>
                Remove Follower
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- CONFIRMATION MODAL: UNFOLLOW USER --- */}
      {userToUnfollow && (
        <Modal
          isOpen={Boolean(userToUnfollow)}
          onClose={() => setUserToUnfollow(null)}
          title="Unfollow User"
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)]">
              <Avatar src={userToUnfollow.avatarUrl} alt={userToUnfollow.fullName} size="md" />
              <div>
                <p className="font-bold text-xs text-[var(--color-text-primary)]">{userToUnfollow.fullName}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)]">@{userToUnfollow.username}</p>
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">
              Are you sure you want to unfollow <strong className="text-[var(--color-text-primary)]">@{userToUnfollow.username}</strong>? You will stop receiving their public and follower-only updates in your Home Feed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setUserToUnfollow(null)}>
                Cancel
              </Button>
              <Button variant="secondary" size="sm" onClick={handleUnfollowConfirm}>
                Unfollow
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#18181B] dark:bg-white text-white dark:text-[#18181B] shadow-2xl animate-in fade-in slide-in-from-bottom-3 text-xs font-bold">
          <Sparkles size={16} className="text-[#EC4899]" />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-[#A1A1AA] hover:text-white dark:hover:text-[#18181B]">
            <X size={14} />
          </button>
        </div>
      )}
    </MainLayout>
  );
}
