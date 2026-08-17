'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, CheckCircle2, ChevronRight, X, ArrowRight,
  Camera, Image, FileText, Tag, DollarSign, CreditCard,
  Share2, Users, ChevronDown, ChevronUp, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { calculateProfileCompletion, CompletionTask } from '@/lib/profile/profile-completion';
import { Button } from './Button';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Camera,
  Image,
  FileText,
  Tag,
  DollarSign,
  CreditCard,
  Share2,
  Users,
  Sparkles
};

interface ProfileCompletionWidgetProps {
  variant?: 'card' | 'banner' | 'compact';
  className?: string;
  onDismiss?: () => void;
}

export const ProfileCompletionWidget: React.FC<ProfileCompletionWidgetProps> = ({
  variant = 'card',
  className = '',
  onDismiss
}) => {
  const { user, updateProfile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const report = calculateProfileCompletion(user);

  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const dismissed = localStorage.getItem(`creatorpulse_completion_dismissed_${user.id}`);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, [user?.id]);

  if (!user || user.role === 'guest' || report.isComplete || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`creatorpulse_completion_dismissed_${user.id}`, 'true');
    }
    if (onDismiss) onDismiss();
  };

  // Compact Variant (e.g. for Sidebar)
  if (variant === 'compact') {
    return (
      <div className={`p-3.5 rounded-[22px] bg-gradient-to-br from-[#FFF9FC] to-[#FFF1F7] dark:from-[#22152E] dark:to-[#1A1024] border border-[#F3DCE8] dark:border-[#3A2A4C] shadow-2xs space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FF8A00] to-[#E52E71] flex items-center justify-center text-white">
              <Sparkles size={13} />
            </div>
            <h4 className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
              Profile Setup
            </h4>
          </div>
          <span className="text-[11px] font-black text-[var(--color-primary)]">
            {report.percentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#E4E4E7] dark:bg-[#3A2A4C] h-1.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${report.percentage}%` }}
            className="h-full bg-gradient-to-r from-[#FF8A00] to-[#E52E71] rounded-full transition-all duration-500"
          />
        </div>

        {report.primarySuggestion && (
          <Link
            href={report.primarySuggestion.actionUrl}
            className="flex items-center justify-between text-[11px] font-bold text-[#71717A] dark:text-[#D4B8D0] hover:text-[var(--color-primary)] transition-colors group"
          >
            <span className="truncate">{report.primarySuggestion.title}</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        )}
      </div>
    );
  }

  // Full Card Variant (e.g. for Dashboards or Feed Top Banner)
  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFF9FC] via-[#FFF1F7]/80 to-[#FCE7F3]/40 dark:from-[#22152E] dark:via-[#1A1024] dark:to-[#2D162B] border border-[#F3DCE8] dark:border-[#3A2A4C] p-4 sm:p-5 shadow-sm space-y-4 ${className}`}>
      
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF8A00] via-[#EC4899] to-[#7928CA] flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-[#18181B] dark:text-[#FDF2F8]">
                Complete Your {user.role === 'creator' ? 'Creator Channel' : 'Fan Profile'}
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-[#EC4899] dark:bg-pink-950/60 dark:text-pink-400">
                {report.percentage}% Complete
              </span>
            </div>
            <p className="text-xs text-[#71717A] dark:text-[#D4B8D0] font-medium">
              {report.missingTasks.length} {report.missingTasks.length === 1 ? 'step' : 'steps'} remaining to unlock full profile perks and discovery.
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-full text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#FDF2F8] hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
          title="Dismiss reminder"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Track */}
      <div className="space-y-1.5">
        <div className="w-full bg-[#E4E4E7] dark:bg-[#3A2A4C] h-2 rounded-full overflow-hidden">
          <div
            style={{ width: `${report.percentage}%` }}
            className="h-full bg-gradient-to-r from-[#FF8A00] via-[#EC4899] to-[#7928CA] rounded-full transition-all duration-700 ease-out"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold text-[#A1A1AA] dark:text-[#8E7890]">
          <span>{report.completedTasksCount} of {report.totalTasksCount} tasks done</span>
          <span>{100 - report.percentage}% to 100%</span>
        </div>
      </div>

      {/* Primary Action CTA (Next Recommended Step) */}
      {report.primarySuggestion && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/90 dark:bg-[#150D1E]/90 border border-[#F3DCE8] dark:border-[#3A2A4C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-[var(--color-primary)] flex items-center justify-center shrink-0">
              {(() => {
                const Icon = ICON_MAP[report.primarySuggestion.iconName] || Sparkles;
                return <Icon size={16} />;
              })()}
            </div>
            <div>
              <p className="font-extrabold text-xs text-[#18181B] dark:text-[#FDF2F8]">
                {report.primarySuggestion.title}
                {report.primarySuggestion.isRequired && (
                  <span className="ml-2 text-[9px] font-black uppercase text-rose-500">Required</span>
                )}
              </p>
              <p className="text-[11px] text-[#71717A] dark:text-[#D4B8D0] font-medium">
                {report.primarySuggestion.description}
              </p>
            </div>
          </div>

          <Link
            href={report.primarySuggestion.actionUrl}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#E52E71] text-white font-extrabold text-xs shadow-sm hover:opacity-95 transition-opacity text-center shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>{report.primarySuggestion.actionLabel}</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Expandable Checklist Toggle */}
      <div className="pt-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-extrabold text-[var(--color-primary)] hover:underline cursor-pointer py-1"
        >
          <span>{isExpanded ? 'Hide All Steps' : `View All Tasks (${report.totalTasksCount})`}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-3 border-t border-[#F3DCE8] dark:border-[#3A2A4C] mt-2">
            {report.tasks.map((task) => {
              const Icon = ICON_MAP[task.iconName] || Sparkles;
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                    task.isCompleted
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      : 'bg-white/80 dark:bg-[#150D1E]/80 border-[#F3DCE8] dark:border-[#3A2A4C] text-[#18181B] dark:text-[#FDF2F8]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {task.isCompleted ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full border-2 border-[#A1A1AA] dark:border-[#8E7890] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${task.isCompleted ? 'line-through opacity-80' : ''}`}>
                        {task.title}
                      </p>
                      <p className="text-[10px] text-[#A1A1AA] truncate">
                        +{task.weight}% score
                      </p>
                    </div>
                  </div>

                  {!task.isCompleted && (
                    <Link
                      href={task.actionUrl}
                      className="text-[11px] font-extrabold text-[var(--color-primary)] hover:underline shrink-0 flex items-center gap-0.5"
                    >
                      <span>Fix</span>
                      <ChevronRight size={12} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletionWidget;
