'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Mail, Phone, MapPin, MessageCircle, Globe, 
  Share2, ArrowUp, Send, CheckCircle2, ShieldCheck, Heart,
  Lock, ExternalLink, HelpCircle
} from 'lucide-react';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useNavigation } from '@/lib/navigation/navigation-context';
import { useAuth } from '@/lib/auth/auth-context';

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const { getFooterItems } = useNavigation();
  const { role } = useAuth();

  const footerNavLinks = getFooterItems ? getFooterItems(role || 'guest') : [];
  const social = settings.social_links || {};

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setNewsletterEmail('');
    }, 600);
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const siteName = settings.site_name || 'CreatorPulse';

  return (
    <footer className="bg-[#0B0F19] text-slate-300 border-t border-slate-800/80 text-xs mt-auto font-sans relative overflow-hidden">
      {/* Subtle background glow element */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Column 1: Brand, Tagline & Socials */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/feed" className="flex items-center gap-2.5 group select-none">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={siteName} className="h-9 w-auto max-w-[160px] object-contain rounded-xl" />
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center shadow-md shadow-pink-500/30 group-hover:scale-105 transition-transform duration-200">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <div>
                    <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                      {siteName}
                    </span>
                    <span className="text-[10px] text-pink-400 block -mt-1 font-bold tracking-wider uppercase">
                      Next-Gen Creator Economy
                    </span>
                  </div>
                </div>
              )}
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.seo_defaults?.default_meta_description || settings.tagline || 'Empowering creators worldwide with private feeds, paywalled drops, real-time streaming, and direct fan monetization.'}
            </p>

            {/* Newsletter Subscription Widget */}
            <div className="pt-2">
              <h4 className="font-bold text-white text-xs mb-2">Subscribe to Platform Updates</h4>
              {isSubscribed ? (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span className="text-xs font-semibold">Thank you! You are now subscribed.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-pink-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl transition-all shadow-md shadow-pink-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>{isSubmitting ? '...' : 'Join'}</span>
                    <Send size={12} />
                  </button>
                </form>
              )}
            </div>

            {/* Social Media Link Icons */}
            <div className="flex items-center gap-2 pt-2">
              {social.twitter && (
                <a 
                  href={social.twitter} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2.5 bg-slate-900 hover:bg-pink-600 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all hover:scale-105" 
                  title="Twitter / X"
                >
                  <Share2 size={14} />
                </a>
              )}
              {social.instagram && (
                <a 
                  href={social.instagram} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2.5 bg-slate-900 hover:bg-pink-600 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all hover:scale-105" 
                  title="Instagram"
                >
                  <Globe size={14} />
                </a>
              )}
              {social.discord && (
                <a 
                  href={social.discord} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2.5 bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all hover:scale-105" 
                  title="Discord Community"
                >
                  <MessageCircle size={14} />
                </a>
              )}
              {social.youtube && (
                <a 
                  href={social.youtube} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-2.5 bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all hover:scale-105" 
                  title="YouTube"
                >
                  <Globe size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Platform Discovery */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-slate-800 pb-2">
              Discovery
            </h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>
                <Link href="/feed" className="hover:text-pink-400 transition-colors">
                  Creator Feed
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-pink-400 transition-colors">
                  Explore Creators
                </Link>
              </li>
              <li>
                <Link href="/shorts" className="hover:text-pink-400 transition-colors">
                  Reels & Shorts
                </Link>
              </li>
              {footerNavLinks.map((item) => (
                <li key={item.id}>
                  <Link href={item.url} target={item.target || '_self'} className="hover:text-pink-400 transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Creators & Monetization */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-slate-800 pb-2">
              For Creators
            </h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li>
                <Link href="/creator/dashboard" className="hover:text-pink-400 transition-colors">
                  Creator Studio
                </Link>
              </li>
              <li>
                <Link href="/balance" className="hover:text-pink-400 transition-colors">
                  Payouts & Wallet
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-pink-400 transition-colors">
                  Become a Creator
                </Link>
              </li>
              <li>
                <Link href="/p/help" className="hover:text-pink-400 transition-colors">
                  Monetization Guide
                </Link>
              </li>
              <li>
                <Link href="/p/terms" className="hover:text-pink-400 transition-colors">
                  Creator Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & System Health */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase border-b border-slate-800 pb-2">
              Support & Trust
            </h4>
            
            {/* Contact details */}
            <ul className="space-y-2 text-slate-400 text-[11px]">
              {settings.contact_email && (
                <li className="flex items-center gap-2">
                  <Mail size={13} className="text-pink-400 shrink-0" />
                  <span className="truncate">{settings.contact_email}</span>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-pink-400 shrink-0" />
                  <span>{settings.contact_phone}</span>
                </li>
              )}
              {settings.contact_address && (
                <li className="flex items-start gap-2">
                  <MapPin size={13} className="text-pink-400 shrink-0 mt-0.5" />
                  <span>{settings.contact_address}</span>
                </li>
              )}
            </ul>

            {/* Platform Trust & Status Card */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Systems Live
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">99.99% Uptime</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] pt-1 border-t border-slate-800/80">
                <Lock size={11} className="text-pink-400" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-5 text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>{settings.copyright_text || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/p/terms" className="hover:text-slate-300 transition-colors">
              Terms
            </Link>
            <Link href="/p/privacy" className="hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link href="/p/help" className="hover:text-slate-300 transition-colors">
              Help Center
            </Link>
            
            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-pink-400 font-semibold cursor-pointer transition-colors"
              title="Back to Top"
            >
              <span>Top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
