'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle2, XCircle, Clock, Eye, AlertCircle, Building, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface Application {
  id: string;
  name: string;
  username: string;
  avatar: string;
  email: string;
  category: string;
  bio: string;
  socialLink: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

const initialApplications: Application[] = [
  { id: '1', name: 'David Miller', username: 'fitdavid', email: 'david@fitnessedge.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', category: 'Fitness & Wellness', bio: 'Certified trainer with 8+ years coaching athletes and beginners. Offering custom workout plans, meal preps, and exercise videos.', socialLink: 'instagram.com/fitdavid', status: 'pending', appliedAt: '2 hours ago' },
  { id: '2', name: 'Mia Wong', username: 'miacooking', email: 'mia@kitchenstories.io', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', category: 'Food & Cooking', bio: 'Pastry chef and recipe developer sharing secret baking techniques, sourdough masterclasses, and cooking diaries.', socialLink: 'youtube.com/@miacooking', status: 'pending', appliedAt: '5 hours ago' },
  { id: '3', name: 'Ryan Park', username: 'ryanphoto', email: 'ryan@visualarts.com', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150', category: 'Art & Design', bio: 'Landscape photographer offering Lightroom presets, composition masterclasses, and visual arts vlogs.', socialLink: 'instagram.com/ryanpark', status: 'approved', appliedAt: '1 day ago' },
];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const { showToast } = useToast();

  const handleApprove = (id: string, name: string) => {
    setApplications(applications.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)));
    showToast(`Creator application for "${name}" approved successfully!`, 'success');
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, status: 'approved' });
    }
  };

  const handleReject = (id: string, name: string) => {
    setApplications(applications.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a)));
    showToast(`Creator application for "${name}" has been rejected.`, 'warning');
    if (selectedApp && selectedApp.id === id) {
      setSelectedApp({ ...selectedApp, status: 'rejected' });
    }
  };

  const filteredApps = applications.filter(app => activeFilter === 'all' || app.status === activeFilter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="text-[#EC4899]" size={22} />
            <h1 className="text-xl font-black text-[#18181B] tracking-tight">Creator Verification</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">Verify applications, review bio summaries, and approve creator roles.</p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1 bg-white/70 p-1 border border-[#F3DCE8] rounded-2xl shadow-xs self-start sm:self-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                activeFilter === filter
                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F7]/50'
              }`}
            >
              {filter}
              {filter === 'pending' && (
                <span className="ml-1.5 bg-[#FFE4E6] text-[#BE123C] px-1.5 py-0.5 rounded-full text-[9px] font-black">
                  {applications.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredApps.map((app) => (
          <Card key={app.id} className="p-5 flex flex-col justify-between hoverable space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={app.avatar} alt={app.name} size="md" />
                  <div>
                    <h3 className="font-bold text-xs text-[#18181B] tracking-tight">{app.name}</h3>
                    <p className="text-[10px] text-[#71717A]">@{app.username} • {app.email}</p>
                  </div>
                </div>
                <Badge variant={app.status === 'approved' ? 'emerald' : app.status === 'rejected' ? 'rose' : 'amber'} size="sm">
                  {app.status.toUpperCase()}
                </Badge>
              </div>

              {/* Bio summary block */}
              <div className="bg-[#FFF9FC] p-3.5 rounded-2xl border border-[#F3DCE8] space-y-2 text-[11px] font-semibold text-[#18181B]">
                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA] text-[10px] font-bold">Category</span>
                  <span className="text-[#BE185D] font-extrabold">{app.category}</span>
                </div>
                <p className="text-[#71717A] leading-relaxed line-clamp-2">{app.bio}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F3DCE8]/50">
              <span className="text-[10px] text-[#A1A1AA] font-bold flex items-center gap-1">
                <Clock size={11} /> {app.appliedAt}
              </span>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)}>
                  Inspect
                </Button>
                {app.status === 'pending' && (
                  <>
                    <Button variant="ghost" size="sm" className="text-[#F43F5E]" onClick={() => handleReject(app.id, app.name)}>
                      <XCircle size={14} />
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleApprove(app.id, app.name)}>
                      <Check size={14} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredApps.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#71717A] font-bold flex flex-col items-center justify-center gap-2">
            <AlertCircle size={24} className="text-[#A1A1AA]" />
            <p>No creator verification applications logged in this section.</p>
          </div>
        )}
      </div>

      {/* Verification detailed Inspector Modal */}
      <Modal
        isOpen={selectedApp !== null}
        onClose={() => setSelectedApp(null)}
        title={selectedApp ? `Application Profile: ${selectedApp.name}` : ''}
      >
        {selectedApp && (
          <div className="space-y-4 font-semibold text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F3DCE8]">
              <Avatar src={selectedApp.avatar} alt={selectedApp.name} size="md" />
              <div>
                <h4 className="text-xs font-black text-[#18181B] tracking-tight">{selectedApp.name}</h4>
                <p className="text-[10px] text-[#71717A]">@{selectedApp.username} • {selectedApp.email}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-[#A1A1AA] text-[10px] block font-bold mb-0.5">Verification Category</span>
                <Badge variant="pink" size="sm">
                  {selectedApp.category}
                </Badge>
              </div>

              <div>
                <span className="text-[#A1A1AA] text-[10px] block font-bold mb-0.5">Proposed Platform Bio</span>
                <p className="bg-[#FFF9FC] p-3 rounded-xl border border-[#F3DCE8] text-[#18181B] font-medium leading-relaxed">
                  {selectedApp.bio}
                </p>
              </div>

              <div>
                <span className="text-[#A1A1AA] text-[10px] block font-bold mb-0.5">Social/Portfolio Link</span>
                <a
                  href={`https://${selectedApp.socialLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#EC4899] hover:underline"
                >
                  {selectedApp.socialLink}
                </a>
              </div>

              <div>
                <span className="text-[#A1A1AA] text-[10px] block font-bold mb-0.5">Application Status</span>
                <Badge variant={selectedApp.status === 'approved' ? 'emerald' : selectedApp.status === 'rejected' ? 'rose' : 'amber'} size="sm">
                  {selectedApp.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {selectedApp.status === 'pending' && (
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3DCE8] mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#F43F5E] border-rose-200 hover:bg-rose-50"
                  onClick={() => handleReject(selectedApp.id, selectedApp.name)}
                >
                  Reject Application
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 size={13} />}
                  onClick={() => handleApprove(selectedApp.id, selectedApp.name)}
                >
                  Verify Creator
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
