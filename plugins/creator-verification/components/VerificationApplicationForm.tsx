'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, Plus, AlertTriangle, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

interface LinkEntry {
  platform: string;
  url: string;
}

export default function VerificationApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [socialLinks, setSocialLinks] = useState<LinkEntry[]>([{ platform: 'Instagram', url: '' }]);
  const [notes, setNotes] = useState('');

  // File states (mocking files with names for display)
  const [govId, setGovId] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [poa, setPoa] = useState<File | null>(null);

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
    'France', 'Japan', 'South Korea', 'Brazil', 'Mexico', 'India', 'Sweden'
  ];

  const handleAddLink = () => {
    setSocialLinks([...socialLinks, { platform: 'Instagram', url: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: keyof LinkEntry, value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  const handleFileDrop = (e: React.DragEvent, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setter(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock submission
    setTimeout(() => {
      setLoading(false);
      setStatus('success');
    }, 1500);
  };

  const renderFileUploader = (label: string, file: File | null, setFile: React.Dispatch<React.SetStateAction<File | null>>) => (
    <div className="col-span-1">
      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">{label}</label>
      {file ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-emerald-800 truncate">{file.name}</p>
              <p className="text-[10px] text-emerald-600">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-emerald-100 rounded-md text-emerald-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          onDragOver={(e) => e.preventDefault()} 
          onDrop={(e) => handleFileDrop(e, setFile)}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-pink-400 hover:bg-pink-50/50 transition-all cursor-pointer group"
          onClick={() => document.getElementById(`file-${label.replace(/\s/g, '')}`)?.click()}
        >
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors mb-3">
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-pink-600" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">Click to upload or drag & drop</p>
          <p className="text-xs text-slate-500">JPG, PNG, PDF (Max 10MB)</p>
          <input 
            type="file" 
            id={`file-${label.replace(/\s/g, '')}`} 
            className="hidden" 
            onChange={(e) => handleFileChange(e, setFile)} 
            accept="image/*,.pdf" 
          />
        </div>
      )}
    </div>
  );

  if (status === 'success') {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted Successfully!</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Your verification application is now under review. We typically process requests within 2-3 business days. We will notify you once a decision is made.
        </p>
        <button onClick={() => setStatus('idle')} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Creator Verification</h2>
        <p className="text-slate-400 text-sm">Submit your details to get the verified badge and unlock premium features.</p>
        
        {/* Status Tracker */}
        <div className="flex items-center gap-2 mt-8">
          <div className="flex items-center gap-2 text-pink-400">
            <div className="w-6 h-6 rounded-full border-2 border-pink-400 flex items-center justify-center text-xs font-bold bg-pink-400/20">1</div>
            <span className="text-xs font-bold uppercase tracking-wide">Submit Info</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 mx-2" />
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-xs font-bold uppercase tracking-wide">Review</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 mx-2" />
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-xs font-bold uppercase tracking-wide">Decision</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Personal Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Full Legal Name *</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="As it appears on your ID"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Date of Birth *</label>
              <input 
                type="date" 
                required
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Country of Residence *</label>
              <select 
                required
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all cursor-pointer appearance-none"
              >
                <option value="" disabled>Select your country</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Verification Documents</h3>
          <p className="text-xs text-slate-500 mb-4">Please upload clear, unedited photos or scans. All documents are securely encrypted.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderFileUploader('Government ID *', govId, setGovId)}
            {renderFileUploader('Selfie *', selfie, setSelfie)}
            {renderFileUploader('Proof of Address *', poa, setPoa)}
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-lg font-bold text-slate-900">Social Presence</h3>
            <button type="button" onClick={handleAddLink} className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Link
            </button>
          </div>
          
          <div className="space-y-3">
            {socialLinks.map((link, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <select 
                  value={link.platform}
                  onChange={e => handleLinkChange(idx, 'platform', e.target.value)}
                  className="w-32 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all cursor-pointer"
                >
                  <option>Instagram</option>
                  <option>Twitter</option>
                  <option>YouTube</option>
                  <option>TikTok</option>
                  <option>Twitch</option>
                  <option>Website</option>
                </select>
                <input 
                  type="url"
                  placeholder="https://..."
                  value={link.url}
                  onChange={e => handleLinkChange(idx, 'url', e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                />
                {socialLinks.length > 1 && (
                  <button type="button" onClick={() => handleRemoveLink(idx)} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Additional Information</h3>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Notes (Optional)</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any context you want to share with our review team..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all resize-y min-h-[100px]"
            ></textarea>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={loading || !govId || !selfie || !poa || !fullName || !dob || !country}
            className="px-8 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-pink-200 disabled:shadow-none flex items-center justify-center min-w-[200px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
