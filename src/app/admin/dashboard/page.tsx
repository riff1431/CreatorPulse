'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users, UserCheck, CreditCard, DollarSign, TrendingUp,
  Receipt, Wallet, AlertTriangle, FileText, Shield, ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Sparkline } from '@/components/ui/Sparkline';

const recentActivity = [
  { id: '1', text: 'David Miller submitted a creator application', type: 'application', time: '5m ago' },
  { id: '2', text: 'Jordan Lee reported a post for spam', type: 'report', time: '12m ago' },
  { id: '3', text: 'Sarah Jenkins requested a $1,500 payout', type: 'payout', time: '1h ago' },
  { id: '4', text: 'New user signup: michael@test.com', type: 'signup', time: '2h ago' },
  { id: '5', text: 'Marcus Vance reached 22,000 followers', type: 'milestone', time: '3h ago' },
];

// Multi-dataset for different admin views
const revenueDatasets = {
  revenue: [
    { label: 'Feb', value: 18000 },
    { label: 'Mar', value: 22000 },
    { label: 'Apr', value: 26000 },
    { label: 'May', value: 31000 },
    { label: 'Jun', value: 28000 },
    { label: 'Jul', value: 35000 },
    { label: 'Aug', value: 41500 },
  ],
  transactions: [
    { label: 'Feb', value: 12000 },
    { label: 'Mar', value: 14500 },
    { label: 'Apr', value: 16800 },
    { label: 'May', value: 19100 },
    { label: 'Jun', value: 17800 },
    { label: 'Jul', value: 21500 },
    { label: 'Aug', value: 24200 },
  ]
};

export default function AdminDashboardPage() {
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'transactions'>('revenue');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const activeDataset = revenueDatasets[selectedMetric];
  const maxVal = Math.max(...activeDataset.map((d) => d.value));

  // Responsive SVG Area chart sizes
  const graphWidth = 500;
  const graphHeight = 160;
  const padding = 20;

  const points = activeDataset.map((d, index) => {
    const x = padding + (index / (activeDataset.length - 1)) * (graphWidth - padding * 2);
    const y = graphHeight - padding - (d.value / maxVal) * (graphHeight - padding * 2 - 20);
    return { x, y, label: d.label, val: d.value };
  });

  const pathLine = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const pathArea = `${pathLine} L ${points[points.length - 1].x} ${graphHeight - padding} L ${points[0].x} ${graphHeight - padding} Z`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Shield className="text-[#EC4899]" size={22} />
          <h1 className="text-xl font-black text-[#18181B] tracking-tight font-sans">Admin Dashboard</h1>
        </div>
        <p className="text-xs text-[#71717A] mt-1 font-medium">Platform overview, metrics, and quick actions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
              <span>Total Members</span>
              <Users size={14} className="text-[#EC4899]" />
            </div>
            <p className="text-2xl font-black text-[#18181B] tracking-tight">48,920</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-[#BE185D]">+1,240 this week</span>
            <Sparkline data={[45000, 45800, 46300, 47100, 47800, 48300, 48920]} width={60} height={16} />
          </div>
        </Card>

        {/* Total Creators */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
              <span>Total Creators</span>
              <UserCheck size={14} className="text-[#EC4899]" />
            </div>
            <p className="text-2xl font-black text-[#18181B] tracking-tight">1,480</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-[#BE185D]">+32 applications</span>
            <Sparkline data={[1200, 1250, 1310, 1340, 1390, 1430, 1480]} width={60} height={16} color="#BE185D" fillColor="rgba(190, 24, 93, 0.1)" />
          </div>
        </Card>

        {/* Active Subscriptions */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
              <span>Active Subscriptions</span>
              <CreditCard size={14} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-[#18181B] tracking-tight">24,150</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-emerald-600">+840 this month</span>
            <Sparkline data={[21000, 21800, 22400, 22900, 23300, 23800, 24150]} width={60} height={16} color="#059669" fillColor="rgba(5, 150, 105, 0.1)" />
          </div>
        </Card>

        {/* Platform Revenue */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
              <span>Platform Revenue</span>
              <DollarSign size={14} className="text-[#EC4899]" />
            </div>
            <p className="text-2xl font-black text-[#18181B] tracking-tight">$241.5k</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-[#BE185D]">+18.2% vs last month</span>
            <Sparkline data={[180, 202, 210, 222, 231, 236, 241]} width={60} height={16} />
          </div>
        </Card>

        {/* Creator Earnings */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
              <span>Creator Earnings</span>
              <TrendingUp size={14} className="text-[#EC4899]" />
            </div>
            <p className="text-2xl font-black text-[#18181B] tracking-tight">$198.4k</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-medium text-[#71717A]">82.1% of revenue</span>
            <Sparkline data={[140, 152, 160, 172, 185, 192, 198]} width={60} height={16} />
          </div>
        </Card>

        {/* Total Transactions */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
              <span>Total Transactions</span>
              <Receipt size={14} className="text-[#EC4899]" />
            </div>
            <p className="text-2xl font-black text-[#18181B] tracking-tight">156,320</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-[#BE185D]">+4,280 this week</span>
            <Sparkline data={[138000, 142000, 145000, 149000, 151000, 154000, 156320]} width={60} height={16} />
          </div>
        </Card>

        {/* Pending Payouts */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
              <span>Pending Payouts</span>
              <Wallet size={14} className="text-amber-600" />
            </div>
            <p className="text-2xl font-black text-[#18181B] tracking-tight">$12,450</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-amber-600">3 requests awaiting</span>
            <Sparkline data={[8200, 9500, 11000, 10500, 12000, 11500, 12450]} width={60} height={16} color="#D97706" fillColor="rgba(217, 119, 6, 0.1)" />
          </div>
        </Card>

        {/* Open Reports */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
              <span>Open Reports</span>
              <AlertTriangle size={14} className="text-[#F43F5E]" />
            </div>
            <p className="text-2xl font-black text-[#18181B] tracking-tight">7</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-[#BE123C]">2 high priority</span>
            <Sparkline data={[9, 12, 10, 8, 7, 9, 7]} width={60} height={16} color="#E11D48" fillColor="rgba(225, 29, 72, 0.1)" />
          </div>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Platforms Area Chart */}
        <Card className="lg:col-span-2 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#18181B]">Platform Metrics</h3>
              <p className="text-[10px] text-[#71717A] mt-0.5 font-medium">Verify overall transaction flow rates and payouts.</p>
            </div>

            {/* Toggle metric tabs */}
            <div className="flex bg-[#FFF9FC] border border-[#F3DCE8] p-1 rounded-xl text-[10px] font-bold text-[#71717A]">
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedMetric === 'revenue' ? 'bg-[#FCE7F3] text-[#BE185D] shadow-xs' : 'hover:text-[#18181B]'
                }`}
              >
                Revenue ($)
              </button>
              <button
                onClick={() => setSelectedMetric('transactions')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedMetric === 'transactions' ? 'bg-[#FCE7F3] text-[#BE185D] shadow-xs' : 'hover:text-[#18181B]'
                }`}
              >
                Transactions
              </button>
            </div>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} width="100%" height="100%" className="overflow-visible select-none">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((r) => {
                const y = padding + r * (graphHeight - padding * 2 - 20);
                return <line key={r} x1={padding} y1={y} x2={graphWidth - padding} y2={y} stroke="#F3DCE8" strokeWidth={1} strokeDasharray="3 3" />;
              })}

              <defs>
                <linearGradient id="adminChartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EC4899" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path d={pathArea} fill="url(#adminChartGlow)" />
              <path d={pathLine} fill="none" stroke="#EC4899" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

              {/* Circles */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIdx === idx ? 4.5 : 3}
                    fill={hoveredIdx === idx ? '#BE185D' : '#EC4899'}
                    stroke="white"
                    strokeWidth={1}
                    className="transition-all duration-150"
                  />
                  <rect
                    x={p.x - 20}
                    y={padding}
                    width={40}
                    height={graphHeight - padding * 2}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                </g>
              ))}

              {/* X labels */}
              {points.map((p, idx) => (
                <text key={idx} x={p.x} y={graphHeight - 4} textAnchor="middle" fill="#71717A" fontSize={8} fontWeight="bold">
                  {p.label}
                </text>
              ))}
            </svg>

            {hoveredIdx !== null && (
              <div
                className="absolute bg-white/95 border border-[#F3DCE8] p-2 rounded-xl shadow-md text-[10px] space-y-0.5 z-10 font-bold"
                style={{
                  left: `${(points[hoveredIdx].x / graphWidth) * 100}%`,
                  top: `${(points[hoveredIdx].y / graphHeight) * 100 - 30}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <span className="text-[#EC4899] block font-black">
                  {selectedMetric === 'revenue' ? `$${points[hoveredIdx].val.toLocaleString()}` : `${points[hoveredIdx].val.toLocaleString()} txs`}
                </span>
                <span className="text-[#A1A1AA] text-[8px] font-semibold">{points[hoveredIdx].label}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#18181B]">Quick Actions</h3>
            <p className="text-[10px] text-[#71717A] mt-0.5 font-medium">Core administrative shortcuts.</p>
          </div>
          <div className="space-y-2.5">
            <Link href="/admin/applications">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899] font-bold">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Review Applications</p>
                    <p className="text-[10px] text-[#71717A] font-medium">2 pending</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#EC4899] transition-colors" />
              </div>
            </Link>

            <Link href="/admin/payouts">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FCE7F3] flex items-center justify-center text-[#EC4899] font-bold">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Process Payouts</p>
                    <p className="text-[10px] text-[#71717A] font-medium">$12,450 pending</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#EC4899] transition-colors" />
              </div>
            </Link>

            <Link href="/admin/reports">
              <div className="p-3.5 bg-[#FFF9FC] rounded-2xl border border-[#F3DCE8] hover:border-[#F472B6] hover:bg-[#FFF1F7] transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFE4E6] flex items-center justify-center text-[#F43F5E] font-bold">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18181B]">Moderate Reports</p>
                    <p className="text-[10px] text-[#71717A] font-medium">7 open reports</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#A1A1AA] group-hover:text-[#F43F5E] transition-colors" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#18181B]">Recent Activity Log</h3>
        <div className="divide-y divide-[#F3DCE8]/60 text-xs font-semibold">
          {recentActivity.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  item.type === 'report' ? 'bg-[#F43F5E]' :
                  item.type === 'payout' ? 'bg-amber-500' :
                  item.type === 'application' ? 'bg-[#EC4899]' :
                  item.type === 'milestone' ? 'bg-[#BE185D]' :
                  'bg-[#EC4899]'
                }`} />
                <span className="text-[#18181B] font-medium">{item.text}</span>
              </div>
              <span className="text-[#A1A1AA] shrink-0 ml-4 font-bold text-[10px]">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
