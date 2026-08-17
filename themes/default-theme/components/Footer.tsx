'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '@/lib/settings/site-settings-context';

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings();

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
    }, 800);
  };

  const siteName = settings.site_name || 'CreatorPulse';

  return (
    <footer className="bg-[var(--color-primary)] text-white mt-auto font-sans relative overflow-hidden pt-24">
      {/* Top Gradient/Fade effect to blend with page content */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-[12vw]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          
          {/* Left Column: Brand & Socials */}
          <div className="lg:col-span-2 space-y-7 pr-4">
            <Link href="/" className="flex items-center gap-3 group select-none w-fit">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={siteName} className="h-11 w-auto object-contain rounded-xl bg-white p-1.5 shadow-lg group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-12 h-12 rounded-[14px] bg-white/20 backdrop-blur-md flex items-center justify-center p-1.5 shadow-lg group-hover:scale-105 transition-transform duration-300 border border-white/10">
                  <div className="w-full h-full rounded-lg bg-white" />
                </div>
              )}
              <span className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                {siteName}
              </span>
            </Link>

            <p className="text-white/80 text-[15px] max-w-xs leading-relaxed font-medium">
              Your Digital Growth<br/>Partners.
            </p>

            <div className="flex items-center gap-3.5 pt-2">
              <a href={social.twitter || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#EC4899] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-white/5 backdrop-blur-sm" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current opacity-90" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={(social as any).facebook || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#EC4899] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-white/5 backdrop-blur-sm" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current opacity-90" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={social.instagram || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#EC4899] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-white/5 backdrop-blur-sm" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current opacity-90" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href={(social as any).linkedin || '#'} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-[#EC4899] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-white/5 backdrop-blur-sm" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current opacity-90" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="space-y-6">
            <h4 className="font-bold text-white text-[15px] tracking-wide">Services</h4>
            <ul className="space-y-4 text-[14px] text-white/70 font-medium">
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">What We Offer</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Case Studies</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Blog & Insights</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Resources</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">FAQs</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-white text-[15px] tracking-wide">Company</h4>
            <ul className="space-y-4 text-[14px] text-white/70 font-medium">
              <li><Link href="/" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Home</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">About</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Testimonials</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Pricing</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-white text-[15px] tracking-wide">Legal Links</h4>
            <ul className="space-y-4 text-[14px] text-white/70 font-medium">
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Disclaimer</Link></li>
              <li><Link href="#" className="hover:text-white transition-all duration-300 hover:translate-x-1.5 inline-block">Copyright</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-white text-[15px] tracking-wide">Subscribe to our newsletter</h4>
            {isSubscribed ? (
               <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl flex items-center gap-3 text-white border border-white/20 shadow-xl">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold">Thank you for subscribing!</span>
                </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-white/10 backdrop-blur-md border border-white/10 focus:border-white/40 focus:bg-white/15 rounded-full px-5 py-3.5 text-sm text-white placeholder-white/60 focus:outline-none transition-all shadow-inner group-hover:bg-white/15"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-[var(--color-primary)] hover:bg-white/90 hover:scale-[1.02] hover:shadow-xl font-bold rounded-full px-5 py-3.5 text-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-80 disabled:hover:scale-100"
                >
                  <span>{isSubmitting ? 'Subscribing...' : 'Subscribe'}</span>
                  {!isSubmitting && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Big Background Text */}
      <div className="absolute -bottom-[2vw] left-0 w-full overflow-hidden flex justify-center pointer-events-none select-none mix-blend-overlay opacity-30">
        <h1 className="text-[18vw] font-black text-white leading-none tracking-tighter mx-auto whitespace-nowrap text-center">
          {siteName}
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
