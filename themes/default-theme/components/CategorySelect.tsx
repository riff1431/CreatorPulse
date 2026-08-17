'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  Palette, 
  Dumbbell, 
  Briefcase, 
  Music, 
  ChevronDown, 
  Check,
  Sparkles
} from 'lucide-react';

export interface CategoryOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: 'Education & Tech',
    label: 'Education & Tech',
    icon: GraduationCap,
    description: 'Coding, AI, courses, & tech masterclasses'
  },
  {
    value: 'Art & Design',
    label: 'Art & Design',
    icon: Palette,
    description: 'UI/UX, digital illustration, & 3D art'
  },
  {
    value: 'Fitness & Wellness',
    label: 'Fitness & Wellness',
    icon: Dumbbell,
    description: 'Workouts, nutrition, & mental health'
  },
  {
    value: 'Business & Coaching',
    label: 'Business & Coaching',
    icon: Briefcase,
    description: 'Entrepreneurship, marketing, & career'
  },
  {
    value: 'Music & Sound',
    label: 'Music & Sound',
    icon: Music,
    description: 'Audio production, beats, & instruments'
  }
];

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CategorySelect({ value, onChange, className = '' }: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory = CATEGORY_OPTIONS.find((c) => c.value === value) || CATEGORY_OPTIONS[0];
  const SelectedIcon = selectedCategory.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (catValue: string) => {
    onChange(catValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-100/90 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[var(--color-primary,#EC4899)] focus:ring-2 focus:ring-pink-500/20 transition-all shadow-2xs cursor-pointer flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-[var(--color-primary,#EC4899)] flex items-center justify-center shrink-0">
            <SelectedIcon size={12} />
          </div>
          <span className="truncate font-semibold text-xs text-slate-800 dark:text-slate-100">
            {selectedCategory.label}
          </span>
        </div>
        <ChevronDown 
          size={14} 
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--color-primary,#EC4899)]' : ''}`} 
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div 
          role="listbox" 
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white/95 dark:bg-[#150D20]/95 backdrop-blur-xl border border-pink-100 dark:border-pink-900/40 rounded-2xl shadow-xl shadow-black/20 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-pink-600 dark:text-pink-400 flex items-center gap-1 border-b border-slate-100 dark:border-slate-800/60 mb-1">
            <Sparkles size={10} />
            <span>Select Primary Category</span>
          </div>

          {CATEGORY_OPTIONS.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = cat.value === value;

            return (
              <button
                key={cat.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(cat.value)}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer group ${
                  isSelected
                    ? 'bg-pink-500/10 dark:bg-pink-500/20 text-[var(--color-primary,#EC4899)] font-bold'
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected 
                      ? 'bg-[var(--color-primary,#EC4899)] text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-pink-100 dark:group-hover:bg-pink-950/60 group-hover:text-[var(--color-primary,#EC4899)]'
                  }`}>
                    <IconComponent size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs truncate">{cat.label}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-normal leading-tight">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <Check size={14} className="text-[var(--color-primary,#EC4899)] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
