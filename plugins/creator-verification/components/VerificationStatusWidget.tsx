'use client';

import React from 'react';
import { Shield, Hourglass, AlertTriangle, BadgeCheck, XCircle } from 'lucide-react';

interface VerificationStatusWidgetProps {
  status: 'not_applied' | 'pending' | 'changes_requested' | 'approved' | 'rejected';
  message?: string;
  submittedDate?: string;
  onActionClick: () => void;
}

export default function VerificationStatusWidget({ 
  status = 'not_applied', 
  message,
  submittedDate,
  onActionClick
}: VerificationStatusWidgetProps) {

  const content = {
    not_applied: {
      icon: Shield,
      iconColor: 'text-slate-400',
      bgColor: 'bg-slate-100',
      title: 'Get Verified',
      desc: 'Build trust with your audience by verifying your identity.',
      btnText: 'Apply Now',
      btnStyle: 'bg-slate-900 hover:bg-slate-800 text-white'
    },
    pending: {
      icon: Hourglass,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-100',
      title: 'Under Review',
      desc: submittedDate ? `Submitted on ${submittedDate}` : 'We are reviewing your application.',
      btnText: 'View Status',
      btnStyle: 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200'
    },
    changes_requested: {
      icon: AlertTriangle,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-100',
      title: 'Action Required',
      desc: message || 'Please update your application details.',
      btnText: 'Update Application',
      btnStyle: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-200'
    },
    approved: {
      icon: BadgeCheck,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-100',
      title: 'Verified Creator',
      desc: 'Your account is fully verified.',
      btnText: 'View Badge',
      btnStyle: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
    },
    rejected: {
      icon: XCircle,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-100',
      title: 'Application Rejected',
      desc: message || 'We could not verify your identity.',
      btnText: 'Re-Apply',
      btnStyle: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
    }
  };

  const config = content[status];
  const Icon = config.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${config.bgColor}`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{config.title}</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4 line-clamp-2">{config.desc}</p>
          <button 
            onClick={onActionClick}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all w-full md:w-auto ${config.btnStyle}`}
          >
            {config.btnText}
          </button>
        </div>
      </div>
    </div>
  );
}
