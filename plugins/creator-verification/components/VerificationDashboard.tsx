'use client';

import React, { useState, useMemo } from 'react';
import { 
  BadgeCheck, Shield, Clock, FileText, User, Search, Filter, 
  ChevronRight, X, Check, XCircle, AlertTriangle, MessageSquare, 
  ExternalLink, Download, Eye, Plus, History
} from 'lucide-react';

interface MockApplication {
  id: string;
  userId: string;
  fullLegalName: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'changes_requested' | 'expired' | 'revoked';
  dateOfBirth: string;
  country: string;
  governmentIdUrl: string;
  selfieUrl: string;
  proofOfAddressUrl: string;
  socialMediaLinks: { platform: string; url: string }[];
  additionalNotes: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  history: { action: string; actorName: string; date: string; note: string }[];
  notes: { id: string; authorName: string; content: string; isInternal: boolean; createdAt: string }[];
}

const mockData: MockApplication[] = [
  {
    id: 'app_1',
    userId: 'user_1',
    fullLegalName: 'Sarah Chen',
    status: 'pending',
    dateOfBirth: '1995-04-12',
    country: 'United States',
    governmentIdUrl: '/mock/id1.jpg',
    selfieUrl: '/mock/selfie1.jpg',
    proofOfAddressUrl: '/mock/poa1.jpg',
    socialMediaLinks: [{ platform: 'Instagram', url: 'https://instagram.com/sarahchen' }],
    additionalNotes: 'Looking forward to being verified.',
    submittedAt: '2026-08-15T10:00:00Z',
    history: [{ action: 'submitted', actorName: 'Sarah Chen', date: '2026-08-15T10:00:00Z', note: 'Application submitted' }],
    notes: []
  },
  {
    id: 'app_2',
    userId: 'user_2',
    fullLegalName: 'Marcus Weber',
    status: 'under_review',
    dateOfBirth: '1988-11-23',
    country: 'Germany',
    governmentIdUrl: '/mock/id2.jpg',
    selfieUrl: '/mock/selfie2.jpg',
    proofOfAddressUrl: '/mock/poa2.jpg',
    socialMediaLinks: [{ platform: 'Twitter', url: 'https://twitter.com/marcusw' }],
    additionalNotes: '',
    submittedAt: '2026-08-14T14:30:00Z',
    reviewedBy: 'Admin Jane',
    history: [
      { action: 'submitted', actorName: 'Marcus Weber', date: '2026-08-14T14:30:00Z', note: 'Application submitted' },
      { action: 'under_review', actorName: 'Admin Jane', date: '2026-08-15T09:00:00Z', note: 'Review started' }
    ],
    notes: []
  },
  {
    id: 'app_3',
    userId: 'user_3',
    fullLegalName: 'Aisha Patel',
    status: 'approved',
    dateOfBirth: '1992-07-08',
    country: 'India',
    governmentIdUrl: '/mock/id3.jpg',
    selfieUrl: '/mock/selfie3.jpg',
    proofOfAddressUrl: '/mock/poa3.jpg',
    socialMediaLinks: [{ platform: 'YouTube', url: 'https://youtube.com/aishavlogs' }],
    additionalNotes: 'Thanks for considering.',
    submittedAt: '2026-08-10T08:15:00Z',
    reviewedAt: '2026-08-12T11:00:00Z',
    reviewedBy: 'Admin Tom',
    history: [
      { action: 'submitted', actorName: 'Aisha Patel', date: '2026-08-10T08:15:00Z', note: 'Application submitted' },
      { action: 'approved', actorName: 'Admin Tom', date: '2026-08-12T11:00:00Z', note: 'All documents verified' }
    ],
    notes: [{ id: 'n1', authorName: 'Admin Tom', content: 'Looks great', isInternal: true, createdAt: '2026-08-12T10:55:00Z' }]
  },
  {
    id: 'app_4',
    userId: 'user_4',
    fullLegalName: 'Carlos Rodriguez',
    status: 'rejected',
    dateOfBirth: '1990-02-14',
    country: 'Mexico',
    governmentIdUrl: '/mock/id4.jpg',
    selfieUrl: '/mock/selfie4.jpg',
    proofOfAddressUrl: '/mock/poa4.jpg',
    socialMediaLinks: [],
    additionalNotes: '',
    submittedAt: '2026-08-01T12:00:00Z',
    reviewedAt: '2026-08-05T15:30:00Z',
    reviewedBy: 'Admin Jane',
    history: [
      { action: 'submitted', actorName: 'Carlos Rodriguez', date: '2026-08-01T12:00:00Z', note: 'Application submitted' },
      { action: 'rejected', actorName: 'Admin Jane', date: '2026-08-05T15:30:00Z', note: 'ID expired' }
    ],
    notes: []
  },
  {
    id: 'app_5',
    userId: 'user_5',
    fullLegalName: 'Emma Johansson',
    status: 'changes_requested',
    dateOfBirth: '1998-09-30',
    country: 'Sweden',
    governmentIdUrl: '/mock/id5.jpg',
    selfieUrl: '/mock/selfie5.jpg',
    proofOfAddressUrl: '/mock/poa5.jpg',
    socialMediaLinks: [{ platform: 'TikTok', url: 'https://tiktok.com/@emmaj' }],
    additionalNotes: '',
    submittedAt: '2026-08-12T09:45:00Z',
    reviewedAt: '2026-08-13T16:20:00Z',
    reviewedBy: 'Admin Tom',
    history: [
      { action: 'submitted', actorName: 'Emma Johansson', date: '2026-08-12T09:45:00Z', note: 'Application submitted' },
      { action: 'changes_requested', actorName: 'Admin Tom', date: '2026-08-13T16:20:00Z', note: 'Selfie is blurry' }
    ],
    notes: []
  },
  {
    id: 'app_6',
    userId: 'user_6',
    fullLegalName: 'Takeshi Yamamoto',
    status: 'approved',
    dateOfBirth: '1985-12-05',
    country: 'Japan',
    governmentIdUrl: '/mock/id6.jpg',
    selfieUrl: '/mock/selfie6.jpg',
    proofOfAddressUrl: '/mock/poa6.jpg',
    socialMediaLinks: [{ platform: 'Twitch', url: 'https://twitch.tv/takeshi_gaming' }],
    additionalNotes: 'Streamer full time.',
    submittedAt: '2026-07-20T22:00:00Z',
    reviewedAt: '2026-07-22T08:30:00Z',
    reviewedBy: 'Admin Jane',
    history: [
      { action: 'submitted', actorName: 'Takeshi Yamamoto', date: '2026-07-20T22:00:00Z', note: 'Application submitted' },
      { action: 'approved', actorName: 'Admin Jane', date: '2026-07-22T08:30:00Z', note: 'Approved' }
    ],
    notes: []
  }
];

export default function VerificationDashboard() {
  const [apps, setApps] = useState<MockApplication[]>(mockData);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedApp, setSelectedApp] = useState<MockApplication | null>(null);
  
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = app.fullLegalName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [apps, search, filterStatus]);

  const stats = useMemo(() => {
    return {
      pending: apps.filter(a => a.status === 'pending').length,
      underReview: apps.filter(a => a.status === 'under_review').length,
      approved: apps.filter(a => a.status === 'approved').length,
      rejected: apps.filter(a => a.status === 'rejected').length
    };
  }, [apps]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      under_review: 'bg-blue-100 text-blue-700 border-blue-200',
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      rejected: 'bg-rose-100 text-rose-700 border-rose-200',
      changes_requested: 'bg-purple-100 text-purple-700 border-purple-200',
      expired: 'bg-slate-100 text-slate-700 border-slate-200',
      revoked: 'bg-red-100 text-red-700 border-red-200'
    };
    const format = status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[status] || styles.pending}`}>
        {format}
      </span>
    );
  };

  return (
    <div className="p-6 bg-white min-h-screen text-slate-800 font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Verification Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Manage creator verification applications</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Review</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.underReview}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-xl">
            <BadgeCheck className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.rejected}</p>
          </div>
          <div className="bg-rose-100 p-3 rounded-xl">
            <XCircle className="w-6 h-6 text-rose-600" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by applicant name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="changes_requested">Changes Requested</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Reviewer</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedApp(app)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
                        {app.fullLegalName.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-slate-800">{app.fullLegalName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {app.country}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {app.reviewedBy || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 sticky top-0">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-pink-600" />
                Application Details
              </h2>
              <button onClick={() => setSelectedApp(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Header Info */}
              <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedApp.fullLegalName}</h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                    <span>ID: {selectedApp.id}</span> • <span>Submitted {new Date(selectedApp.submittedAt).toLocaleDateString()}</span>
                  </p>
                </div>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>

              {/* Applicant Info */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Applicant Info
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-xl">
                    <p className="text-[11px] text-slate-500 uppercase font-bold">Date of Birth</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{selectedApp.dateOfBirth}</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-xl">
                    <p className="text-[11px] text-slate-500 uppercase font-bold">Country</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{selectedApp.country}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Uploaded Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Government ID', 'Selfie', 'Proof of Address'].map((doc, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden group">
                      <div className="aspect-video bg-slate-200 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button className="bg-white text-slate-800 p-2 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="bg-white text-slate-800 p-2 rounded-full hover:bg-pink-50 hover:text-pink-600 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                        <FileText className="w-8 h-8 text-slate-400" />
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-[11px] font-bold text-slate-700">{doc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              {selectedApp.socialMediaLinks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Social Media
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.socialMediaLinks.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200 hover:border-pink-200">
                        {link.platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes & History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <History className="w-4 h-4" /> History
                  </h4>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {selectedApp.history.map((hist, i) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-slate-200 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow sm:w-8 sm:h-8 z-10">
                          <Check className="w-3 h-3" />
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm ml-4 md:ml-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800 text-xs capitalize">{hist.action.replace('_', ' ')}</span>
                            <time className="font-medium text-[10px] text-slate-500">{new Date(hist.date).toLocaleDateString()}</time>
                          </div>
                          <div className="text-slate-600 text-xs">{hist.note}</div>
                          <div className="text-slate-400 text-[10px] mt-1 font-medium">By {hist.actorName}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Internal Notes
                  </h4>
                  <div className="space-y-3 mb-4">
                    {selectedApp.notes.map((note) => (
                      <div key={note.id} className="bg-amber-50 border border-amber-100 p-3 rounded-xl">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-[11px] text-amber-800">{note.authorName}</span>
                          <span className="text-[10px] text-amber-600">{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-amber-900">{note.content}</p>
                      </div>
                    ))}
                    {selectedApp.notes.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">No internal notes.</p>}
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <textarea 
                      placeholder="Add an internal note..." 
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none h-20"
                    />
                    <div className="flex justify-end mt-2">
                      <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors">
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <button className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm rounded-xl transition-colors border border-red-100">
                  Revoke
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-purple-700 bg-purple-100 hover:bg-purple-200 font-bold text-sm rounded-xl transition-colors">
                  Request Changes
                </button>
                <button className="px-4 py-2 text-rose-700 bg-rose-100 hover:bg-rose-200 font-bold text-sm rounded-xl transition-colors">
                  Reject
                </button>
                <button className="px-6 py-2 text-white bg-emerald-600 hover:bg-emerald-700 font-bold text-sm rounded-xl transition-colors shadow-sm shadow-emerald-200">
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
