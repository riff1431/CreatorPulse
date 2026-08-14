'use client';

import React, { useState } from 'react';
import { Settings, Save, User, CreditCard, Lock, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export default function CreatorSettingsPage() {
  const [displayName, setDisplayName] = useState('Sarah Jenkins');
  const [headline, setHeadline] = useState('UI/UX Design Systems & Design Engineering Masterclasses');
  const [bio, setBio] = useState('Senior Product Designer & Educator. Teaching UI/UX design engineering.');
  const [category, setCategory] = useState('Art & Design');
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [accountDetails, setAccountDetails] = useState('Chase Bank •••• 4920');
  const [whoCanMessage, setWhoCanMessage] = useState('subscribers');
  const [whoCanFollow, setWhoCanFollow] = useState('everyone');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="text-slate-400" size={22} />
          <h1 className="text-xl font-black text-white">Creator Settings</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Manage your profile, payout methods, and privacy settings.</p>
      </div>

      {/* Profile Settings */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <User size={16} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">Profile Settings</h3>
        </div>

        <div className="flex items-center gap-4">
          <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Sarah Jenkins" size="lg" isVerified={true} />
          <div className="space-y-1">
            <Button variant="outline" size="sm">Change Avatar</Button>
            <p className="text-[10px] text-slate-500">JPG, PNG, GIF. Max 2MB.</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Display Name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Headline</label>
            <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none" />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none">
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

      {/* Payout Settings */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">Payout Settings</h3>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Preferred Payout Method</label>
            <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none">
              <option value="bank">Bank Transfer</option>
              <option value="stripe">Stripe Direct</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Account Details</label>
            <input type="text" value={accountDetails} onChange={(e) => setAccountDetails(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500/50" />
          </div>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Privacy Settings</h3>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Who can send you messages?</label>
            <select value={whoCanMessage} onChange={(e) => setWhoCanMessage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none">
              <option value="everyone">Everyone</option>
              <option value="followers">Followers Only</option>
              <option value="subscribers">Subscribers Only</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Who can follow you?</label>
            <select value={whoCanFollow} onChange={(e) => setWhoCanFollow(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none">
              <option value="everyone">Everyone</option>
              <option value="approved">Approved Only (Require Approval)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button variant="primary" size="md" leftIcon={saved ? <Shield size={14} /> : <Save size={14} />} onClick={handleSave}>
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
