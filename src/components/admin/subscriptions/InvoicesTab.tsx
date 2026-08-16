'use client';

import React, { useState } from 'react';
import {
  FileText, Search, Printer, Send, RefreshCw, CheckCircle2,
  AlertCircle, DollarSign, Download, ExternalLink, ShieldAlert
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import {
  PlatformInvoice,
  getPlatformInvoices,
  resendInvoiceEmailReceipt,
  updateInvoiceStatus
} from '@/lib/payments/invoice-system-store';

interface InvoicesTabProps {
  invoices: PlatformInvoice[];
  onRefresh: () => void;
  onOpenInvoiceModal: (invoice: PlatformInvoice) => void;
  onOpenSettingsModal?: () => void;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  invoices,
  onRefresh,
  onOpenInvoiceModal,
  onOpenSettingsModal
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (typeFilter !== 'all' && inv.orderType !== typeFilter) return false;
    if (
      search &&
      !inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) &&
      !inv.userName.toLowerCase().includes(search.toLowerCase()) &&
      !inv.userEmail.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleResendReceipt = (inv: PlatformInvoice) => {
    const res = resendInvoiceEmailReceipt(inv.id);
    alert(res.message);
  };

  const handleMarkRefunded = (inv: PlatformInvoice) => {
    const ref = prompt('Enter Refund Transaction Reference (e.g. REF-2026-9912):', `REF-${Date.now()}`);
    if (ref) {
      updateInvoiceStatus(inv.id, 'refunded', { refundReference: ref, refundAmount: inv.totalAmount });
      alert(`Invoice ${inv.invoiceNumber} marked as refunded with reference ${ref}.`);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search invoice #, customer name or email..."
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Order Types</option>
            <option value="subscription">Subscription</option>
            <option value="checkout">Checkout</option>
            <option value="tip">Tip Support</option>
            <option value="wallet_funding">Wallet Deposit</option>
          </select>

          {onOpenSettingsModal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettingsModal}
              className="cursor-pointer text-xs font-bold"
            >
              Invoice Settings
            </Button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-left uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Order Type</th>
              <th className="py-3 px-4">Subtotal</th>
              <th className="py-3 px-4">Tax</th>
              <th className="py-3 px-4">Total Paid</th>
              <th className="py-3 px-4">Gateway</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                  No invoices found matching current search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{inv.userName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{inv.userEmail}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700 capitalize">
                      {inv.orderType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">${inv.subtotal.toFixed(2)}</td>
                  <td className="py-3 px-4 text-slate-500 font-medium">${inv.taxAmount.toFixed(2)}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">${inv.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {inv.gatewayId.replace('plugin-', '')}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        inv.status === 'paid'
                          ? 'emerald'
                          : inv.status === 'refunded'
                          ? 'amber'
                          : inv.status === 'failed'
                          ? 'rose'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] px-2 py-1 cursor-pointer font-bold"
                        leftIcon={<Printer size={12} />}
                        onClick={() => onOpenInvoiceModal(inv)}
                      >
                        Print / View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] text-indigo-600 font-bold hover:bg-indigo-50 cursor-pointer"
                        leftIcon={<Send size={12} />}
                        onClick={() => handleResendReceipt(inv)}
                      >
                        Resend
                      </Button>
                      {inv.status === 'paid' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[10px] text-amber-700 font-bold hover:bg-amber-50 cursor-pointer"
                          onClick={() => handleMarkRefunded(inv)}
                        >
                          Refund
                        </Button>
                      )}
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
