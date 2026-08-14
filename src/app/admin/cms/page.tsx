'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, Plus, Search, Eye, Edit3, Trash2, Globe, CheckCircle2, 
  Clock, AlertCircle, Sparkles, ExternalLink, RefreshCw 
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { useCMS, CMSPage } from '@/lib/cms/cms-context';
import { useToast } from '@/components/ui/Toast';

export default function AdminCMSPage() {
  const { pages, deletePage, toggleStatus, resetToDefaults } = useCMS();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  const filteredPages = pages.filter((page) => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete custom page "${title}"?`)) {
      await deletePage(id);
      addToast({ title: 'Page Deleted', message: `Page "${title}" deleted.`, type: 'success' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="text-indigo-600" size={24} />
            <h1 className="text-2xl font-black text-[#18181B]">Dynamic Page & CMS Manager</h1>
          </div>
          <p className="text-xs text-[#71717A] mt-1 font-medium">
            Create, edit, publish, unpublish, and organize custom dynamic pages with modular content sections and SEO settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults} leftIcon={<RefreshCw size={14} />}>
            Reset Defaults
          </Button>
          <Link href="/admin/cms/editor">
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
              Create Custom Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Pages', count: pages.length },
            { id: 'published', label: 'Published', count: pages.filter((p) => p.status === 'published').length },
            { id: 'draft', label: 'Drafts', count: pages.filter((p) => p.status === 'draft').length },
            { id: 'archived', label: 'Archived', count: pages.filter((p) => p.status === 'archived').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or slug..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Pages Table / Grid */}
      <Card className="p-4 space-y-3">
        {filteredPages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No pages found matching your filter criteria. Click "Create Custom Page" to build your first page!
          </div>
        ) : (
          filteredPages.map((page) => (
            <div
              key={page.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100 shrink-0 mt-0.5">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{page.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        page.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : page.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {page.status.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                      {page.sections.length} Sections
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="font-mono text-indigo-600 font-semibold">/p/{page.slug}</span>
                    <span>•</span>
                    <span>Updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {page.status === 'published' && (
                  <Link href={`/p/${page.slug}`} target="_blank">
                    <Button variant="outline" size="sm" leftIcon={<ExternalLink size={14} />}>
                      View Page
                    </Button>
                  </Link>
                )}

                <button
                  onClick={() => toggleStatus(page.id, page.status === 'published' ? 'draft' : 'published')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    page.status === 'published'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {page.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>

                <Link href={`/admin/cms/editor/${page.id}`}>
                  <button className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 transition-colors cursor-pointer">
                    <Edit3 size={15} />
                  </button>
                </Link>

                <button
                  onClick={() => handleDelete(page.id, page.title)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
