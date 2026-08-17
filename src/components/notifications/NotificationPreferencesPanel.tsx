'use client';

import React from 'react';
import { 
  Bell, Mail, Shield, UserPlus, MessageSquare, HeartHandshake, 
  Sparkles, DollarSign, Clock, Save, RefreshCw, Check, CheckCircle2, 
  Moon, Zap, Sliders, AlertCircle
} from 'lucide-react';
import { Switch } from '@themes/default-theme/components/Switch';
import { useNotificationPreferences, UserNotificationPreferences } from '@/lib/notifications/notification-preferences-context';
import { useAuth } from '@/lib/auth/auth-context';

export const NotificationPreferencesPanel: React.FC<{ isCreatorView?: boolean }> = ({ isCreatorView }) => {
  const { role } = useAuth();
  const {
    preferences,
    isSaving,
    savedSuccess,
    updateCategoryPref,
    updateMetaPref,
    toggleAllChannel,
    resetToDefaults,
    savePreferences,
  } = useNotificationPreferences();

  const isCreator = isCreatorView || role === 'creator' || role === 'admin' || role === 'super_admin';

  const categories = [
    {
      key: 'followers' as const,
      title: isCreator ? 'New Followers & Subscribers' : 'Creator Followers & Subscriptions',
      description: isCreator ? 'Alert when a fan follows your profile or subscribes to a VIP tier.' : 'Updates when creators you follow publish new public profiles.',
      icon: UserPlus,
      color: 'text-pink-500 bg-pink-100 dark:bg-pink-950/40',
    },
    {
      key: 'comments' as const,
      title: 'Comments, Replies & Mentions',
      description: 'Alert when someone comments on your post, replies to your comment, or mentions you.',
      icon: MessageSquare,
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-950/40',
    },
    {
      key: 'messages' as const,
      title: 'Direct Messages & Priority Chat',
      description: 'Notifications for private messages, chat requests, and priority creator DMs.',
      icon: MessageSquare,
      color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-950/40',
    },
    {
      key: 'memberships' as const,
      title: 'Memberships & VIP Tier Changes',
      description: isCreator ? 'Alerts on subscriber tier upgrades, renewals, and cancellations.' : 'Receipts and renewal reminders for your active creator subscriptions.',
      icon: HeartHandshake,
      color: 'text-rose-500 bg-rose-100 dark:bg-rose-950/40',
    },
    {
      key: 'creatorUpdates' as const,
      title: 'Creator Posts & Exclusive Content Drops',
      description: 'Instant notification when subscribed creators post new exclusive media or go live.',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-100 dark:bg-amber-950/40',
    },
    {
      key: 'payments' as const,
      title: isCreator ? 'Fan Tips, Earnings & Payouts' : 'Payment Receipts & Wallet Activity',
      description: isCreator ? 'Alert when you receive a fan tip, milestone payout, or weekly transfer.' : 'Receipts for purchases, tip confirmations, and wallet balance updates.',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950/40',
    },
    {
      key: 'security' as const,
      title: 'Security & Account Alerts',
      description: 'Critical notifications for unrecognized logins, password resets, and 2FA changes.',
      icon: Shield,
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-950/40',
    },
  ];

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#150D1E]/95 border border-[#F3DCE8]/90 dark:border-[#3A2A4C]/90 shadow-lg shadow-pink-500/5 space-y-7 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3DCE8] dark:border-[#3A2A4C] pb-5">
        <div>
          <h3 className="text-lg font-black text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-[#EC4899]">
              <Bell size={20} />
            </div>
            Notification Preferences ({isCreator ? 'Creator Mode' : 'Fan Mode'})
          </h3>
          <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] mt-1 font-medium">
            Customize which events trigger in-app bell alerts and email notifications.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => toggleAllChannel('inApp', true)}
            className="px-3 py-1.5 rounded-xl bg-[#FFF9FC] dark:bg-[#22152E] hover:bg-[#FCE7F3] text-[11px] font-bold text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] transition-all cursor-pointer"
          >
            All In-App On
          </button>
          <button
            type="button"
            onClick={() => toggleAllChannel('email', true)}
            className="px-3 py-1.5 rounded-xl bg-[#FFF9FC] dark:bg-[#22152E] hover:bg-[#FCE7F3] text-[11px] font-bold text-[#BE185D] dark:text-[#F472B6] border border-[#FBCFE8] dark:border-[#4C1D3B] transition-all cursor-pointer"
          >
            All Email On
          </button>
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-3 py-1.5 rounded-xl bg-[var(--color-surface)] text-[11px] font-bold text-[#71717A] hover:text-[#18181B] dark:text-[#D4B8D0] border border-[var(--color-border)] transition-all cursor-pointer"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Notification preferences successfully saved to your profile!</span>
        </div>
      )}

      {/* Category Preference Matrix */}
      <div className="space-y-4">
        {/* Table Column Headers */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2 bg-[#FFF9FC] dark:bg-[#22152E] rounded-2xl border border-[#F3DCE8] dark:border-[#3A2A4C] text-[11px] font-black uppercase tracking-wider text-[#A1A1AA]">
          <span>Event Category</span>
          <div className="flex items-center gap-12 pr-4">
            <span className="flex items-center gap-1.5"><Bell size={13} /> In-App</span>
            <span className="flex items-center gap-1.5"><Mail size={13} /> Email</span>
          </div>
        </div>

        {categories.map((cat) => {
          const IconComp = cat.icon;
          const pref = preferences[cat.key];

          return (
            <div 
              key={cat.key} 
              className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF9FC] to-white dark:from-[#22152E] dark:to-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] hover:border-[#FBCFE8] dark:hover:border-[#4C1D3B] transition-all space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between group"
            >
              <div className="flex items-start sm:items-center gap-3.5 flex-1 pr-4">
                <div className={`p-2.5 rounded-xl ${cat.color} group-hover:scale-105 transition-transform shrink-0 mt-0.5 sm:mt-0`}>
                  <IconComp size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#18181B] dark:text-[#FDF2F8]">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-medium leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between sm:justify-end gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F3DCE8] dark:border-[#3A2A4C]">
                <div className="flex items-center gap-2">
                  <span className="sm:hidden text-xs font-bold text-[#71717A] flex items-center gap-1"><Bell size={12} /> In-App</span>
                  <Switch
                    checked={pref.inApp}
                    onChange={(val) => updateCategoryPref(cat.key, 'inApp', val)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="sm:hidden text-xs font-bold text-[#71717A] flex items-center gap-1"><Mail size={12} /> Email</span>
                  <Switch
                    checked={pref.email}
                    onChange={(val) => updateCategoryPref(cat.key, 'email', val)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Delivery Options */}
      <div className="space-y-4 pt-4 border-t border-[#F3DCE8] dark:border-[#3A2A4C]">
        <h4 className="text-xs font-black uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
          <Sliders size={14} className="text-[#EC4899]" />
          Email Digest & Delivery Schedule
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email Digest Frequency */}
          <div className="p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-2">
            <label className="block text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]">
              Email Notification Frequency
            </label>
            <select
              value={preferences.digestFrequency}
              onChange={(e) => updateMetaPref('digestFrequency', e.target.value as UserNotificationPreferences['digestFrequency'])}
              className="w-full bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-3 py-2 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20"
            >
              <option value="instant">Instant Realtime Alerts (Recommended)</option>
              <option value="daily_digest">Daily Digest Summary (Once a day at 9 AM)</option>
              <option value="weekly_summary">Weekly Recap (Every Monday morning)</option>
            </select>
            <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">
              Control how frequently non-security emails are delivered to your inbox.
            </p>
          </div>

          {/* Quiet Hours Configuration */}
          <div className="p-4 rounded-2xl bg-[#FFF9FC] dark:bg-[#22152E] border border-[#F3DCE8] dark:border-[#3A2A4C] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#18181B] dark:text-[#FDF2F8] flex items-center gap-1.5">
                  <Moon size={14} className="text-indigo-500" />
                  Quiet Hours (Do Not Disturb)
                </p>
                <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0]">Mute push notifications during sleep schedule</p>
              </div>
              <Switch
                checked={preferences.quietHoursEnabled}
                onChange={(val) => updateMetaPref('quietHoursEnabled', val)}
              />
            </div>

            {preferences.quietHoursEnabled && (
              <div className="flex items-center gap-3 pt-1 animate-fadeIn">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-[#A1A1AA]">Start Time</span>
                  <input
                    type="time"
                    value={preferences.quietHoursStart}
                    onChange={(e) => updateMetaPref('quietHoursStart', e.target.value)}
                    className="w-full bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-[#A1A1AA]">End Time</span>
                  <input
                    type="time"
                    value={preferences.quietHoursEnd}
                    onChange={(e) => updateMetaPref('quietHoursEnd', e.target.value)}
                    className="w-full bg-white dark:bg-[#150D1E] border border-[#F3DCE8] dark:border-[#3A2A4C] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#18181B] dark:text-[#FDF2F8]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={isSaving}
          onClick={savePreferences}
          className="px-7 py-3 rounded-2xl bg-gradient-to-r from-[#EC4899] to-[#F43F5E] hover:from-[#DB2777] hover:to-[#E11D48] text-white text-sm font-black shadow-md hover:shadow-lg shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-70 hover:-translate-y-0.5 active:translate-y-0"
        >
          {isSaving ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          <span>{isSaving ? 'Saving Preferences...' : 'Save Notification Preferences'}</span>
        </button>
      </div>
    </div>
  );
};
