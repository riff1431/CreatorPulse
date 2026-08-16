'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Edit3, Eye, Smartphone, Monitor, Send, Save, 
  RefreshCw, Check, Code, Sparkles, AlertCircle, ToggleLeft, ToggleRight, 
  HelpCircle, Layers
} from 'lucide-react';
import { 
  getEmailTemplates, 
  saveEmailTemplate, 
  renderEmailTemplatePreview, 
  EmailTemplate, 
  EmailTemplateVariable, 
  COMMON_VARIABLES 
} from '@/lib/email/email-template-store';
import { Card } from '@/components/admin/ui/Card';
import { Button } from '@/components/admin/ui/Button';
import { Badge } from '@/components/admin/ui/Badge';
import { Modal } from '@/components/admin/ui/Modal';
import { getActiveProvider } from '@/lib/email/smtp-store';
import { appendDeliveryLog } from '@/lib/email/delivery-log-store';
import { useToast } from '@/components/ui/Toast';
import { RoleGuard } from '@/components/auth/RoleGuard';
import Link from 'next/link';

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);

  // Editor states
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [enabled, setEnabled] = useState(true);

  // Preview & View states
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isTestSendOpen, setIsTestSendOpen] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState('admin@creatorpulse.com');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const { showToast } = useToast();

  const loadTemplates = () => {
    const list = getEmailTemplates();
    setTemplates(list);
    if (list.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(list[0].id);
      loadTemplateIntoEditor(list[0]);
    } else if (selectedTemplateId) {
      const match = list.find(t => t.id === selectedTemplateId);
      if (match) loadTemplateIntoEditor(match);
    }
  };

  const loadTemplateIntoEditor = (tpl: EmailTemplate) => {
    setActiveTemplate(tpl);
    setSubject(tpl.subject);
    setBodyHtml(tpl.bodyHtml);
    setEnabled(tpl.enabled);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tpl = templates.find(t => t.id === id);
    if (tpl) loadTemplateIntoEditor(tpl);
  };

  const handleSaveTemplate = () => {
    if (!activeTemplate) return;
    const updated: EmailTemplate = {
      ...activeTemplate,
      subject,
      bodyHtml,
      enabled
    };
    saveEmailTemplate(updated);
    setActiveTemplate(updated);
    showToast(`Template "${updated.name}" updated successfully!`, 'success');
    loadTemplates();
  };

  const handleToggleEnable = () => {
    if (!activeTemplate) return;
    const nextState = !enabled;
    setEnabled(nextState);
    const updated: EmailTemplate = {
      ...activeTemplate,
      subject,
      bodyHtml,
      enabled: nextState
    };
    saveEmailTemplate(updated);
    setActiveTemplate(updated);
    showToast(`Template "${updated.name}" is now ${nextState ? 'ENABLED' : 'DISABLED'}.`, nextState ? 'success' : 'info');
    loadTemplates();
  };

  const handleInsertVariableToSubject = (varKey: string) => {
    setSubject(prev => `${prev} ${varKey}`);
    showToast(`Inserted variable ${varKey} to subject.`, 'info');
  };

  const handleInsertVariableToBody = (varKey: string) => {
    setBodyHtml(prev => `${prev}\n${varKey}`);
    showToast(`Inserted variable ${varKey} to HTML body.`, 'info');
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientEmail || !activeTemplate) return;
    setIsSendingTest(true);

    const activeProvider = getActiveProvider();
    const providerName = activeProvider ? activeProvider.name : 'System Default Mailer';
    const providerId = activeProvider ? activeProvider.id : null;

    try {
      const res = await fetch('/api/admin/smtp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          providerName,
          toEmail: testRecipientEmail,
          subject: renderedPreview.subject,
          templateSlug: activeTemplate.slug,
          templateName: activeTemplate.name,
          fromName: activeProvider?.fromName || 'CreatorPulse',
          fromEmail: activeProvider?.fromEmail || 'noreply@creatorpulse.com',
          provider: activeProvider?.provider || 'custom',
          apiKey: activeProvider?.apiKey || '',
        }),
      });

      const data = await res.json();
      if (data.success) {
        appendDeliveryLog({
          providerId,
          providerName,
          templateSlug: activeTemplate.slug,
          templateName: activeTemplate.name,
          recipientEmail: testRecipientEmail,
          subject: renderedPreview.subject,
          status: 'sent',
          errorMessage: null,
          messageId: data.messageId || `msg_${Date.now()}`,
          deliveredAt: new Date().toISOString(),
          meta: { sentVia: providerName },
        });
        showToast(`Test email dispatched to ${testRecipientEmail} via ${providerName}!`, 'success');
      } else {
        appendDeliveryLog({
          providerId,
          providerName,
          templateSlug: activeTemplate.slug,
          templateName: activeTemplate.name,
          recipientEmail: testRecipientEmail,
          subject: renderedPreview.subject,
          status: 'failed',
          errorMessage: data.error || 'Failed to dispatch email.',
          messageId: null,
          deliveredAt: null,
          meta: { sentVia: providerName },
        });
        showToast(`Send failed: ${data.error || 'Check SMTP provider status.'}`, 'error');
      }
    } catch {
      showToast('Network error dispatching test email.', 'error');
    } finally {
      setIsSendingTest(false);
      setIsTestSendOpen(false);
    }
  };

  const renderedPreview = activeTemplate 
    ? renderEmailTemplatePreview({ ...activeTemplate, subject, bodyHtml }) 
    : { subject: '', bodyHtml: '' };

  const allVars = activeTemplate ? activeTemplate.variables : COMMON_VARIABLES;

  return (
    <RoleGuard
      requiredPermission="manage_settings"
      fallbackTitle="Access Restricted"
      fallbackMessage="You need administrator settings permissions to edit system email templates."
    >
      <div className="max-w-7xl mx-auto space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="text-indigo-600" size={24} />
              <h1 className="text-xl font-black text-[#18181B] tracking-tight">Dynamic Email Template Manager</h1>
            </div>
            <p className="text-xs text-[#71717A] mt-1 font-medium">
              Configure system emails for signups, email verifications, password resets, VIP membership confirmations, payout notifications, and announcements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/email-manager"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
              <Sparkles size={13} />
              SMTP &amp; Delivery Logs
            </Link>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Send size={13} />}
              onClick={() => setIsTestSendOpen(true)}
              disabled={!activeTemplate}
            >
              Test Send Email
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save size={13} />}
              onClick={handleSaveTemplate}
              disabled={!activeTemplate}
            >
              Save Template Changes
            </Button>
          </div>
        </div>

        {/* Main Grid: Left Template List, Right Editor & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: List of Templates */}
          <div className="lg:col-span-4 space-y-3">
            <Card className="p-3 bg-slate-50/50 border-slate-200">
              <h3 className="text-xs font-black uppercase text-[#71717A] tracking-wider px-2 mb-2 flex items-center gap-1.5">
                <Layers size={13} className="text-indigo-600" />
                Available Email Templates ({templates.length})
              </h3>
              <div className="space-y-1">
                {templates.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-xs text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 font-bold'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate">{tpl.name}</p>
                        <p className={`text-[10px] mt-0.5 font-mono ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {tpl.slug}
                        </p>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        tpl.enabled 
                          ? isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                          : isSelected ? 'bg-rose-900/40 text-rose-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {tpl.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Panel: Template Editor & Live Preview */}
          <div className="lg:col-span-8 space-y-4">
            {activeTemplate ? (
              <Card className="space-y-5 border-slate-200 shadow-sm p-5">
                {/* Editor Header & Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h2 className="text-base font-black text-slate-900">{activeTemplate.name}</h2>
                    <p className="text-[11px] text-slate-500 font-mono">Template Identifier: {activeTemplate.slug}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Enable / Disable Switch */}
                    <button
                      onClick={handleToggleEnable}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-bold cursor-pointer"
                    >
                      {enabled ? (
                        <>
                          <ToggleRight size={18} className="text-emerald-600" />
                          <span className="text-emerald-700 font-extrabold">Active & Enabled</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={18} className="text-slate-400" />
                          <span className="text-slate-500 font-bold">Disabled</span>
                        </>
                      )}
                    </button>

                    {/* View Switcher Tabs (Edit Code vs Interactive Preview) */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setActiveTab('edit')}
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          activeTab === 'edit' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Code size={13} />
                        Template Editor
                      </button>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Eye size={13} />
                        Live Preview
                      </button>
                    </div>
                  </div>
                </div>

                {/* Variable Insertion Toolbar */}
                <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                      <Sparkles size={12} className="text-indigo-600" />
                      Template Variables (Click chip to insert into subject/body)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allVars.map((v) => (
                      <div key={v.key} className="flex items-center gap-1 bg-white border border-indigo-200/80 rounded-lg px-2.5 py-1 text-[11px] font-mono shadow-2xs">
                        <span className="font-bold text-indigo-700">{v.key}</span>
                        <button
                          title={`Insert ${v.key} into Subject`}
                          onClick={() => handleInsertVariableToSubject(v.key)}
                          className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-1 py-0.2 rounded font-sans font-bold cursor-pointer ml-1"
                        >
                          +Subject
                        </button>
                        <button
                          title={`Insert ${v.key} into HTML Body`}
                          onClick={() => handleInsertVariableToBody(v.key)}
                          className="text-[9px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-sans font-bold cursor-pointer"
                        >
                          +Body
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editor Mode */}
                {activeTab === 'edit' && (
                  <div className="space-y-4">
                    {/* Subject Line Editor */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                        <span>Email Subject Line</span>
                        <span className="text-[10px] text-slate-400 font-medium">Supports variable interpolation</span>
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject title..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold shadow-xs"
                      />
                    </div>

                    {/* HTML Body Editor */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                        <span>HTML Body Template Code</span>
                        <span className="text-[10px] text-slate-400 font-medium">Inline styled responsive HTML</span>
                      </label>
                      <textarea
                        value={bodyHtml}
                        onChange={(e) => setBodyHtml(e.target.value)}
                        rows={16}
                        className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700"
                      />
                    </div>
                  </div>
                )}

                {/* Live Preview Mode */}
                {activeTab === 'preview' && (
                  <div className="space-y-4">
                    {/* Device Toggle & Subject Display */}
                    <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">Rendered Subject:</span>
                        <p className="font-extrabold text-slate-900 truncate">{renderedPreview.subject}</p>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shrink-0">
                        <button
                          onClick={() => setPreviewDevice('desktop')}
                          className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer ${
                            previewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Monitor size={14} />
                          Desktop
                        </button>
                        <button
                          onClick={() => setPreviewDevice('mobile')}
                          className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer ${
                            previewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Smartphone size={14} />
                          Mobile
                        </button>
                      </div>
                    </div>

                    {/* Frame Preview Wrapper */}
                    <div className="flex justify-center bg-slate-200/60 p-6 rounded-2xl border border-slate-300">
                      <div 
                        className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 ${
                          previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[650px]'
                        }`}
                      >
                        <iframe
                          srcDoc={renderedPreview.bodyHtml}
                          title="Email Live Render Preview"
                          className="w-full min-h-[500px] border-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="py-16 text-center text-slate-500 font-bold">
                Select an email template from the left list to edit or preview.
              </Card>
            )}
          </div>
        </div>

        {/* Modal: Test Send Email */}
        <Modal
          isOpen={isTestSendOpen}
          onClose={() => setIsTestSendOpen(false)}
          title="Send Sample Test Email"
        >
          <form onSubmit={handleSendTestEmail} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900">
              <p className="font-extrabold">Dispatch Test Email Simulation</p>
              <p className="mt-1 text-[11px] leading-relaxed">
                This will render template <strong>"{activeTemplate?.name}"</strong> with active variables interpolated and send a simulated HTML email payload.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Recipient Email Address</label>
              <input
                type="email"
                required
                value={testRecipientEmail}
                onChange={(e) => setTestRecipientEmail(e.target.value)}
                placeholder="admin@creatorpulse.com"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsTestSendOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={isSendingTest} leftIcon={<Send size={13} />}>
                {isSendingTest ? 'Sending Test...' : 'Send Test Email'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
