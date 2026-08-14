'use client';

import React, { useState } from 'react';
import { Layers, Plus, Pencil, Trash2, Users, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  benefits: string[];
  subscribers: number;
  status: 'active' | 'inactive';
  popular?: boolean;
}

const initialPlans: Plan[] = [
  {
    id: '1', name: 'Starter Community', price: '$5.00/mo',
    description: 'Access to public post updates & general community lounge.',
    benefits: ['Access to Starter Posts', 'Community Chat Threads', 'Weekly Q&A Access'],
    subscribers: 420, status: 'active'
  },
  {
    id: '2', name: 'Pro Designer Tier', price: '$15.00/mo',
    description: 'Full Figma UI Kits, Design System Tokens, and Video Tutorials.',
    benefits: ['All Starter Benefits', '40+ Figma Template UI Kits', 'Exclusive Design Video Masterclasses'],
    subscribers: 320, status: 'active', popular: true
  },
  {
    id: '3', name: 'VIP Inner Circle', price: '$30.00/mo',
    description: 'Direct 1-on-1 Portfolio Reviews and Private Discord Channel.',
    benefits: ['All Pro Benefits', 'Direct 1-on-1 DM Thread', 'Monthly 30-min Portfolio Review Call'],
    subscribers: 100, status: 'active'
  },
];

const generatePlanId = () => `plan-${Date.now()}`;

export default function CreatorMembershipsPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [showAdd, setShowAdd] = useState(false);
  const { showToast } = useToast();

  // Form states
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newBenefitsList, setNewBenefitsList] = useState<string[]>([]);
  const [isPopular, setIsPopular] = useState(false);

  const handleAddBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBenefit.trim()) return;
    setNewBenefitsList([...newBenefitsList, newBenefit.trim()]);
    setNewBenefit('');
  };

  const removeBenefit = (index: number) => {
    setNewBenefitsList(newBenefitsList.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (!newName.trim() || !newPrice.trim()) {
      showToast('Please fill in required fields.', 'error');
      return;
    }
    const newPlan: Plan = {
      id: generatePlanId(),
      name: newName,
      price: `$${parseFloat(newPrice).toFixed(2)}/mo`,
      description: newDesc || 'Access to exclusive member-only benefits.',
      benefits: newBenefitsList.length > 0 ? newBenefitsList : ['Exclusive Content Access'],
      subscribers: 0,
      status: 'active',
      popular: isPopular
    };
    setPlans([newPlan, ...plans]);
    showToast(`Tier "${newName}" created successfully!`, 'success');
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewPrice('');
    setNewDesc('');
    setNewBenefitsList([]);
    setIsPopular(false);
    setShowAdd(false);
  };

  const handleToggle = (id: string) => {
    setPlans(plans.map((p) => {
      if (p.id === id) {
        const nextStatus = p.status === 'active' ? 'inactive' : 'active';
        showToast(`Tier "${p.name}" marked as ${nextStatus}.`, 'info');
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleDelete = (id: string, name: string) => {
    setPlans(plans.filter((p) => p.id !== id));
    showToast(`Deleted tier "${name}".`, 'warning');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B] tracking-tight">Membership Creator</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Create, publish, and moderate membership tiers for subscribers.</p>
        </div>
        {!showAdd && (
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
            New Plan
          </Button>
        )}
      </div>

      {/* Builder Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form and list */}
        <div className="lg:col-span-2 space-y-6">
          {showAdd && (
            <Card className="p-6 space-y-5 border-[#EC4899]/30 shadow-md">
              <div>
                <h3 className="text-sm font-black text-[#18181B] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#EC4899]" /> Custom Tier Details
                </h3>
                <p className="text-[10px] text-[#71717A] mt-0.5 font-medium">Define price points and subscriber rewards.</p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#71717A] mb-1 font-bold">Tier Name *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. VIP Inner Circle"
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#71717A] mb-1 font-bold">Monthly Price ($) *</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="e.g. 29.99"
                      className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#71717A] mb-1 font-bold">Tier Description</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe what members unlock with this plan..."
                    rows={2}
                    className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] resize-none font-medium"
                  />
                </div>

                {/* Benefits Manager */}
                <div className="space-y-2">
                  <label className="block text-[#71717A] font-bold">Tier Benefits & Rewards</label>
                  <form onSubmit={handleAddBenefit} className="flex gap-2">
                    <input
                      type="text"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="e.g. Weekly 1-on-1 coaching, Exclusive kits"
                      className="flex-1 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3.5 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
                    />
                    <Button variant="outline" size="sm" type="submit">
                      Add
                    </Button>
                  </form>

                  {/* List of benefits */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {newBenefitsList.map((b, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold text-[#BE185D] bg-[#FCE7F3] px-2.5 py-1 rounded-full border border-[#FBCFE8] flex items-center gap-1"
                      >
                        <span>{b}</span>
                        <button
                          type="button"
                          onClick={() => removeBenefit(idx)}
                          className="hover:text-red-700 font-bold ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {newBenefitsList.length === 0 && (
                      <span className="text-[10px] text-[#A1A1AA] italic font-medium flex items-center gap-1">
                        <AlertCircle size={10} /> Add at least one benefit to motivate subscribers.
                      </span>
                    )}
                  </div>
                </div>

                {/* Popular Badge checkbox */}
                <div className="flex items-center gap-2 pt-1.5 select-none">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="accent-[#EC4899] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isPopular" className="text-[#18181B] font-extrabold cursor-pointer">
                    Promote as &quot;Popular Choice&quot; on profile
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3DCE8]">
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleAdd}>
                  Publish Tier
                </Button>
              </div>
            </Card>
          )}

          {/* Active Tiers List */}
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="p-6 space-y-4 hoverable">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-[#18181B] tracking-tight">{plan.name}</h3>
                      {plan.popular && <Badge variant="pink" size="sm">Popular</Badge>}
                      <Badge variant={plan.status === 'active' ? 'emerald' : 'slate'} size="sm">
                        {plan.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#71717A] mt-1 font-medium leading-relaxed">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#18181B] tracking-tight">{plan.price}</p>
                    <p className="text-[10px] text-[#71717A] flex items-center gap-1 justify-end font-bold mt-0.5">
                      <Users size={11} className="text-[#EC4899]" /> {plan.subscribers} members
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {plan.benefits.map((b) => (
                    <span
                      key={b}
                      className="text-[10px] font-bold text-[#BE185D] bg-[#FFF1F7] px-2.5 py-1 rounded-full border border-[#F3DCE8]"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#F3DCE8]">
                  <Button variant="outline" size="sm" leftIcon={<Pencil size={12} />}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(plan.id)}>
                    {plan.status === 'active' ? 'Deactivate Plan' : 'Activate Plan'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id, plan.name)}>
                    <Trash2 size={13} className="text-[#F43F5E]" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Live Profile Card Preview Sidebar */}
        <div className="space-y-4 sticky top-20">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#A1A1AA]">Profile Preview</h4>
            <p className="text-[9px] text-[#71717A] font-medium mt-0.5">How your fans see tiers on your profile.</p>
          </div>

          <div className="bg-gradient-to-tr from-[#FFF1F7] to-white border-2 border-dashed border-[#F3DCE8] p-5 rounded-[28px] space-y-4">
            {/* Mock Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F3DCE8]">
              <div className="w-8 h-8 rounded-full bg-[#EC4899]/15 flex items-center justify-center font-black text-xs text-[#EC4899]">
                SJ
              </div>
              <div>
                <p className="text-[11px] font-black text-[#18181B]">Sarah Jenkins</p>
                <p className="text-[9px] text-[#71717A] font-semibold">Select a membership to support</p>
              </div>
            </div>

            {/* Visual Card Preview */}
            <div className={`p-5 rounded-2xl relative overflow-hidden transition-all duration-300 ${
              isPopular 
                ? 'bg-white border-2 border-[#EC4899] shadow-lg shadow-[#EC4899]/10' 
                : 'bg-white border border-[#F3DCE8]'
            }`}>
              {isPopular && (
                <div className="absolute right-0 top-0 bg-[#EC4899] text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-xl uppercase tracking-wider">
                  Popular
                </div>
              )}
              
              <div className="space-y-1">
                <span className="text-[8px] uppercase tracking-wider text-[#EC4899] font-black">Plan Option</span>
                <h4 className="text-sm font-black text-[#18181B] truncate">
                  {newName.trim() || 'Your Plan Name'}
                </h4>
                <p className="text-lg font-black text-[#18181B] pt-1">
                  {newPrice ? `$${parseFloat(newPrice).toFixed(2)}/mo` : '$0.00/mo'}
                </p>
                <p className="text-[10px] text-[#71717A] font-medium leading-normal line-clamp-2">
                  {newDesc.trim() || 'A short description of this plan tier and access privileges.'}
                </p>
              </div>

              <div className="space-y-1.5 pt-3.5">
                <p className="text-[9px] text-[#A1A1AA] uppercase tracking-wider font-black">Includes:</p>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {newBenefitsList.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] text-[#18181B] font-bold">
                      <Check size={11} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                  {newBenefitsList.length === 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA] italic font-semibold">
                      <Check size={11} className="text-slate-300" />
                      <span>Custom rewards & perks</span>
                    </div>
                  )}
                </div>
              </div>

              <button className="w-full mt-4 py-2 text-center text-[10px] font-black text-white gradient-btn rounded-xl">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
