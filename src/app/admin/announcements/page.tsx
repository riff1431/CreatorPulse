'use client';

import React, { useState } from 'react';
import { 
  Bell, Plus, Calendar, Eye, MousePointer, Trash2, Edit3, 
  CheckCircle2, AlertCircle, RefreshCw, Send, Mail, Layers
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { useAnnouncements, Announcement, NotificationTemplate } from '@/lib/notifications/announcement-context';
import { useToast } from '@/components/ui/Toast';

export default function AdminAnnouncementsPage() {
  const { announcements, templates, saveAnnouncement, deleteAnnouncement, updateTemplate, resetToDefaults } = useAnnouncements();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'announcements' | 'templates'>('announcements');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isAncModalOpen, setIsAncModalOpen] = useState(false);
  const [isTplModalOpen, setIsTplModalOpen] = useState(false);

  const handleOpenAddAnc = () => {
    setEditingAnnouncement({
      title: '',
      content: '',
      targetRole: 'all',
      placement: 'top_banner',
      status: 'active',
      ctaText: '',
      ctaLink: '',
      isDismissible: true,
      publishedAt: new Date().toISOString().slice(0, 16),
    });
    setIsAncModalOpen(true);
  };

  const handleOpenEditAnc = (anc: Announcement) => {
    setEditingAnnouncement({
      ...anc,
      publishedAt: anc.publishedAt ? new Date(anc.publishedAt).toISOString().slice(0, 16) : '',
      expiresAt: anc.expiresAt ? new Date(anc.expiresAt).toISOString().slice(0, 16) : '',
    });
    setIsAncModalOpen(true);
  };

  const handleSaveAnc = async () => {
    if (!editingAnnouncement?.title || !editingAnnouncement?.content) {
      addToast({ title: 'Validation Error', message: 'Title and Content are required.', type: 'error' });
      return;
    }

    await saveAnnouncement({
      id: editingAnnouncement.id,
      title: editingAnnouncement.title,
      content: editingAnnouncement.content,
      targetRole: editingAnnouncement.targetRole || 'all',
      placement: editingAnnouncement.placement || 'top_banner',
      status: editingAnnouncement.status || 'active',
      ctaText: editingAnnouncement.ctaText,
      ctaLink: editingAnnouncement.ctaLink,
      isDismissible: editingAnnouncement.isDismissible !== false,
      publishedAt: editingAnnouncement.publishedAt ? new Date(editingAnnouncement.publishedAt).toISOString() : undefined,
      expiresAt: editingAnnouncement.expiresAt ? new Date(editingAnnouncement.expiresAt).toISOString() : undefined,
    });

    addToast({ title: 'Announcement Saved', message: 'Targeted announcement updated successfully.', type: 'success' });
    setIsAncModalOpen(false);
  };

  const handleOpenEditTpl = (tpl: NotificationTemplate) => {
    setEditingTemplate({ ...tpl });
    setIsTplModalOpen(true);
  };

  const handleSaveTpl = async () => {
    if (!editingTemplate) return;
    await updateTemplate(editingTemplate.id, editingTemplate);
    addToast({ title: 'Template Saved', message: `Notification template "${editingTemplate.name}" saved.`, type: 'success' });
    setIsTplModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-black text-[#18181B]">Dynamic Notification & Announcement System</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Create targeted announcements for all users or selected roles, schedule publish/expiry dates, track views, and manage notification templates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults} leftIcon={<RefreshCw size={14} />}>
            Reset Defaults
          </Button>
          {activeTab === 'announcements' && (
            <Button variant="primary" size="sm" onClick={handleOpenAddAnc} leftIcon={<Plus size={14} />}>
              Create Announcement
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Bell size={14} />
          Targeted Announcements ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Mail size={14} />
          Notification Templates ({templates.length})
        </button>
      </div>

      {/* TAB 1: Targeted Announcements List */}
      {activeTab === 'announcements' && (
        <Card className="p-4 space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No announcements created yet. Click "Create Announcement" to launch a campaign!
            </div>
          ) : (
            announcements.map((anc) => (
              <div
                key={anc.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{anc.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        anc.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {anc.status.toUpperCase()}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                      {anc.placement.replace('_', ' ')}
                    </span>
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-2 py-0.5 rounded-full font-bold capitalize">
                      Role: {anc.targetRole}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{anc.content}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Eye size={12} className="text-slate-500" /> {anc.viewsCount || 0} Views
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer size={12} className="text-slate-500" /> {anc.clicksCount || 0} Clicks
                    </span>
                    {anc.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-500" /> Pub: {new Date(anc.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEditAnc(anc)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 cursor-pointer"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${anc.title}"?`)) deleteAnnouncement(anc.id);
                    }}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </Card>
      )}

      {/* TAB 2: Notification Templates */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="p-5 space-y-3 border border-slate-200 bg-white flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{tpl.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tpl.isEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tpl.isEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                <p className="text-xs font-semibold text-indigo-900 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                  Subject: {tpl.subject}
                </p>

                <p className="text-xs text-slate-600 line-clamp-3 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {tpl.body}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {tpl.variables.map((v) => (
                    <span key={v} className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditTpl(tpl)} leftIcon={<Edit3 size={14} />}>
                  Edit Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ANNOUNCEMENT CREATE / EDIT MODAL */}
      {isAncModalOpen && editingAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingAnnouncement.id ? 'Edit Announcement' : 'Create Targeted Announcement'}
              </h3>
              <button onClick={() => setIsAncModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={editingAnnouncement.title || ''}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                  placeholder="e.g. System Upgrade Scheduled"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Announcement Content</label>
                <textarea
                  rows={3}
                  value={editingAnnouncement.content || ''}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Display Placement</label>
                  <select
                    value={editingAnnouncement.placement || 'top_banner'}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, placement: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  >
                    <option value="top_banner">Top Header Banner</option>
                    <option value="popup_modal">Modal Popup</option>
                    <option value="notification_feed">In-App Feed Center</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Audience</label>
                  <select
                    value={editingAnnouncement.targetRole || 'all'}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, targetRole: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  >
                    <option value="all">All Users (Public)</option>
                    <option value="member">Members Only</option>
                    <option value="creator">Creators Only</option>
                    <option value="admin">Admins Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Publish Start Date</label>
                  <input
                    type="datetime-local"
                    value={editingAnnouncement.publishedAt || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, publishedAt: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expiry Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={editingAnnouncement.expiresAt || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, expiresAt: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CTA Button Text (Optional)</label>
                  <input
                    type="text"
                    value={editingAnnouncement.ctaText || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, ctaText: e.target.value })}
                    placeholder="e.g. Learn More"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CTA Button Link</label>
                  <input
                    type="text"
                    value={editingAnnouncement.ctaLink || ''}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, ctaLink: e.target.value })}
                    placeholder="/explore"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsAncModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveAnc}>
                Save Announcement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE EDIT MODAL */}
      {isTplModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Template: {editingTemplate.name}</h3>
              <button onClick={() => setIsTplModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject Line</label>
                <input
                  type="text"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Message Body</label>
                <textarea
                  rows={5}
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsTplModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveTpl}>
                Save Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
