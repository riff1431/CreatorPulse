'use client';

import React, { useState } from 'react';
import { Settings, Save, DollarSign, Globe, Bell, Shield } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';

export default function AdminSettingsPage() {
  const [membershipFee, setMembershipFee] = useState('5');
  const [tipFee, setTipFee] = useState('5');
  const [payoutFee, setPayoutFee] = useState('1');
  const [minPayout, setMinPayout] = useState('50');
  const [platformName, setPlatformName] = useState('CreatorPulse');
  const [platformDescription, setPlatformDescription] = useState('A premium creator membership and community platform.');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [reportNotifs, setReportNotifs] = useState(true);
  const [payoutNotifs, setPayoutNotifs] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="text-indigo-600" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Platform Settings</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Configure platform fees, general settings, and admin notifications.</p>
      </div>

      {/* Platform Fees */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-[#18181B]">Platform Fees</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-[#71717A] font-semibold mb-1">Membership Commission (%)</label>
            <input type="number" value={membershipFee} onChange={(e) => setMembershipFee(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium" />
          </div>
          <div>
            <label className="block text-[#71717A] font-semibold mb-1">Tip / Support Commission (%)</label>
            <input type="number" value={tipFee} onChange={(e) => setTipFee(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium" />
          </div>
          <div>
            <label className="block text-[#71717A] font-semibold mb-1">Payout Processing Fee (%)</label>
            <input type="number" value={payoutFee} onChange={(e) => setPayoutFee(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium" />
          </div>
          <div>
            <label className="block text-[#71717A] font-semibold mb-1">Minimum Payout Amount ($)</label>
            <input type="number" value={minPayout} onChange={(e) => setMinPayout(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium" />
          </div>
        </div>
      </Card>

      {/* General Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-[#18181B]">General Settings</h3>
        </div>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[#71717A] font-semibold mb-1">Platform Name</label>
            <input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium" />
          </div>
          <div>
            <label className="block text-[#71717A] font-semibold mb-1">Platform Description</label>
            <textarea value={platformDescription} onChange={(e) => setPlatformDescription(e.target.value)} rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 resize-none font-medium" />
          </div>
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <p className="font-bold text-[#18181B]">Maintenance Mode</p>
              <p className="text-[11px] text-[#71717A]">Temporarily disable public access</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                maintenanceMode ? 'bg-[#4F46E5] justify-end' : 'bg-[#E4E4E7] justify-start'
              }`}
            >
              <div className="w-5 h-5 bg-white rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-[#18181B]">Admin Notifications</h3>
        </div>
        <div className="space-y-3 text-xs">
          {[
            { label: 'Email notifications for new signups', value: emailNotifs, setter: setEmailNotifs },
            { label: 'Email notifications for new reports', value: reportNotifs, setter: setReportNotifs },
            { label: 'Email notifications for payout requests', value: payoutNotifs, setter: setPayoutNotifs },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[#18181B] font-semibold">{item.label}</span>
              <button
                onClick={() => item.setter(!item.value)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                  item.value ? 'bg-[#4F46E5] justify-end' : 'bg-[#E4E4E7] justify-start'
                }`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          leftIcon={saved ? <Shield size={16} /> : <Save size={16} />}
          onClick={handleSave}
        >
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
