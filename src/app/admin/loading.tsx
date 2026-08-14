'use client';

import React from 'react';

export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-2.5">
          <div className="h-7 w-48 bg-slate-200 rounded-md shimmer-bg"></div>
          <div className="h-3.5 w-72 bg-slate-100 rounded shimmer-bg"></div>
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-lg shimmer-bg"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-slate-100 rounded shimmer-bg"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-lg shimmer-bg"></div>
            </div>
            <div className="h-6.5 w-24 bg-slate-200 rounded shimmer-bg"></div>
            <div className="h-3 w-32 bg-slate-100 rounded shimmer-bg"></div>
          </div>
        ))}
      </div>

      {/* Main Grid: Card + List Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Table/List Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="h-5 w-36 bg-slate-200 rounded shimmer-bg"></div>
            <div className="h-4 w-16 bg-slate-100 rounded shimmer-bg"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-full shimmer-bg"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-slate-200 rounded shimmer-bg"></div>
                    <div className="h-3 w-28 bg-slate-100 rounded shimmer-bg"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-slate-100 rounded-full shimmer-bg"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Info/Quick Actions Section */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="h-5 w-32 bg-slate-200 rounded shimmer-bg border-b border-slate-100 pb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2.5">
                <div className="h-4 w-28 bg-slate-200 rounded shimmer-bg"></div>
                <div className="h-12 w-full bg-slate-100 rounded-lg shimmer-bg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
