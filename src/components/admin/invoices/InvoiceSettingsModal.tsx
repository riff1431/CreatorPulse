'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Building, Receipt } from 'lucide-react';
import { Modal } from '@/components/admin/ui/Modal';
import { Button } from '@/components/admin/ui/Button';
import { InvoiceSettings, getInvoiceSettings, saveInvoiceSettings } from '@/lib/payments/invoice-system-store';

interface InvoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvoiceSettingsModal: React.FC<InvoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<InvoiceSettings>(getInvoiceSettings());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInvoiceSettings());
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveInvoiceSettings(formData);
    alert('Invoice & receipt system settings updated successfully.');
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice & Receipt System Settings">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Prefix</label>
            <input
              type="text"
              required
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Number Format</label>
            <select
              value={formData.numberFormat}
              onChange={(e) => setFormData({ ...formData, numberFormat: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="INV-{YYYY}-{SEQ}">INV-2026-00048</option>
              <option value="INV-{SEQ}">INV-00048</option>
              <option value="RECEIPT-{YYYY}-{SEQ}">RECEIPT-2026-00048</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Next Sequence #</label>
            <input
              type="number"
              required
              value={formData.nextSequenceNumber}
              onChange={(e) => setFormData({ ...formData, nextSequenceNumber: parseInt(e.target.value) || 1000 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Company Name</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tax ID / EIN</label>
            <input
              type="text"
              value={formData.companyTaxId}
              onChange={(e) => setFormData({ ...formData, companyTaxId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Company Address</label>
          <input
            type="text"
            value={formData.companyAddress}
            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Billing Support Email</label>
            <input
              type="email"
              value={formData.companyEmail}
              onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Default Tax / VAT Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={formData.defaultTaxRate}
              onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Footer Terms & Refund Notice</label>
          <textarea
            rows={3}
            value={formData.footerTerms}
            onChange={(e) => setFormData({ ...formData, footerTerms: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose} className="cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer" leftIcon={<Save size={14} />}>
            Save Invoice Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
};
