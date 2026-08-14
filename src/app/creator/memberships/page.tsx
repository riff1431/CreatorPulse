'use client';

import React, { useState } from 'react';
import { Layers, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

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

export default function CreatorMembershipsPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newPrice.trim()) return;
    setPlans([...plans, {
      id: `plan-${Date.now()}`, name: newName, price: `$${newPrice}/mo`,
      description: 'New membership plan', benefits: ['Customizable benefits'],
      subscribers: 0, status: 'active'
    }]);
    setNewName(''); setNewPrice(''); setShowAdd(false);
  };

  const handleToggle = (id: string) => {
    setPlans(plans.map((p) => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
  };

  const handleDelete = (id: string) => {
    setPlans(plans.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B]">Membership Plans</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Create and manage your membership tiers.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowAdd(true)}>New Plan</Button>
      </div>

      {showAdd && (
        <Card className="p-5 space-y-3.5">
          <h3 className="text-sm font-bold text-[#18181B]">Create New Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#71717A] font-semibold mb-1">Plan Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Gold Tier"
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium" />
            </div>
            <div>
              <label className="block text-[#71717A] font-semibold mb-1">Monthly Price ($)</label>
              <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g. 10.00"
                className="w-full bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium" />
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setNewName(''); setNewPrice(''); }}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAdd}>Create Plan</Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-[#18181B]">{plan.name}</h3>
                  {plan.popular && <Badge variant="pink" size="sm">Popular</Badge>}
                  <Badge variant={plan.status === 'active' ? 'emerald' : 'slate'} size="sm">{plan.status}</Badge>
                </div>
                <p className="text-xs text-[#71717A] mt-1 font-medium">{plan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-[#18181B]">{plan.price}</p>
                <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1 justify-end font-semibold"><Users size={11} /> {plan.subscribers} subscribers</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {plan.benefits.map((b) => (
                <span key={b} className="text-[11px] font-bold text-[#BE185D] bg-[#FCE7F3] px-2.5 py-1 rounded-full border border-[#FBCFE8]">{b}</span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#F3DCE8]">
              <Button variant="outline" size="sm" leftIcon={<Pencil size={12} />}>Edit</Button>
              <Button variant="ghost" size="sm" onClick={() => handleToggle(plan.id)}>
                {plan.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id)}>
                <Trash2 size={13} className="text-[#F43F5E]" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
