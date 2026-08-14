'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Plus, Trash2, ArrowUp, ArrowDown, Layout, 
  Search, Eye, Sparkles, Layers, Image as ImageIcon, HelpCircle, MessageSquare
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { useCMS, CMSPage, CMSSection, SectionType } from '@/lib/cms/cms-context';
import { useToast } from '@/components/ui/Toast';

export default function CMSEditorPage({ params }: { params?: Promise<{ id: string }> }) {
  const resolvedParams = params ? use(params) : undefined;
  const pageId = resolvedParams?.id;
  const router = useRouter();
  const { getPageById, savePage } = useCMS();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'seo'>('builder');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pageId) {
      const existing = getPageById(pageId);
      if (existing) {
        setTitle(existing.title);
        setSlug(existing.slug);
        setStatus(existing.status);
        setSeoTitle(existing.seoTitle || '');
        setSeoDescription(existing.seoDescription || '');
        setSeoKeywords(existing.seoKeywords || '');
        setOgImage(existing.ogImage || '');
        setSections(existing.sections || []);
      }
    }
  }, [pageId, getPageById]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!pageId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleAddSection = (type: SectionType) => {
    const newSec: CMSSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type,
      title: type === 'hero' ? 'Hero Title' : type === 'feature_grid' ? 'Key Features' : type === 'faq' ? 'Frequently Asked Questions' : 'Section Title',
      subtitle: 'Optional section subtitle text',
      content: type === 'rich_text' ? '<p>Add your rich text content here...</p>' : '',
      ctaText: 'Learn More',
      ctaLink: '#',
      cards: type === 'feature_grid' ? [
        { title: 'Feature 1', description: 'Description for feature item 1.', icon: 'Star' },
        { title: 'Feature 2', description: 'Description for feature item 2.', icon: 'Shield' }
      ] : [],
      faqs: type === 'faq' ? [
        { question: 'What is CreatorPulse?', answer: 'CreatorPulse is a modern membership SaaS platform for creators.' }
      ] : []
    };
    setSections([...sections, newSec]);
  };

  const handleUpdateSection = (id: string, updatedFields: Partial<CMSSection>) => {
    setSections(sections.map((sec) => (sec.id === id ? { ...sec, ...updatedFields } : sec)));
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter((sec) => sec.id !== id));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSecs = [...sections];
    const temp = newSecs[index];
    newSecs[index] = newSecs[targetIndex];
    newSecs[targetIndex] = temp;
    setSections(newSecs);
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      addToast({ title: 'Validation Error', message: 'Page Title and Slug are required.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const saved = await savePage({
        id: pageId,
        title,
        slug,
        status,
        seoTitle: seoTitle || title,
        seoDescription,
        seoKeywords,
        ogImage,
        sections,
      });
      addToast({ title: 'Page Saved!', message: `Custom page "${saved.title}" saved successfully.`, type: 'success' });
      router.push('/admin/cms');
    } catch (e) {
      addToast({ title: 'Save Failed', message: 'Error saving page.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/cms">
            <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
              <ArrowLeft size={16} />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {pageId ? `Edit Page: ${title || 'Untitled'}` : 'Create New Custom Page'}
            </h1>
            <p className="text-xs text-slate-500">
              Build responsive custom pages with reusable content sections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="draft">Status: DRAFT</option>
            <option value="published">Status: PUBLISHED</option>
            <option value="archived">Status: ARCHIVED</option>
          </select>

          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={14} />}>
            Save Page
          </Button>
        </div>
      </div>

      {/* Main Settings Card */}
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Page Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Creator Guidelines"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">URL Slug</label>
            <div className="flex items-center">
              <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2 rounded-l-xl text-slate-500 font-mono text-[11px]">
                /p/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="creator-guidelines"
                className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'builder'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Section Builder ({sections.length})
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          SEO Meta Settings
        </button>
      </div>

      {/* TAB 1: Section Builder */}
      {activeTab === 'builder' && (
        <div className="space-y-4">
          {/* Add Section Palette */}
          <Card className="p-4 bg-indigo-50/50 border-indigo-100 space-y-2">
            <span className="text-xs font-extrabold text-indigo-900 block">Add New Reusable Content Section:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'hero', label: '+ Hero Banner', icon: Layout },
                { type: 'rich_text', label: '+ Rich Text', icon: Layers },
                { type: 'feature_grid', label: '+ Feature Grid', icon: Sparkles },
                { type: 'faq', label: '+ FAQ Accordion', icon: HelpCircle },
                { type: 'cta_banner', label: '+ Call-To-Action', icon: MessageSquare },
                { type: 'media', label: '+ Media Embed', icon: ImageIcon },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleAddSection(item.type as SectionType)}
                  className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Sections List */}
          {sections.length === 0 ? (
            <Card className="p-12 text-center text-slate-400 text-xs">
              No sections added yet. Click one of the buttons above to insert a content section!
            </Card>
          ) : (
            sections.map((sec, index) => (
              <Card key={sec.id} className="p-5 space-y-4 border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      {sec.type.replace('_', ' ')} SECTION
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveSection(index, 'up')}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      disabled={index === sections.length - 1}
                      onClick={() => handleMoveSection(index, 'down')}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer ml-2"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Section Form Fields */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Section Title</label>
                    <input
                      type="text"
                      value={sec.title || ''}
                      onChange={(e) => handleUpdateSection(sec.id, { title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                    />
                  </div>

                  {sec.type !== 'rich_text' && (
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Section Subtitle</label>
                      <input
                        type="text"
                        value={sec.subtitle || ''}
                        onChange={(e) => handleUpdateSection(sec.id, { subtitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                      />
                    </div>
                  )}

                  {sec.type === 'rich_text' && (
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">HTML / Markdown Content</label>
                      <textarea
                        rows={5}
                        value={sec.content || ''}
                        onChange={(e) => handleUpdateSection(sec.id, { content: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs"
                      />
                    </div>
                  )}

                  {(sec.type === 'hero' || sec.type === 'cta_banner') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">CTA Button Label</label>
                        <input
                          type="text"
                          value={sec.ctaText || ''}
                          onChange={(e) => handleUpdateSection(sec.id, { ctaText: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">CTA Button Link</label>
                        <input
                          type="text"
                          value={sec.ctaLink || ''}
                          onChange={(e) => handleUpdateSection(sec.id, { ctaLink: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {(sec.type === 'hero' || sec.type === 'media') && (
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Media / Image URL</label>
                      <input
                        type="text"
                        value={sec.mediaUrl || ''}
                        onChange={(e) => handleUpdateSection(sec.id, { mediaUrl: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: SEO Settings */}
      {activeTab === 'seo' && (
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">SEO Meta Configuration</h3>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Page Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Leave blank to use page title"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium resize-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Meta Keywords</label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="comma-separated tags"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Social Sharing Image (OG Image)</label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
