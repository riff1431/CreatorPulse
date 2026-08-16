'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Printer, Send, RefreshCw, Settings, Download,
  CheckCircle2, AlertCircle, DollarSign, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Button } from '@/components/admin/ui/Button';
import {
  PlatformInvoice,
  InvoiceSettings,
  getPlatformInvoices,
  getInvoiceSettings,
  resendInvoiceEmailReceipt,
  updateInvoiceStatus
} from '@/lib/payments/invoice-system-store';
import { InvoicePrintModal } from '@/components/admin/invoices/InvoicePrintModal';
import { InvoiceSettingsModal } from '@/components/admin/invoices/InvoiceSettingsModal';

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<PlatformInvoice[]>([]);
  const [settings, setSettings] = useState<InvoiceSettings>(getInvoiceSettings());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoice | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const loadData = () => {
    setInvoices(getPlatformInvoices());
    setSettings(getInvoiceSettings());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('creatorpulse_invoices_updated', handleUpdate);
    return () => window.removeEventListener('creatorpulse_invoices_updated', handleUpdate);
  }, []);

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (typeFilter !== 'all' && inv.orderType !== typeFilter) return false;
    if (
      search &&
      !inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) &&
      !inv.userName.toLowerCase().includes(search.toLowerCase()) &&
      !inv.userEmail.toLowerCase().includes(search.toLowerCase()) &&
      !inv.gatewayId.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const totalTaxes = invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.taxAmount, 0);

  const handlePrint = (inv: PlatformInvoice) => {
    setSelectedInvoice(inv);
    setIsPrintModalOpen(true);
  };

  const handleResend = (inv: PlatformInvoice) => {
    const res = resendInvoiceEmailReceipt(inv.id);
    alert(res.message);
  };

  const handleRefund = (inv: PlatformInvoice) => {
    const ref = prompt('Enter Refund Transaction Reference (e.g. REF-2026-9912):', `REF-${Date.now()}`);
    if (ref) {
      updateInvoiceStatus(inv.id, 'refunded', { refundReference: ref, refundAmount: inv.totalAmount });
      alert(`Invoice ${inv.invoiceNumber} marked as refunded with reference ${ref}.`);
      loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="text-indigo-600" size={24} />
            <h1 className="text-xl font-black text-slate-900">Dynamic Invoice & Receipt System</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Search, filter, resend receipts, link refunds, and manage invoice sequence formatting ({settings.prefix}-YYYY-00000).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-xs font-bold cursor-pointer"
            leftIcon={<Settings size={14} />}
          >
            Invoice Settings
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Invoices Issued</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{invoices.length}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Next Number: <span className="font-mono font-bold text-indigo-600">{settings.prefix}-2026-{String(settings.nextSequenceNumber).padStart(5, '0')}</span></div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Paid Billed Volume</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">${totalPaid.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">From all completed receipts</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tax / VAT Collected</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">${totalTaxes.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Default Tax Rate: {settings.defaultTaxRate}%</div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Refunded Invoices</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {invoices.filter((i) => i.status === 'refunded').length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">With refund reference links</div>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by invoice #, customer name, or email..."
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
        </div>
      </div>

      {/* Main Invoices Table */}
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-left uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Issued Date</th>
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
                <td colSpan={10} className="py-8 text-center text-slate-400 font-medium">
                  No invoices found matching search filters.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{inv.issuedAt.substring(0, 10)}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{inv.userName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{inv.userEmail}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 capitalize">
                    {inv.orderType.replace('_', ' ')}
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
                        onClick={() => handlePrint(inv)}
                      >
                        Print / View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] text-indigo-600 font-bold hover:bg-indigo-50 cursor-pointer"
                        leftIcon={<Send size={12} />}
                        onClick={() => handleResend(inv)}
                      >
                        Resend
                      </Button>
                      {inv.status === 'paid' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[10px] text-amber-700 font-bold hover:bg-amber-50 cursor-pointer"
                          onClick={() => handleRefund(inv)}
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

      {/* Invoice Print & View Modal */}
      <InvoicePrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={selectedInvoice}
      />

      {/* Invoice Settings Modal */}
      <InvoiceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
