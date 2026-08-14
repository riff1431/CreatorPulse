'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FFF9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EC4899] to-[#F43F5E] flex items-center justify-center text-white shadow-md shadow-pink-200">
            <Sparkles size={20} />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#18181B]">Creator<span className="text-[#EC4899]">Pulse</span></span>
        </Link>
        {title && <h2 className="text-2xl font-extrabold text-[#18181B] tracking-tight">{title}</h2>}
        {subtitle && <p className="mt-2 text-sm text-[#71717A]">{subtitle}</p>}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-pink-100/50 sm:rounded-3xl sm:px-10 border border-[#F3DCE8]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
