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
      <div className="bg-[#FFF1F7]/80 border-b border-[#F3DCE8] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-[#EC4899]" />
          <span className="font-bold text-[#18181B]">Database Engine:</span>
          {configured ? (
            <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 size={12} /> Connected Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#BE185D] font-bold bg-[#FCE7F3] px-2 py-0.5 rounded-full border border-[#FBCFE8]">
              <AlertCircle size={12} /> Local Reactive Engine (Ready for Live Supabase Key)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSqlModal(true)}
            className="text-[#71717A] hover:text-[#EC4899] font-medium transition-colors flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <Code size={13} /> View Supabase SQL Schema
          </button>
          <a
            href="/database"
            className="text-[#71717A] hover:text-[#EC4899] font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>Database Inspector</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto border border-[#F3DCE8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F3DCE8] pb-3">
              <div className="flex items-center gap-2">
                <Database className="text-[#EC4899]" size={20} />
                <h3 className="text-lg font-extrabold text-[#18181B]">Supabase Database Setup Guide</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-[#71717A] hover:text-[#18181B] p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#52525B]">
              <p>
                This application includes a complete PostgreSQL migration script located in{' '}
                <code className="text-[#BE185D] bg-[#FCE7F3] px-2 py-0.5 rounded-md font-mono text-xs font-bold">
                  supabase/schema.sql
                </code>
                .
              </p>

              <div className="bg-[#FFF9FC] p-4 rounded-2xl border border-[#F3DCE8] space-y-2">
                <h4 className="font-bold text-[#18181B] text-xs uppercase tracking-wider">
                  Quick Connection Steps:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#71717A] font-medium">
                  <li>Create a new project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#EC4899] underline font-bold">Supabase Dashboard</a>.</li>
                  <li>Open the <strong>SQL Editor</strong> tab in Supabase.</li>
                  <li>Paste the contents of <code className="text-[#BE185D]">supabase/schema.sql</code> and click <strong>Run</strong>.</li>
                  <li>Copy your Project URL and Anon API key into <code className="text-[#BE185D]">.env.local</code>.</li>
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
