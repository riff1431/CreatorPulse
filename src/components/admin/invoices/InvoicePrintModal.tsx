'use client';

import React from 'react';
import { Printer, Download, Send, X, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/admin/ui/Modal';
import { Button } from '@/components/admin/ui/Button';
import {
  PlatformInvoice,
  getInvoiceSettings,
  renderInvoiceHTML,
  resendInvoiceEmailReceipt
} from '@/lib/payments/invoice-system-store';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PlatformInvoice | null;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  if (!invoice) return null;

  const settings = getInvoiceSettings();
  const htmlContent = renderInvoiceHTML(invoice, settings);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleResend = () => {
    const res = resendInvoiceEmailReceipt(invoice.id);
    alert(res.message);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Invoice ${invoice.invoiceNumber}`}>
      <div className="space-y-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-600 font-medium">
            Status: <strong className="uppercase text-indigo-600">{invoice.status}</strong> • Gateway: <strong>{invoice.gatewayId}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResend}
              className="text-xs font-bold cursor-pointer"
              leftIcon={<Send size={13} />}
            >
              Resend Receipt
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              leftIcon={<Printer size={13} />}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Invoice Preview Frame */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-100 max-h-[500px] overflow-y-auto">
          <iframe
            srcDoc={htmlContent}
            title={`Invoice ${invoice.invoiceNumber}`}
            className="w-full min-h-[550px] border-none bg-white"
          />
        </div>
      </div>
    </Modal>
  );
};
