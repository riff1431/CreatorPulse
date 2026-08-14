'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

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
  { id: '1', name: 'David Miller', username: 'fitdavid', email: 'david@fitnessedge.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', category: 'Fitness & Wellness', bio: 'Certified trainer with 8+ years coaching athletes and beginners. Offering custom workout plans.', socialLink: 'instagram.com/fitdavid', status: 'pending', appliedAt: '2 hours ago' },
  { id: '2', name: 'Mia Wong', username: 'miacooking', email: 'mia@kitchenstories.io', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', category: 'Food & Cooking', bio: 'Pastry chef and recipe developer sharing secret baking techniques and monthly masterclasses.', socialLink: 'youtube.com/@miacooking', status: 'pending', appliedAt: '5 hours ago' },
  { id: '3', name: 'Ryan Park', username: 'ryanphoto', email: 'ryan@visualarts.com', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150', category: 'Art & Design', bio: 'Landscape photographer offering Lightroom presets and photography masterclasses.', socialLink: 'instagram.com/ryanpark', status: 'approved', appliedAt: '1 day ago' },
];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(initialApplications);

  const handleApprove = (id: string) => {
    setApplications(applications.map((a) => (a.id === id ? { ...a, status: 'approved' } : a)));
  };

  const handleReject = (id: string) => {
    setApplications(applications.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a)));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FileText className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B]">Creator Applications</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Review and verify creator verification applications.</p>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar src={app.avatar} alt={app.name} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#18181B]">{app.name}</h3>
                    <Badge variant={app.status === 'approved' ? 'emerald' : app.status === 'rejected' ? 'rose' : 'amber'} size="sm">
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#71717A]">@{app.username} • {app.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                <Clock size={12} />
                <span>Applied {app.appliedAt}</span>
              </div>
            </div>

            <div className="bg-[#FFF9FC] p-4 rounded-2xl border border-[#F3DCE8] space-y-2 text-xs">
              <div>
                <span className="text-[#A1A1AA] font-bold">Category: </span>
                <span className="text-[#BE185D] font-bold">{app.category}</span>
              </div>
              <div>
                <span className="text-[#A1A1AA] font-bold">Bio: </span>
                <span className="text-[#18181B] leading-relaxed">{app.bio}</span>
              </div>
              <div>
                <span className="text-[#A1A1AA] font-bold">Social Link: </span>
                <span className="text-[#EC4899] font-medium">{app.socialLink}</span>
              </div>
            </div>

            {app.status === 'pending' && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F3DCE8]">
                <Button variant="ghost" size="sm" onClick={() => handleReject(app.id)} leftIcon={<XCircle size={14} className="text-[#F43F5E]" />}>
                  Reject
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleApprove(app.id)} leftIcon={<CheckCircle2 size={14} />}>
                  Approve Application
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
