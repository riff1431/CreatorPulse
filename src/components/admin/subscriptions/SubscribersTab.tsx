'use client';

import React, { useState } from 'react';
import {
  Users, Search, Filter, RefreshCw, AlertCircle, CheckCircle2,
  XCircle, Clock, ShieldAlert, ArrowUpRight, ChevronRight, MoreHorizontal,
  CreditCard, Calendar, Zap, RefreshCcw
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import { Avatar } from '@/components/admin/ui/Avatar';
import { SubscriberSubscription } from '@/lib/payments/subscription-billing-store';

interface SubscribersTabProps {
  subscriptions: SubscriberSubscription[];
  onRefresh: () => void;
  onSelectSubscription: (sub: SubscriberSubscription, action: 'retry' | 'upgrade' | 'grace' | 'cancel' | 'invoices') => void;
}

export const SubscribersTab: React.FC<SubscribersTabProps> = ({
  subscriptions,
  onRefresh,
  onSelectSubscription
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');

  const filtered = subscriptions.filter((sub) => {
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
    if (gatewayFilter !== 'all' && sub.gatewayId !== gatewayFilter) return false;
    if (
      search &&
      !sub.userName.toLowerCase().includes(search.toLowerCase()) &&
      !sub.userEmail.toLowerCase().includes(search.toLowerCase()) &&
      !sub.creatorName.toLowerCase().includes(search.toLowerCase()) &&
      !sub.planName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: SubscriberSubscription['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="emerald" size="sm">Active</Badge>;
      case 'in_grace':
        return <Badge variant="amber" size="sm">In Grace Period</Badge>;
      case 'past_due':
        return <Badge variant="rose" size="sm">Past Due</Badge>;
      case 'cancelled':
        return <Badge variant="slate" size="sm">Cancelled</Badge>;
      case 'expired':
        return <Badge variant="amber" size="sm">Expired</Badge>;
      case 'suspended':
        return <Badge variant="rose" size="sm">Suspended</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by subscriber, creator, or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="in_grace">In Grace Period</option>
            <option value="past_due">Past Due</option>
            <option value="cancelled">Cancelled</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Gateways</option>
            <option value="plugin-stripe">Stripe</option>
            <option value="plugin-paypal">PayPal</option>
            <option value="plugin-piprapay">PipraPay</option>
            <option value="plugin-mock">Mock Sandbox</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="cursor-pointer"
            leftIcon={<RefreshCcw size={14} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-left uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4">Subscriber</th>
              <th className="py-3.5 px-4">Creator</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">Plan & Tier</th>
              <th className="py-3.5 px-4 hidden md:table-cell">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 hidden lg:table-cell">Gateway</th>
              <th className="py-3.5 px-4 hidden xl:table-cell">Next Billing / Grace End</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                  No subscriber subscriptions found matching filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  {/* Subscriber */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={sub.userAvatar} alt={sub.userName} size="sm" />
                      <div>
                        <div className="font-bold text-slate-900">{sub.userName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{sub.userEmail}</div>
                      </div>
                    </div>
                  </td>

                  {/* Creator */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar src={sub.creatorAvatar} alt={sub.creatorName} size="sm" />
                      <span className="font-semibold text-slate-700">{sub.creatorName}</span>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <div className="font-bold text-slate-800">{sub.planName}</div>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      Tier {sub.tierLevel} • {sub.billingCycle}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 hidden md:table-cell font-bold text-emerald-600">
                    ${sub.amount.toFixed(2)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {getStatusBadge(sub.status)}
                      {sub.failedAttempts > 0 && (
                        <div className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                          <AlertCircle size={10} />
                          {sub.failedAttempts} Failed Retries
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Gateway */}
                  <td className="py-3.5 px-4 hidden lg:table-cell">
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded font-medium">
                      {sub.gatewayId.replace('plugin-', '')}
                    </span>
                  </td>

                  {/* Period End */}
                  <td className="py-3.5 px-4 hidden xl:table-cell text-slate-500 font-medium text-[11px]">
                    {sub.status === 'in_grace' && sub.gracePeriodEnd ? (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <Clock size={12} />
                        Grace ends {sub.gracePeriodEnd.substring(0, 10)}
                      </span>
                    ) : (
                      <span>{sub.currentPeriodEnd.substring(0, 10)}</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(sub.status === 'in_grace' || sub.status === 'past_due') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[10px] px-2 py-1 text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 font-bold cursor-pointer"
                          onClick={() => onSelectSubscription(sub, 'retry')}
                        >
                          Retry Payment
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] text-indigo-600 font-bold hover:bg-indigo-50 cursor-pointer"
                        onClick={() => onSelectSubscription(sub, 'upgrade')}
                      >
                        Change Plan
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] text-slate-600 hover:bg-slate-100 cursor-pointer"
                        onClick={() => onSelectSubscription(sub, 'grace')}
                      >
                        Extend Grace
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
