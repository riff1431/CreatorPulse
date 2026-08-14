'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Phone, MapPin, MessageCircle, Globe, Share2 } from 'lucide-react';
import { useSiteSettings } from '@/lib/settings/site-settings-context';
import { useNavigation } from '@/lib/navigation/navigation-context';
import { useAuth } from '@/lib/auth/auth-context';

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  const { getFooterItems } = useNavigation();
  const { role } = useAuth();

  const footerLinks = getFooterItems(role || 'guest');
  const social = settings.social_links || {};

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-3 md:col-span-1">
          <Link href="/feed" className="flex items-center gap-2">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name} className="h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center shadow-md">
                <Sparkles className="text-white" size={16} />
              </div>
            )}
            <span className="text-base font-black text-white">{settings.site_name}</span>
          </Link>
          <p className="text-slate-400 text-[11px] leading-relaxed font-medium">{settings.tagline}</p>

          {/* Social Links */}
          <div className="flex items-center gap-2 pt-2 text-slate-400">
            {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors" title="Twitter / X">
                <Share2 size={14} />
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 hover:bg-pink-600 hover:text-white rounded-lg transition-colors" title="Instagram">
                <Globe size={14} />
              </a>
            )}
            {social.youtube && (
              <a href={social.youtube} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 hover:bg-rose-600 hover:text-white rounded-lg transition-colors" title="YouTube">
                <Globe size={14} />
              </a>
            )}
            {social.discord && (
              <a href={social.discord} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors" title="Discord">
                <MessageCircle size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Links */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-xs tracking-wider uppercase">Platform Navigation</h4>
          <ul className="space-y-2 text-slate-400">
            {footerLinks.map((item) => (
              <li key={item.id}>
                <Link href={item.url} target={item.target || '_self'} className="hover:text-white transition-colors">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-xs tracking-wider uppercase">Contact Support</h4>
          <ul className="space-y-2 text-slate-400 text-[11px]">
            {settings.contact_email && (
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-indigo-400 shrink-0" />
                <span>{settings.contact_email}</span>
              </li>
            )}
            {settings.contact_phone && (
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-indigo-400 shrink-0" />
                <span>{settings.contact_phone}</span>
              </li>
            )}
            {settings.contact_address && (
              <li className="flex items-start gap-2">
                <MapPin size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>{settings.contact_address}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Newsletter / System Status */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-xs tracking-wider uppercase">Platform Status</h4>
          <p className="text-slate-400 text-[11px]">All core systems operational. Database engine synced.</p>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live v2.5
            </span>
            <span className="text-slate-400">Supabase DB</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{settings.copyright_text}</span>
          <div className="flex items-center gap-4">
            <Link href="/p/terms" className="hover:text-slate-300">Terms</Link>
            <Link href="/p/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/p/help" className="hover:text-slate-300">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
