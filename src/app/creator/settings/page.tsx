'use client';

import React, { useState } from 'react';
import { Settings, Save, User, CreditCard, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { MediaLibraryModal } from '@/components/admin/MediaLibraryModal';

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
  
  // Media picker states
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Creator Studio settings updated successfully!', 'success');
    }, 8000); // 800ms simulation
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

          <div className="flex items-center gap-4">
            <Avatar src={avatarUrl} alt="Sarah Jenkins" size="lg" isVerified={true} />
            <div className="space-y-1 text-xs">
              <Button variant="outline" size="sm" onClick={() => setIsAvatarPickerOpen(true)}>Change Avatar</Button>
              <p className="text-[10px] text-[#A1A1AA] font-bold">JPG, PNG or WebP. Max size limit 2MB.</p>
            </div>
          </div>

          <MediaLibraryModal
            isOpen={isAvatarPickerOpen}
            onClose={() => setIsAvatarPickerOpen(false)}
            allowedTypes={['image/*']}
            maxFiles={1}
            initialFolder="avatars"
            onSelect={(selected) => {
              const file = selected[0];
              if (file) {
                setAvatarUrl(file.url);
                showToast('Avatar selected from media library!', 'success');
              }
            }}
          />

          <div className="space-y-4 text-xs font-semibold">
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
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-[#18181B] focus:outline-none font-medium"
              >
                <option>Art & Design</option>
                <option>Education & Tech</option>
                <option>Music & Sound</option>
                <option>Fitness & Wellness</option>
                <option>Food & Cooking</option>
                <option>Business & Finance</option>
                <option>Gaming</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Payout Tab */}
      {activeTab === 'payouts' && (
        <Card className="p-6 space-y-5 transition-all duration-300 animate-scale-up">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80">
            <CreditCard size={16} className="text-emerald-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B]">Disbursement Accounts</h3>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Preferred Payout Method</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-[#18181B] focus:outline-none font-medium"
              >
                <option value="bank">Direct Bank Wire (ACH/SWIFT)</option>
                <option value="stripe">Stripe Connect Account</option>
                <option value="paypal">PayPal Merchant Account</option>
              </select>
            </div>
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Routing/Account Details</label>
              <input
                type="text"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2.5 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <Card className="p-6 space-y-5 transition-all duration-300 animate-scale-up">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F3DCE8]/80">
            <Lock size={16} className="text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#18181B]">Security & Permissions</h3>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Who can send you messages?</label>
              <select
                value={whoCanMessage}
                onChange={(e) => setWhoCanMessage(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-[#18181B] focus:outline-none font-medium"
              >
                <option value="everyone">Everyone (Open DMs)</option>
                <option value="followers">Followers Only</option>
                <option value="subscribers">Subscribers Only</option>
                <option value="nobody">Disable Messaging</option>
              </select>
            </div>
            <div>
              <label className="block text-[#71717A] mb-1 font-bold">Profile Subscription Access</label>
              <select
                value={whoCanFollow}
                onChange={(e) => setWhoCanFollow(e.target.value)}
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2.5 text-[#18181B] focus:outline-none font-medium"
              >
                <option value="everyone">Everyone can follow</option>
                <option value="approved">Approved members only (Private Profile)</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Save Settings footer */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="md"
          isLoading={isSaving}
          leftIcon={<Save size={15} />}
          onClick={handleSave}
        >
          Publish Changes
        </Button>
      </div>
    </div>
  );
}
