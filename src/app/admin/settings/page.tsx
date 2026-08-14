'use client';

import React, { useState } from 'react';
import { Settings, Save, DollarSign, Globe, Bell, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
          <Settings className="text-slate-400" size={22} />
          <h1 className="text-xl font-black text-white">Platform Settings</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">Configure platform fees, general settings, and admin notifications.</p>
      </div>

      {/* Platform Fees */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">Platform Fees</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Membership Commission (%)</label>
            <input type="number" value={membershipFee} onChange={(e) => setMembershipFee(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500/50" />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Tip / Support Commission (%)</label>
            <input type="number" value={tipFee} onChange={(e) => setTipFee(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500/50" />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Payout Processing Fee (%)</label>
            <input type="number" value={payoutFee} onChange={(e) => setPayoutFee(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500/50" />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Minimum Payout Amount ($)</label>
            <input type="number" value={minPayout} onChange={(e) => setMinPayout(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500/50" />
          </div>
        </div>
      </Card>

      {/* General Settings */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">General Settings</h3>
        </div>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Platform Name</label>
            <input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500/50" />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Platform Description</label>
            <textarea value={platformDescription} onChange={(e) => setPlatformDescription(e.target.value)} rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500/50 resize-none" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">Maintenance Mode</p>
              <p className="text-[10px] text-slate-500">Temporarily disable public access</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                maintenanceMode ? 'bg-rose-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow" />
            </button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Admin Notifications</h3>
        </div>
        <div className="space-y-3 text-xs">
          {[
            { label: 'Email notifications for new signups', value: emailNotifs, setter: setEmailNotifs },
            { label: 'Email notifications for new reports', value: reportNotifs, setter: setReportNotifs },
            { label: 'Email notifications for payout requests', value: payoutNotifs, setter: setPayoutNotifs },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-medium">{item.label}</span>
              <button
                onClick={() => item.setter(!item.value)}
                className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                  item.value ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-white rounded-full shadow" />
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
          leftIcon={saved ? <Shield size={14} /> : <Save size={14} />}
          onClick={handleSave}
        >
          {saved ? 'Settings Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
