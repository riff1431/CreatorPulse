'use client';

import React, { useState } from 'react';
import { 
  Menu, Plus, ArrowUp, ArrowDown, Trash2, Edit3, Eye, EyeOff, 
  Sparkles, ExternalLink, RefreshCw, Check, Shield, Layers
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { useNavigation, NavItemDef } from '@/lib/navigation/navigation-context';
import { useToast } from '@/components/ui/Toast';
import { useAdminProgress } from '@/components/admin/AdminProgressProvider';

const AVAILABLE_ICONS = [
  'Home', 'Compass', 'Film', 'MessageSquare', 'Sparkles', 'Search', 
  'Bookmark', 'Wallet', 'Radio', 'Star', 'User', 'Settings', 'Layers', 'HelpCircle'
];

const AVAILABLE_ROLES = [
  { id: 'all', label: 'Everyone' },
  { id: 'guest', label: 'Guests Only' },
  { id: 'member', label: 'Members (Fans)' },
  { id: 'creator', label: 'Creators' },
  { id: 'admin', label: 'Admins' },
];

export default function AdminNavigationPage() {
  const { items, addItem, updateItem, deleteItem, reorderItems, resetToDefaults } = useNavigation();
  const { addToast } = useToast();
  const { startProgress, updateProgress, completeProgress, errorProgress } = useAdminProgress();
  const [activeLocation, setActiveLocation] = useState<'header' | 'footer' | 'sidebar'>('header');
  const [editingItem, setEditingItem] = useState<Partial<NavItemDef> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredItems = items
    .filter((i) => i.location === activeLocation)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const handleOpenAdd = () => {
    setEditingItem({
      location: activeLocation,
      title: '',
      url: '',
      icon: 'Compass',
      target: '_self',
      orderIndex: filteredItems.length,
      allowedRoles: ['all'],
      isEnabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NavItemDef) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveModal = async () => {
    if (!editingItem?.title || !editingItem?.url) {
      addToast({ title: 'Validation Error', message: 'Title and URL are required.', type: 'error' });
      return;
    }

    if (editingItem.id) {
      await updateItem(editingItem.id, editingItem);
      addToast({ title: 'Updated', message: 'Navigation item updated successfully.', type: 'success' });
    } else {
      await addItem({
        location: editingItem.location || activeLocation,
        title: editingItem.title,
        url: editingItem.url,
        icon: editingItem.icon || 'Compass',
        target: editingItem.target || '_self',
        parentId: editingItem.parentId || null,
        orderIndex: editingItem.orderIndex || filteredItems.length,
        allowedRoles: editingItem.allowedRoles || ['all'],
        isEnabled: editingItem.isEnabled !== false,
      });
      addToast({ title: 'Created', message: 'New navigation item added.', type: 'success' });
    }
    setIsModalOpen(false);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...filteredItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const orderedIds = newItems.map((i) => i.id);
    reorderItems(activeLocation, orderedIds);
  };

  const handleToggleRole = (roleId: string) => {
    if (!editingItem) return;
    const current = editingItem.allowedRoles || [];
    let updated: string[];

    if (roleId === 'all') {
      updated = ['all'];
    } else {
      const filtered = current.filter((r) => r !== 'all');
      if (filtered.includes(roleId)) {
        updated = filtered.filter((r) => r !== roleId);
        if (updated.length === 0) updated = ['all'];
      } else {
        updated = [...filtered, roleId];
      }
    }
    setEditingItem({ ...editingItem, allowedRoles: updated });
  };

  const handleResetDefaults = async () => {
    startProgress({
      title: "Resetting Navigation Menu to Defaults",
      steps: [
        "Purging custom navigation configurations...",
        "Restoring standard platform routes...",
        "Syncing Header, Footer, and Sidebar layouts..."
      ]
    });

    try {
      updateProgress(0, 'running', 20, "Purging custom navigation configurations...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(0, 'success', 45, "Custom navigation cleared.");

      updateProgress(1, 'running', 60, "Restoring standard platform routes...");
      await new Promise(r => setTimeout(r, 600));
      updateProgress(1, 'success', 80, "Platform routes restored.");

      updateProgress(2, 'running', 90, "Syncing Header, Footer, and Sidebar layouts...");
      await resetToDefaults();
      await new Promise(r => setTimeout(r, 400));

      completeProgress("Navigation menu defaults restored!");
      addToast({ title: 'Reset Completed', message: 'Navigation menu configurations restored to defaults.', type: 'success' });
    } catch (e) {
      errorProgress(1, "Failed to restore navigation defaults.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Menu className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-black text-[#18181B]">Dynamic Menu & Navigation Manager</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Create, reorder, assign dropdowns, and set role-based visibility for Header, Footer, and Sidebar navigation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} leftIcon={<RefreshCw size={14} />}>
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd} leftIcon={<Plus size={14} />}>
            Add Nav Item
          </Button>
        </div>
      </div>

      {/* Location Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'header', label: 'Header Navbar', count: items.filter((i) => i.location === 'header').length },
          { id: 'footer', label: 'Footer Links', count: items.filter((i) => i.location === 'footer').length },
          { id: 'sidebar', label: 'Sidebar Navigation', count: items.filter((i) => i.location === 'sidebar').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLocation(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeLocation === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeLocation === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Nav List */}
      <Card className="p-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No navigation items configured for {activeLocation}. Click "Add Nav Item" to create one.
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                item.isEnabled ? 'bg-white border-slate-200 shadow-xs hover:border-indigo-300' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    disabled={index === filteredItems.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>

                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100">
                  {item.icon ? item.icon[0] : 'N'}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                    {item.target === '_blank' && <ExternalLink size={12} className="text-slate-400" />}
                    {!item.isEnabled && (
                      <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-md font-semibold">
                        Disabled
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{item.url}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Allowed Roles Badges */}
                <div className="hidden md:flex items-center gap-1">
                  {item.allowedRoles.map((role) => (
                    <span key={role} className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize">
                      {role}
                    </span>
                  ))}
                </div>

                {/* Enable Toggle */}
                <button
                  onClick={() => updateItem(item.id, { isEnabled: !item.isEnabled })}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    item.isEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                  title={item.isEnabled ? 'Disable Item' : 'Enable Item'}
                >
                  {item.isEnabled ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>

                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer border border-slate-200"
                  title="Edit Item"
                >
                  <Edit3 size={15} />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete "${item.title}"?`)) deleteItem(item.id);
                  }}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
                  title="Delete Item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* EDIT / CREATE MODAL */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem.id ? 'Edit Navigation Item' : 'Create Navigation Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Navigation Location</label>
                <select
                  value={editingItem.location}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="header">Header Navbar</option>
                  <option value="footer">Footer Links</option>
                  <option value="sidebar">Sidebar Navigation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Label / Title</label>
                <input
                  type="text"
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Creator Hub"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Destination URL / Route</label>
                <input
                  type="text"
                  value={editingItem.url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="/explore or https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Lucide Icon</label>
                  <select
                    value={editingItem.icon || 'Compass'}
                    onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Open In</label>
                  <select
                    value={editingItem.target || '_self'}
                    onChange={(e) => setEditingItem({ ...editingItem, target: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="_self">Same Window (_self)</option>
                    <option value="_blank">New Tab (_blank)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Visibility by User Role</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {AVAILABLE_ROLES.map((role) => {
                    const isSelected = (editingItem.allowedRoles || []).includes(role.id);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleToggleRole(role.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveModal}>
                Save Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
