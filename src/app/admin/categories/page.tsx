'use client';

import React, { useState } from 'react';
import { Layers, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Category {
  id: string;
  name: string;
  slug: string;
  creators: number;
  posts: number;
  status: 'active' | 'inactive';
}

const initialCategories: Category[] = [
  { id: '1', name: 'Art & Design', slug: 'art-design', creators: 320, posts: 4800, status: 'active' },
  { id: '2', name: 'Education & Tech', slug: 'education-tech', creators: 480, posts: 8200, status: 'active' },
  { id: '3', name: 'Fitness & Wellness', slug: 'fitness-wellness', creators: 210, posts: 3100, status: 'active' },
  { id: '4', name: 'Music & Sound', slug: 'music-sound', creators: 180, posts: 2400, status: 'active' },
  { id: '5', name: 'Business & Finance', slug: 'business-finance', creators: 150, posts: 1900, status: 'active' },
  { id: '6', name: 'Food & Cooking', slug: 'food-cooking', creators: 90, posts: 1200, status: 'active' },
  { id: '7', name: 'Gaming', slug: 'gaming', creators: 50, posts: 600, status: 'inactive' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setCategories([
      ...categories,
      { id: `cat-${Date.now()}`, name: newName.trim(), slug, creators: 0, posts: 0, status: 'active' },
    ]);
    setNewName('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleToggle = (id: string) => {
    setCategories(categories.map((c) =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B]">Categories</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Manage creator and content categories.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Add Category
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4 flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name..."
            className="flex-1 bg-[#FFF9FC] border border-[#F3DCE8] rounded-xl px-3 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#EC4899] font-medium"
            autoFocus
          />
          <Button variant="primary" size="sm" onClick={handleAdd}>Save</Button>
          <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setNewName(''); }}>Cancel</Button>
        </Card>
      )}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#F3DCE8] bg-[#FFF9FC] text-[#71717A] text-left">
              <th className="py-3.5 px-4 w-8"></th>
              <th className="py-3.5 px-4 font-bold">Name</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Slug</th>
              <th className="py-3.5 px-4 font-bold">Creators</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Posts</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3DCE8]">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-[#FFF9FC] transition-colors">
                <td className="py-3 px-4 text-[#A1A1AA] cursor-grab"><GripVertical size={14} /></td>
                <td className="py-3 px-4 font-bold text-[#18181B]">{c.name}</td>
                <td className="py-3 px-4 text-[#71717A] font-mono hidden sm:table-cell">{c.slug}</td>
                <td className="py-3 px-4 text-[#18181B] font-semibold">{c.creators}</td>
                <td className="py-3 px-4 text-[#71717A] hidden sm:table-cell font-medium">{c.posts}</td>
                <td className="py-3 px-4">
                  <button onClick={() => handleToggle(c.id)} className="cursor-pointer">
                    <Badge variant={c.status === 'active' ? 'emerald' : 'slate'} size="sm">{c.status}</Badge>
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 size={13} className="text-[#F43F5E]" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
