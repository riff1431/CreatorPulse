'use client';

import React, { useState } from 'react';
import { Layers, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';

import { MediaUploader } from '@/components/ui/MediaUploader';

interface Category {
  id: string;
  name: string;
  slug: string;
  creators: number;
  posts: number;
  status: 'active' | 'inactive';
  imageUrl?: string;
}

const initialCategories: Category[] = [
  { id: '1', name: 'Art & Design', slug: 'art-design', creators: 320, posts: 4800, status: 'active', imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150' },
  { id: '2', name: 'Education & Tech', slug: 'education-tech', creators: 480, posts: 8200, status: 'active', imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150' },
  { id: '3', name: 'Fitness & Wellness', slug: 'fitness-wellness', creators: 210, posts: 3100, status: 'active', imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150' },
  { id: '4', name: 'Music & Sound', slug: 'music-sound', creators: 180, posts: 2400, status: 'active', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150' },
  { id: '5', name: 'Business & Finance', slug: 'business-finance', creators: 150, posts: 1900, status: 'active', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150' },
  { id: '6', name: 'Food & Cooking', slug: 'food-cooking', creators: 90, posts: 1200, status: 'active', imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=150' },
  { id: '7', name: 'Gaming', slug: 'gaming', creators: 50, posts: 600, status: 'inactive', imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=150' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setCategories([
      ...categories,
      {
        id: `cat-${Date.now()}`,
        name: newName.trim(),
        slug,
        creators: 0,
        posts: 0,
        status: 'active',
        imageUrl: newImageUrl
      },
    ]);
    setNewName('');
    setNewImageUrl('');
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
            <Layers className="text-indigo-600" size={22} />
            <h1 className="text-xl font-black text-[#18181B]">Categories</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Manage creator and content categories.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Add Category
        </Button>
      </div>

      {showAdd && (
        <Card className="p-5 space-y-4 border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Plus size={16} className="text-indigo-600" />
            <span className="font-bold text-slate-800 text-xs">Add New Category</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Art & Design"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#18181B] focus:outline-none focus:border-indigo-500 font-medium"
                autoFocus
              />
            </div>
            <div>
              <MediaUploader
                label="Category Cover Image"
                description="Thumbnail image representing this category."
                folder="covers"
                accept="images"
                aspectRatio="square"
                value={newImageUrl}
                onChange={setNewImageUrl}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setNewName(''); setNewImageUrl(''); }}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAdd}>Save Category</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[#71717A] text-left">
              <th className="py-3.5 px-4 w-8"></th>
              <th className="py-3.5 px-4 font-bold w-12">Image</th>
              <th className="py-3.5 px-4 font-bold">Name</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Slug</th>
              <th className="py-3.5 px-4 font-bold">Creators</th>
              <th className="py-3.5 px-4 font-bold hidden sm:table-cell">Posts</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 text-[#A1A1AA] cursor-grab"><GripVertical size={14} /></td>
                <td className="py-3 px-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Layers className="text-slate-400" size={14} />
                    )}
                  </div>
                </td>
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
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 size={13} className="text-red-600" /></Button>
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
