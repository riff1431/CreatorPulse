'use client';

import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Code, ExternalLink, X } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from './ui/Button';

export const SupabaseStatusBanner: React.FC = () => {
  const [configured, setConfigured] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setConfigured(isSupabaseConfigured());
  }, []);

  const handleCopySchemaNotice = () => {
    navigator.clipboard.writeText(`-- Run this in your Supabase SQL Editor:
-- Find full schema in repository: supabase/schema.sql
CREATE TABLE public.profiles (...);
`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-cyan-400" />
          <span className="font-semibold text-slate-300">Supabase Engine:</span>
          {configured ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <CheckCircle2 size={12} /> Connected Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-cyan-400 font-medium bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
              <AlertCircle size={12} /> Local Reactive Engine (Ready for Live Key)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSqlModal(true)}
            className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 underline underline-offset-2"
          >
            <Code size={13} /> View Supabase SQL Schema
          </button>
          <a
            href="/database"
            className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <span>Database Inspector</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="text-cyan-400" size={20} />
                <h3 className="text-lg font-bold text-slate-100">Supabase Database Setup Guide</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <p>
                This application includes a complete PostgreSQL migration script located in{' '}
                <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                  supabase/schema.sql
                </code>
                .
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider text-cyan-400">
                  Quick Connection Steps:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400">
                  <li>Create a new project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">Supabase Dashboard</a>.</li>
                  <li>Open the <strong>SQL Editor</strong> tab in Supabase.</li>
                  <li>Paste the contents of <code className="text-cyan-300">supabase/schema.sql</code> and click <strong>Run</strong>.</li>
                  <li>Copy your Project URL and Anon API key into <code className="text-cyan-300">.env.local</code>.</li>
                </ol>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowSqlModal(false)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" leftIcon={<Copy size={14} />} onClick={handleCopySchemaNotice}>
                  {copied ? 'Copied to Clipboard!' : 'Copy Setup Command'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
