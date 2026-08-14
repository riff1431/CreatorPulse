'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle2, HelpCircle, Mail, Star, Shield, Lock, Wallet, Film } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCMS, CMSSection } from '@/lib/cms/cms-context';

const ICON_MAP: Record<string, React.ElementType> = {
  Star,
  Shield,
  Lock,
  Wallet,
  Film,
  Sparkles,
  CheckCircle2,
};

export default function PublicCMSPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { getPageBySlug } = useCMS();
  const page = getPageBySlug(slug);

  if (!page || (page.status !== 'published' && process.env.NODE_ENV === 'production')) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFF9FC]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-4">404 - Page Not Found</h1>
          <p className="text-slate-600 mb-8">The requested page does not exist or has been unpublished by system administrators.</p>
          <Link href="/feed">
            <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all">
              Return to Home Feed
            </button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9FC] text-slate-900">
      <Navbar />

      <main className="flex-1">
        {page.sections.map((sec) => (
          <section key={sec.id} className="py-12 px-4 lg:px-8 max-w-6xl mx-auto">
            {/* HERO SECTION */}
            {sec.type === 'hero' && (
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 lg:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  {sec.title && <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight">{sec.title}</h1>}
                  {sec.subtitle && <p className="text-indigo-200 text-base lg:text-lg leading-relaxed">{sec.subtitle}</p>}
                  {sec.ctaText && sec.ctaLink && (
                    <div className="pt-4">
                      <Link href={sec.ctaLink}>
                        <button className="px-6 py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-black rounded-2xl shadow-lg shadow-pink-500/25 transition-all flex items-center gap-2 text-sm">
                          {sec.ctaText} <ArrowRight size={16} />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
                {sec.mediaUrl && (
                  <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-xl border border-white/10">
                    <img src={sec.mediaUrl} alt={sec.title || 'Hero Media'} className="w-full h-64 lg:h-80 object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* FEATURE GRID */}
            {sec.type === 'feature_grid' && (
              <div className="space-y-8">
                {(sec.title || sec.subtitle) && (
                  <div className="text-center max-w-2xl mx-auto space-y-2">
                    {sec.title && <h2 className="text-2xl lg:text-3xl font-black">{sec.title}</h2>}
                    {sec.subtitle && <p className="text-slate-600 text-sm font-medium">{sec.subtitle}</p>}
                  </div>
                )}
                {sec.cards && sec.cards.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sec.cards.map((card, i) => {
                      const IconComp = (card.icon && ICON_MAP[card.icon]) || Sparkles;
                      return (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-pink-100 shadow-sm hover:shadow-md transition-all space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <IconComp size={20} />
                          </div>
                          <h3 className="font-extrabold text-base text-slate-900">{card.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">{card.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* RICH TEXT */}
            {sec.type === 'rich_text' && (
              <div className="bg-white p-8 lg:p-12 rounded-3xl border border-pink-100 shadow-sm max-w-4xl mx-auto space-y-4">
                {sec.title && <h2 className="text-2xl font-black text-slate-900">{sec.title}</h2>}
                {sec.content && (
                  <div
                    className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sec.content }}
                  />
                )}
              </div>
            )}

            {/* FAQ ACCORDION */}
            {sec.type === 'faq' && (
              <div className="bg-white p-8 lg:p-12 rounded-3xl border border-pink-100 shadow-sm max-w-4xl mx-auto space-y-6">
                {(sec.title || sec.subtitle) && (
                  <div className="text-center space-y-1 border-b border-slate-100 pb-4">
                    {sec.title && <h2 className="text-2xl font-black">{sec.title}</h2>}
                    {sec.subtitle && <p className="text-slate-600 text-xs">{sec.subtitle}</p>}
                  </div>
                )}
                {sec.faqs && sec.faqs.length > 0 && (
                  <div className="space-y-4">
                    {sec.faqs.map((faq, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <HelpCircle size={16} className="text-indigo-600 shrink-0" />
                          {faq.question}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CALL TO ACTION BANNER */}
            {sec.type === 'cta_banner' && (
              <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white rounded-3xl p-8 lg:p-12 text-center shadow-xl space-y-4">
                {sec.title && <h2 className="text-3xl font-black">{sec.title}</h2>}
                {sec.subtitle && <p className="text-white/90 text-sm max-w-xl mx-auto">{sec.subtitle}</p>}
                {sec.ctaText && sec.ctaLink && (
                  <div className="pt-2">
                    <Link href={sec.ctaLink}>
                      <button className="px-8 py-3.5 bg-white text-indigo-950 font-black rounded-2xl shadow-lg hover:bg-slate-100 transition-all text-sm">
                        {sec.ctaText}
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* CONTACT FORM */}
            {sec.type === 'contact_form' && (
              <div className="bg-white p-8 lg:p-12 rounded-3xl border border-pink-100 shadow-sm max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black">{sec.title || 'Contact Support'}</h2>
                  <p className="text-slate-600 text-xs">{sec.subtitle || 'Send us a message and we will respond promptly.'}</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); alert('Thank you! Your message has been sent.'); }} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Your Full Name</label>
                    <input type="text" required placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address</label>
                    <input type="email" required placeholder="john@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Message</label>
                    <textarea rows={4} required placeholder="How can we help?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 resize-none" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all">
                    Send Message
                  </button>
                </form>
              </div>
            )}
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}
