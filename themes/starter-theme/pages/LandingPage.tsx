import React from 'react';
import ThemeButton from '../components/Button';
import { CreatorBadge } from '../partials/CreatorBadge';

/**
 * Starter Theme Template Landing Page
 * Showcases visual features of the Theme SDK, including design token styling,
 * responsive grids, dynamic hover states, and card structures.
 */
export const ThemeLandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-soft-primary)] text-[var(--color-primary)] text-xs font-bold transition-all">
          <span>✨</span>
          <span>Theme Engine Active</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-[var(--color-text-primary)]">
          Craft Gorgeous Portals for Your{' '}
          <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
            Creator Community
          </span>
        </h1>
        <p className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed">
          Welcome to your newly installed custom theme. This page demonstrates a fully functional template utilizing design tokens, radius bindings, and components.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <ThemeButton className="px-6 py-3 text-sm font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all shadow-md transform hover:scale-[1.02]">
            Get Started
          </ThemeButton>
          <ThemeButton className="px-6 py-3 text-sm font-bold bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]/40 transition-all border border-[var(--color-border)]/50">
            Read Docs
          </ThemeButton>
        </div>
      </section>

      {/* Feature Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: '🎨',
            title: 'Design Tokens',
            desc: 'Configurable color palettes, border radii, and typography scales fully isolated in a declarative manifest.',
          },
          {
            icon: '📦',
            title: 'ZIP Packages',
            desc: 'ZIP-install compatible format allowing developers to pack, export, and import structures without server reloads.',
          },
          {
            icon: '⚡',
            title: 'Dynamic Assets',
            desc: 'Support for custom layouts, stylesheets, page overrides, translation files, and javascript effects.',
          },
        ].map((feat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-[var(--radius-card)] bg-[var(--color-surface-secondary)] border border-[var(--color-border)]/30 hover:border-[var(--color-primary)]/40 transition-all duration-300 group hover:shadow-xs text-left"
          >
            <span className="text-3xl inline-block mb-4 transition-transform group-hover:scale-110">{feat.icon}</span>
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-2">{feat.title}</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Dynamic Token Tester */}
      <section className="p-6 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)]/60 space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[var(--color-text-primary)]">Live Token Verification</h3>
          <CreatorBadge name="Verified Creator" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
          {[
            { label: 'Primary Color', style: { backgroundColor: 'var(--color-primary)', color: '#fff' } },
            { label: 'Primary Hover', style: { backgroundColor: 'var(--color-primary-hover)', color: '#fff' } },
            { label: 'Soft Primary', style: { backgroundColor: 'var(--color-soft-primary)', color: 'var(--color-primary)' } },
            { label: 'Accent Color', style: { backgroundColor: 'var(--color-accent)', color: '#fff' } },
          ].map((item, idx) => (
            <div
              key={idx}
              style={item.style}
              className="p-4 rounded-[var(--radius-button)] text-center shadow-xs border border-black/5"
            >
              {item.label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ThemeLandingPage;
