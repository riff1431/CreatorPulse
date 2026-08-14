'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Users, UserCheck, CreditCard, DollarSign, TrendingUp,
  Receipt, Wallet, AlertTriangle, FileText, Shield, ArrowRight,
  Palette, Puzzle
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Sparkline } from '@/components/admin/ui/Sparkline';
import { AdminIcon } from '@/components/admin/ui/AdminIcon';
import { IconButton } from '@/components/admin/ui/IconButton';
import gsap from 'gsap';

const recentActivity = [
  { id: '1', text: 'David Miller submitted a creator application', type: 'application', time: '5m ago' },
  { id: '2', text: 'Jordan Lee reported a post for spam', type: 'report', time: '12m ago' },
  { id: '3', text: 'Sarah Jenkins requested a $1,500 payout', type: 'payout', time: '1h ago' },
  { id: '4', text: 'New user signup: michael@test.com', type: 'signup', time: '2h ago' },
  { id: '5', text: 'Marcus Vance reached 22,000 followers', type: 'milestone', time: '3h ago' },
];

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
  const containerRef = useRef<HTMLDivElement>(null);

  const activeDataset = revenueDatasets[selectedMetric];
  const maxVal = Math.max(...activeDataset.map((d) => d.value));

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

  useEffect(() => {
    // Reveal main page container
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );

    // Stagger all Cards in the grid
    const cards = containerRef.current?.querySelectorAll('.gsap-card');
    if (cards && cards.length > 0) {
      gsap.fromTo(cards,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
      );
    }

    // Number counters
    const counters = containerRef.current?.querySelectorAll('.stat-counter');
    counters?.forEach((counter) => {
      const targetVal = parseFloat(counter.getAttribute('data-value') || '0');
      if (isNaN(targetVal)) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetVal,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.2,
        onUpdate: () => {
          const isCurrency = counter.getAttribute('data-type') === 'currency';
          const isPercent = counter.getAttribute('data-type') === 'percent';
          const suffix = counter.getAttribute('data-suffix') || '';
          
          if (isCurrency) {
            counter.textContent = '$' + obj.val.toFixed(obj.val % 1 === 0 ? 0 : 1) + suffix;
          } else if (isPercent) {
            counter.textContent = obj.val.toFixed(1) + '%';
          } else {
            counter.textContent = Math.floor(obj.val).toLocaleString();
          }
        }
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto space-y-6 opacity-0">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <AdminIcon icon={Shield} size="lg" variant="primary" container gradientAccent glow rounded="lg" />
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight font-sans leading-none">Admin Dashboard</h1>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Platform overview, metrics, and quick actions.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable gsap-card transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Total Members</span>
              <AdminIcon icon={Users} size="sm" variant="indigo" container gradientAccent glow rounded="md" />
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight stat-counter mt-1.5" data-value="48920">0</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-indigo-700">+1,240 this week</span>
            <Sparkline data={[45000, 45800, 46300, 47100, 47800, 48300, 48920]} width={60} height={16} />
          </div>
        </Card>

        {/* Total Creators */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable gsap-card transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Total Creators</span>
              <AdminIcon icon={UserCheck} size="sm" variant="indigo" container gradientAccent glow rounded="md" />
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight stat-counter mt-1.5" data-value="1480">0</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-indigo-700">+32 applications</span>
            <Sparkline data={[1200, 1250, 1310, 1340, 1390, 1430, 1480]} width={60} height={16} color="#4F46E5" fillColor="rgba(79, 70, 229, 0.05)" />
          </div>
        </Card>

        {/* Active Subscriptions */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable gsap-card transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Active Subscriptions</span>
              <AdminIcon icon={CreditCard} size="sm" variant="emerald" container gradientAccent glow rounded="md" />
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight stat-counter mt-1.5" data-value="24150">0</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-emerald-600">+840 this month</span>
            <Sparkline data={[21000, 21800, 22400, 22900, 23300, 23800, 24150]} width={60} height={16} color="#059669" fillColor="rgba(5, 150, 105, 0.1)" />
          </div>
        </Card>

        {/* Platform Revenue */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable gsap-card transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Platform Revenue</span>
              <AdminIcon icon={DollarSign} size="sm" variant="indigo" container gradientAccent glow rounded="md" />
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight stat-counter mt-1.5" data-value="241.5" data-type="currency" data-suffix="k">0</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-indigo-700">+18.2% vs last month</span>
            <Sparkline data={[180, 202, 210, 222, 231, 236, 241]} width={60} height={16} />
          </div>
        </Card>

        {/* Creator Earnings */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable gsap-card transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Creator Earnings</span>
              <AdminIcon icon={TrendingUp} size="sm" variant="indigo" container gradientAccent glow rounded="md" />
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight stat-counter mt-1.5" data-value="198.4" data-type="currency" data-suffix="k">0</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-medium text-slate-500">82.1% of revenue</span>
            <Sparkline data={[140, 152, 160, 172, 185, 192, 198]} width={60} height={16} />
          </div>
        </Card>

        {/* Total Transactions */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable gsap-card transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Total Transactions</span>
              <AdminIcon icon={Receipt} size="sm" variant="indigo" container gradientAccent glow rounded="md" />
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight stat-counter mt-1.5" data-value="156320">0</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-indigo-700">+4,280 this week</span>
            <Sparkline data={[138000, 142000, 145000, 149000, 151000, 154000, 156320]} width={60} height={16} />
          </div>
        </Card>

        {/* Pending Payouts */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable gsap-card transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Pending Payouts</span>
              <AdminIcon icon={Wallet} size="sm" variant="amber" container gradientAccent glow rounded="md" />
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight stat-counter mt-1.5" data-value="12450" data-type="currency">0</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-amber-600">3 requests awaiting</span>
            <Sparkline data={[8200, 9500, 11000, 10500, 12000, 11500, 12450]} width={60} height={16} color="#D97706" fillColor="rgba(217, 119, 6, 0.05)" />
          </div>
        </Card>

        {/* Open Reports */}
        <Card className="p-5 flex flex-col justify-between min-h-32 hoverable gsap-card transition-all duration-300 hover:shadow-md hover:border-slate-300/80">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Open Reports</span>
              <AdminIcon icon={AlertTriangle} size="sm" variant="rose" container gradientAccent glow rounded="md" />
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight stat-counter mt-1.5" data-value="7">0</p>
          </div>
          <div className="flex items-end justify-between pt-1">
            <span className="text-[10px] font-bold text-red-700">2 high priority</span>
            <Sparkline data={[9, 12, 10, 8, 7, 9, 7]} width={60} height={16} color="#EF4444" fillColor="rgba(239, 68, 68, 0.05)" />
          </div>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Platforms Area Chart */}
        <Card className="lg:col-span-2 p-6 space-y-6 gsap-card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-850">Platform Metrics</h3>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Verify overall transaction flow rates and payouts.</p>
            </div>

            {/* Toggle metric tabs */}
            <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl text-[10px] font-bold text-slate-500">
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedMetric === 'revenue' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'hover:text-slate-800'
                }`}
              >
                Revenue ($)
              </button>
              <button
                onClick={() => setSelectedMetric('transactions')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedMetric === 'transactions' ? 'bg-indigo-50 text-indigo-700 shadow-xs' : 'hover:text-slate-800'
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
                return <line key={r} x1={padding} y1={y} x2={graphWidth - padding} y2={y} stroke="var(--color-border)" strokeWidth={1} strokeDasharray="3 3" />;
              })}

              <defs>
                <linearGradient id="adminChartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path d={pathArea} fill="url(#adminChartGlow)" />
              <path d={pathLine} fill="none" stroke="#4F46E5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

              {/* Circles */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIdx === idx ? 4.5 : 3}
                    fill={hoveredIdx === idx ? '#4338CA' : '#4F46E5'}
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
                <text key={idx} x={p.x} y={graphHeight - 4} textAnchor="middle" fill="#94A3B8" fontSize={8} fontWeight="bold">
                  {p.label}
                </text>
              ))}
            </svg>

            {hoveredIdx !== null && (
              <div
                className="absolute bg-white border border-slate-200 p-2 rounded-lg shadow-md text-[10px] space-y-0.5 z-10 font-bold"
                style={{
                  left: `${(points[hoveredIdx].x / graphWidth) * 100}%`,
                  top: `${(points[hoveredIdx].y / graphHeight) * 100 - 30}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <span className="text-indigo-600 block font-black">
                  {selectedMetric === 'revenue' ? `$${points[hoveredIdx].val.toLocaleString()}` : `${points[hoveredIdx].val.toLocaleString()} txs`}
                </span>
                <span className="text-slate-400 text-[8px] font-semibold">{points[hoveredIdx].label}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 space-y-4 gsap-card">
          <div>
            <h3 className="text-sm font-bold text-slate-850">Quick Actions</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Core administrative shortcuts.</p>
          </div>
          <div className="space-y-2.5">
            <Link href="/admin/applications">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100 transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <AdminIcon icon={FileText} size="sm" variant="indigo" container rounded="md" className="shadow-4xs" />
                  <div>
                    <p className="text-xs font-bold text-slate-850">Review Applications</p>
                    <p className="text-[9px] text-slate-500 font-medium">2 pending</p>
                  </div>
                </div>
                <AdminIcon icon={ArrowRight} size="xs" variant="slate" className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link href="/admin/payouts">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100 transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <AdminIcon icon={Wallet} size="sm" variant="indigo" container rounded="md" className="shadow-4xs" />
                  <div>
                    <p className="text-xs font-bold text-slate-850">Process Payouts</p>
                    <p className="text-[9px] text-slate-500 font-medium">$12,450 pending</p>
                  </div>
                </div>
                <AdminIcon icon={ArrowRight} size="xs" variant="slate" className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link href="/admin/themes">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100 transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <AdminIcon icon={Palette} size="sm" variant="indigo" container rounded="md" className="shadow-4xs" />
                  <div>
                    <p className="text-xs font-bold text-slate-850">Frontend Themes</p>
                    <p className="text-[9px] text-slate-500 font-medium">Blush Core active</p>
                  </div>
                </div>
                <AdminIcon icon={ArrowRight} size="xs" variant="slate" className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link href="/admin/plugins">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100 transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <AdminIcon icon={Puzzle} size="sm" variant="indigo" container rounded="md" className="shadow-4xs" />
                  <div>
                    <p className="text-xs font-bold text-slate-850">Plugins & Add-ons</p>
                    <p className="text-[9px] text-slate-500 font-medium">5 modules installed</p>
                  </div>
                </div>
                <AdminIcon icon={ArrowRight} size="xs" variant="slate" className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link href="/admin/reports">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-100 transition-all flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <AdminIcon icon={AlertTriangle} size="sm" variant="rose" container rounded="md" className="shadow-4xs" />
                  <div>
                    <p className="text-xs font-bold text-slate-850">Moderate Reports</p>
                    <p className="text-[9px] text-slate-500 font-medium">7 open reports</p>
                  </div>
                </div>
                <AdminIcon icon={ArrowRight} size="xs" variant="slate" className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card className="p-6 space-y-4 gsap-card">
        <h3 className="text-sm font-bold text-slate-850">Recent Activity Log</h3>
        <div className="divide-y divide-slate-200/60 text-xs font-semibold">
          {recentActivity.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  item.type === 'report' ? 'bg-red-500' :
                  item.type === 'payout' ? 'bg-amber-500' :
                  item.type === 'application' ? 'bg-indigo-500' :
                  item.type === 'milestone' ? 'bg-blue-600' :
                  'bg-indigo-500'
                }`} />
                <span className="text-slate-700 font-medium">{item.text}</span>
              </div>
              <span className="text-slate-400 shrink-0 ml-4 font-bold text-[9px]">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
