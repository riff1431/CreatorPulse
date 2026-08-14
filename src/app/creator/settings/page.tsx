'use client';

import React, { useState } from 'react';
import { Settings, Save, User, CreditCard, Lock, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { MediaUploader } from '@/components/ui/MediaUploader';

export default function CreatorSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'payouts' | 'privacy'>('profile');
  const { showToast } = useToast();

  // Form states
  const [displayName, setDisplayName] = useState('Sarah Jenkins');
  const [headline, setHeadline] = useState('UI/UX Design Systems & Design Engineering Masterclasses');
  const [bio, setBio] = useState('Senior Product Designer & Educator. Teaching UI/UX design engineering.');
  const [category, setCategory] = useState('Art & Design');
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [accountDetails, setAccountDetails] = useState('Chase Bank •••• 4920');
  const [whoCanMessage, setWhoCanMessage] = useState('subscribers');
  const [whoCanFollow, setWhoCanFollow] = useState('everyone');
  const [isSaving, setIsSaving] = useState(false);
  
  // Media states
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Creator Studio settings updated successfully!', 'success');
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B] tracking-tight">Creator Settings</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Manage your creator studio details, withdrawal accounts, and visual identity.</p>
      </div>

      {/* Tabs list bar */}
      <div className="flex border-b border-[#F3DCE8] gap-1 text-xs">
        {(['profile', 'payouts', 'privacy'] as const).map((tab) => {
          const Icon = {
            profile: User,
            payouts: CreditCard,
            privacy: Lock,
          }[tab];
          const label = {
            profile: 'Profile Details',
            payouts: 'Payout Accounts',
            privacy: 'Privacy & Safety',
          }[tab];

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-3 font-bold border-b-2 transition-all cursor-pointer -mb-[2px] ${
                activeTab === tab
                  ? 'border-[#EC4899] text-[#BE185D]'
                  : 'border-transparent text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Details Tab */}
      {activeTab === 'profile' && (
        <Card className="p-6 space-y-5 transition-all duration-300 animate-scale-up">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80">
            <User size={16} className="text-[#EC4899]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B]">Creator Profile Identity</h3>
          </div>

          {/* Visual Identity Uploaders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MediaUploader
              label="Profile Avatar Picture"
              description="Upload your square profile avatar."
              folder="avatars"
              accept="images"
              aspectRatio="square"
              value={avatarUrl}
              onChange={(url) => setAvatarUrl(url)}
            />

            <MediaUploader
              label="Studio Cover Banner"
              description="Header banner on your public creator profile."
              folder="covers"
              accept="images"
              aspectRatio="banner"
              value={coverUrl}
              onChange={(url) => setCoverUrl(url)}
            />
          </div>

          <div className="space-y-4 text-xs font-semibold pt-2 border-t border-[#F3DCE8]/60">
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
              />
            </div>
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Creator Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
              />
            </div>
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Biography Profile Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] resize-none font-medium"
              />
            </div>
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Creator Primary Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
              >
                <option value="Art & Design">Art & Design</option>
                <option value="Education & Tech">Education & Tech</option>
                <option value="Music & Audio">Music & Audio</option>
                <option value="Gaming & Esports">Gaming & Esports</option>
                <option value="Fitness & Health">Fitness & Health</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3DCE8]/80 flex justify-end">
            <Button variant="primary" size="md" onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={15} />}>
              Save Profile Details
            </Button>
          </div>
        </Card>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <Card className="p-6 space-y-5 transition-all duration-300 animate-scale-up">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80">
            <CreditCard size={16} className="text-[#EC4899]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B]">Withdrawal & Payment Settings</h3>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Preferred Payout Channel</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('bank')}
                  className={`p-3.5 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                    payoutMethod === 'bank'
                      ? 'border-[#EC4899] bg-[#FFF1F7] text-[#BE185D]'
                      : 'border-[#F3DCE8] text-[#71717A] hover:border-[#EC4899]/50'
                  }`}
                >
                  <p className="text-xs font-black">Direct Bank Wire / ACH</p>
                  <p className="text-[10px] font-medium text-[#A1A1AA] mt-0.5">2-3 business days</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethod('paypal')}
                  className={`p-3.5 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                    payoutMethod === 'paypal'
                      ? 'border-[#EC4899] bg-[#FFF1F7] text-[#BE185D]'
                      : 'border-[#F3DCE8] text-[#71717A] hover:border-[#EC4899]/50'
                  }`}
                >
                  <p className="text-xs font-black">PayPal Direct</p>
                  <p className="text-[10px] font-medium text-[#A1A1AA] mt-0.5">Instant transfer</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Destination Account Details</label>
              <input
                type="text"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                placeholder="Account number or PayPal email address"
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3DCE8]/80 flex justify-end">
            <Button variant="primary" size="md" onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={15} />}>
              Save Payout Settings
            </Button>
          </div>
        </Card>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <Card className="p-6 space-y-5 transition-all duration-300 animate-scale-up">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80">
            <Lock size={16} className="text-[#EC4899]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B]">Audience & Privacy Rules</h3>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Who can send you direct messages?</label>
              <select
                value={whoCanMessage}
                onChange={(e) => setWhoCanMessage(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
              >
                <option value="everyone">Everyone (Public Fan Inquiries)</option>
                <option value="subscribers">Subscribers & VIP Patrons Only</option>
                <option value="nobody">Direct Messages Disabled</option>
              </select>
            </div>

            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Who can follow your public updates?</label>
              <select
                value={whoCanFollow}
                onChange={(e) => setWhoCanFollow(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
              >
                <option value="everyone">Everyone</option>
                <option value="approved">Require Follow Approval</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3DCE8]/80 flex justify-end">
            <Button variant="primary" size="md" onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={15} />}>
              Save Privacy Settings
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
