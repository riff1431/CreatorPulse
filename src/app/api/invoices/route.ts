import { NextRequest, NextResponse } from 'next/server';
import {
  getPlatformInvoices,
  savePlatformInvoice,
  updateInvoiceStatus,
  getInvoiceSettings,
  saveInvoiceSettings,
  resendInvoiceEmailReceipt,
  renderInvoiceHTML
} from '@/lib/payments/invoice-system-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('id');
    const format = searchParams.get('format');

    const invoices = getPlatformInvoices();
    const settings = getInvoiceSettings();

    if (invoiceId) {
      const inv = invoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
      if (!inv) {
        return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
      }

      if (format === 'html') {
        const html = renderInvoiceHTML(inv, settings);
        return new NextResponse(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      return NextResponse.json({ success: true, invoice: inv, settings });
    }

    return NextResponse.json({
      success: true,
      invoices,
      settings
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'CREATE_INVOICE': {
        const invoice = savePlatformInvoice(body.invoice);
        return NextResponse.json({ success: true, invoice, message: 'Invoice generated successfully.' });
      }

      case 'UPDATE_STATUS': {
        const invoice = updateInvoiceStatus(body.invoiceId, body.status, body.refundDetails);
        return NextResponse.json({ success: true, invoice, message: `Invoice status updated to ${body.status}.` });
      }

      case 'RESEND_RECEIPT': {
        const result = resendInvoiceEmailReceipt(body.invoiceId);
        return NextResponse.json(result);
      }

      case 'SAVE_SETTINGS': {
        const settings = saveInvoiceSettings(body.settings);
        return NextResponse.json({ success: true, settings, message: 'Invoice settings updated successfully.' });
      }

      default:
        return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Invoice API operation failed.' },
      { status: 500 }
    );
  }
}
