export type OrderType = 'subscription' | 'checkout' | 'tip' | 'wallet_funding' | 'payout' | 'upgrade_proration';
export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'void';

export interface InvoiceLineItem {
  id: string;
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface PlatformInvoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-00042"
  orderType: OrderType;
  transactionId?: string;
  subscriptionId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAddress?: string;
  creatorId?: string;
  creatorName?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  platformFee: number;
  discountAmount: number;
  couponCode?: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  gatewayId: string;
  gatewayTransactionId?: string;
  status: InvoiceStatus;
  refundReference?: string;
  refundedAmount?: number;
  refundedAt?: string;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSettings {
  prefix: string; // e.g. "INV"
  numberFormat: 'INV-{YYYY}-{SEQ}' | 'INV-{SEQ}' | 'RECEIPT-{YYYY}-{SEQ}';
  nextSequenceNumber: number; // e.g. 1043
  companyName: string;
  companyAddress: string;
  companyTaxId: string;
  companyEmail: string;
  companyLogoUrl?: string;
  defaultTaxRate: number; // percentage, e.g. 5.0
  footerTerms: string;
  sendReceiptEmail: boolean;
}

const STORAGE_INVOICES_KEY = 'creatorpulse_platform_invoices';
const STORAGE_INVOICE_SETTINGS_KEY = 'creatorpulse_invoice_settings';

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  prefix: 'INV',
  numberFormat: 'INV-{YYYY}-{SEQ}',
  nextSequenceNumber: 1048,
  companyName: 'CreatorPulse Digital Inc.',
  companyAddress: '777 Tech Boulevard, Suite 400, San Francisco, CA 94107, USA',
  companyTaxId: 'US-EIN-99218491',
  companyEmail: 'billing@creatorpulse.com',
  companyLogoUrl: '',
  defaultTaxRate: 5.0,
  footerTerms: 'Thank you for supporting creators on CreatorPulse! Payments are non-refundable unless specified in Creator Terms of Service. For billing support, contact billing@creatorpulse.com.',
  sendReceiptEmail: true
};

export const DEFAULT_PLATFORM_INVOICES: PlatformInvoice[] = [
  {
    id: 'inv-1047',
    invoiceNumber: 'INV-2026-00047',
    orderType: 'subscription',
    subscriptionId: 'sub-1001',
    transactionId: 'ch_stripe_881920',
    userId: 'usr-alex',
    userName: 'Alex Vance',
    userEmail: 'alex.vance@example.com',
    userAddress: '124 Market Street, San Francisco, CA 94103',
    creatorId: 'crt-sarah',
    creatorName: 'Sarah Jenkins',
    lineItems: [
      { id: 'li-1', description: 'Pro Creator Tier Subscription (Monthly Renewal)', unitPrice: 15.0, quantity: 1, total: 15.0 }
    ],
    subtotal: 15.0,
    platformFee: 0.75,
    discountAmount: 0.0,
    taxRate: 5.0,
    taxAmount: 0.75,
    totalAmount: 15.75,
    currency: 'USD',
    gatewayId: 'plugin-stripe',
    gatewayTransactionId: 'ch_stripe_881920',
    status: 'paid',
    issuedAt: '2026-08-01T10:00:00.000Z',
    dueDate: '2026-08-01T10:00:00.000Z',
    paidAt: '2026-08-01T10:00:05.000Z',
    notes: 'Auto-renewed subscription receipt.',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:05.000Z'
  },
  {
    id: 'inv-1046',
    invoiceNumber: 'INV-2026-00046',
    orderType: 'subscription',
    subscriptionId: 'sub-1002',
    transactionId: 'tx-paypal-9912',
    userId: 'usr-jordan',
    userName: 'Jordan Lee',
    userEmail: 'jordan.lee@example.com',
    creatorId: 'crt-marcus',
    creatorName: 'Marcus Vance',
    lineItems: [
      { id: 'li-2', description: 'VIP Inner Circle Subscription (Monthly)', unitPrice: 30.0, quantity: 1, total: 30.0 },
      { id: 'li-3', description: 'VIP One-Time Onboarding Setup Fee', unitPrice: 10.0, quantity: 1, total: 10.0 }
    ],
    subtotal: 40.0,
    platformFee: 2.0,
    discountAmount: 5.0,
    couponCode: 'WELCOMEVIP',
    taxRate: 5.0,
    taxAmount: 1.75,
    totalAmount: 36.75,
    currency: 'USD',
    gatewayId: 'plugin-paypal',
    gatewayTransactionId: 'PAYID-M998124',
    status: 'failed',
    issuedAt: '2026-08-10T14:30:00.000Z',
    dueDate: '2026-08-15T14:30:00.000Z',
    notes: 'PayPal renewal charge failed. Entered grace period.',
    createdAt: '2026-08-10T14:30:00.000Z',
    updatedAt: '2026-08-14T15:00:00.000Z'
  },
  {
    id: 'inv-1045',
    invoiceNumber: 'INV-2026-00045',
    orderType: 'tip',
    transactionId: 'TX-002',
    userId: 'usr-jordan',
    userName: 'Jordan Lee',
    userEmail: 'jordan.lee@example.com',
    creatorId: 'crt-marcus',
    creatorName: 'Marcus Vance',
    lineItems: [
      { id: 'li-4', description: 'Direct Creator Tip Support', unitPrice: 25.0, quantity: 1, total: 25.0 }
    ],
    subtotal: 25.0,
    platformFee: 1.25,
    discountAmount: 0.0,
    taxRate: 0.0,
    taxAmount: 0.0,
    totalAmount: 25.0,
    currency: 'USD',
    gatewayId: 'plugin-piprapay',
    gatewayTransactionId: 'pp_tx_8819203',
    status: 'paid',
    issuedAt: '2026-08-11T16:00:00.000Z',
    dueDate: '2026-08-11T16:00:00.000Z',
    paidAt: '2026-08-11T16:00:02.000Z',
    notes: 'Creator fan support receipt.',
    createdAt: '2026-08-11T16:00:00.000Z',
    updatedAt: '2026-08-11T16:00:02.000Z'
  },
  {
    id: 'inv-1044',
    invoiceNumber: 'INV-2026-00044',
    orderType: 'wallet_funding',
    transactionId: 'TX-003',
    userId: 'usr-alex',
    userName: 'Alex Vance',
    userEmail: 'alex.vance@example.com',
    lineItems: [
      { id: 'li-5', description: 'Wallet Balance Top-Up via Visa •••• 8821', unitPrice: 100.0, quantity: 1, total: 100.0 }
    ],
    subtotal: 100.0,
    platformFee: 0.0,
    discountAmount: 0.0,
    taxRate: 0.0,
    taxAmount: 0.0,
    totalAmount: 100.0,
    currency: 'USD',
    gatewayId: 'plugin-stripe',
    gatewayTransactionId: 'ch_stripe_deposit_100',
    status: 'paid',
    issuedAt: '2026-08-10T11:15:00.000Z',
    dueDate: '2026-08-10T11:15:00.000Z',
    paidAt: '2026-08-10T11:15:01.000Z',
    notes: 'Wallet funds added to account balance.',
    createdAt: '2026-08-10T11:15:00.000Z',
    updatedAt: '2026-08-10T11:15:01.000Z'
  },
  {
    id: 'inv-1043',
    invoiceNumber: 'INV-2026-00043',
    orderType: 'subscription',
    subscriptionId: 'sub-1003',
    transactionId: 'TX-008',
    userId: 'usr-mia',
    userName: 'Mia Wong',
    userEmail: 'mia.wong@example.com',
    creatorId: 'crt-sarah',
    creatorName: 'Sarah Jenkins',
    lineItems: [
      { id: 'li-6', description: 'Starter Community Tier Subscription', unitPrice: 5.0, quantity: 1, total: 5.0 }
    ],
    subtotal: 5.0,
    platformFee: 0.25,
    discountAmount: 0.0,
    taxRate: 5.0,
    taxAmount: 0.25,
    totalAmount: 5.25,
    currency: 'USD',
    gatewayId: 'plugin-piprapay',
    gatewayTransactionId: 'pp_refunded_881',
    status: 'refunded',
    refundReference: 'REF-2026-8819',
    refundedAmount: 5.25,
    refundedAt: '2026-08-05T09:30:00.000Z',
    issuedAt: '2026-06-01T08:00:00.000Z',
    dueDate: '2026-06-01T08:00:00.000Z',
    paidAt: '2026-06-01T08:00:02.000Z',
    notes: 'Refunded upon member request.',
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-08-05T09:30:00.000Z'
  }
];

function notifyInvoiceStoreChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('creatorpulse_invoices_updated'));
  }
}

// Invoice Settings Store
export function getInvoiceSettings(): InvoiceSettings {
  if (typeof window === 'undefined') return DEFAULT_INVOICE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_INVOICE_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_INVOICE_SETTINGS_KEY, JSON.stringify(DEFAULT_INVOICE_SETTINGS));
      return DEFAULT_INVOICE_SETTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INVOICE_SETTINGS;
  }
}

export function saveInvoiceSettings(settings: InvoiceSettings): InvoiceSettings {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_INVOICE_SETTINGS_KEY, JSON.stringify(settings));
    notifyInvoiceStoreChanged();
  }
  return settings;
}

// Invoices Store
export function getPlatformInvoices(): PlatformInvoice[] {
  if (typeof window === 'undefined') return DEFAULT_PLATFORM_INVOICES;
  try {
    const raw = localStorage.getItem(STORAGE_INVOICES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(DEFAULT_PLATFORM_INVOICES));
      return DEFAULT_PLATFORM_INVOICES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PLATFORM_INVOICES;
  }
}

export function savePlatformInvoice(inv: Partial<PlatformInvoice>): PlatformInvoice {
  const invoices = getPlatformInvoices();
  const settings = getInvoiceSettings();
  const now = new Date().toISOString();

  let updated: PlatformInvoice;
  const idx = invoices.findIndex((i) => i.id === inv.id || i.invoiceNumber === inv.invoiceNumber);

  if (idx !== -1) {
    updated = { ...invoices[idx], ...inv, updatedAt: now };
    invoices[idx] = updated;
  } else {
    // Generate Invoice Number
    const year = new Date().getFullYear();
    const seq = settings.nextSequenceNumber;
    const formattedSeq = String(seq).padStart(5, '0');
    const invoiceNumber = `${settings.prefix}-${year}-${formattedSeq}`;

    // Update settings nextSequenceNumber
    saveInvoiceSettings({ ...settings, nextSequenceNumber: seq + 1 });

    const lineItems = inv.lineItems || [
      { id: 'li-new', description: 'Platform Services', unitPrice: inv.subtotal || 10.0, quantity: 1, total: inv.subtotal || 10.0 }
    ];

    const subtotal = inv.subtotal ?? lineItems.reduce((acc, li) => acc + li.total, 0);
    const discountAmount = inv.discountAmount ?? 0;
    const taxableBase = Math.max(0, subtotal - discountAmount);

    // Dynamic Server-Side Calculation Engine Integration
    let finalTaxRate: number = inv.taxRate ?? settings.defaultTaxRate ?? 0;
    let finalTaxAmount: number = inv.taxAmount ?? Math.round((taxableBase * (finalTaxRate / 100)) * 100) / 100;
    let finalPlatformFee: number = inv.platformFee ?? Math.round(subtotal * 0.05 * 100) / 100;
    let finalTotalAmount: number = inv.totalAmount ?? Math.round((taxableBase + finalTaxAmount) * 100) / 100;

    try {
      const { calculateTaxAndFees } = require('./tax-fee-store');
      const calc = calculateTaxAndFees({
        baseAmount: taxableBase,
        currency: inv.currency || 'USD',
        countryCode: 'US',
        paymentType: inv.orderType === 'subscription' ? 'subscription' : inv.orderType === 'wallet_funding' ? 'wallet_funding' : 'checkout',
        gatewayId: inv.gatewayId || 'plugin-mock'
      });

      if (inv.taxRate === undefined && calc.taxRate !== undefined) finalTaxRate = calc.taxRate;
      if (inv.taxAmount === undefined && calc.taxAmount !== undefined) finalTaxAmount = calc.taxAmount;
      if (inv.platformFee === undefined && calc.platformFeeAmount !== undefined) finalPlatformFee = calc.platformFeeAmount;
      if (inv.totalAmount === undefined && calc.buyerTotal !== undefined) finalTotalAmount = calc.buyerTotal;
    } catch (e) {}

    updated = {
      id: inv.id || `inv-${Date.now()}`,
      invoiceNumber: inv.invoiceNumber || invoiceNumber,
      orderType: inv.orderType || 'checkout',
      transactionId: inv.transactionId,
      subscriptionId: inv.subscriptionId,
      userId: inv.userId || 'usr-customer',
      userName: inv.userName || 'Customer',
      userEmail: inv.userEmail || 'customer@example.com',
      userAddress: inv.userAddress,
      creatorId: inv.creatorId,
      creatorName: inv.creatorName,
      lineItems,
      subtotal,
      platformFee: finalPlatformFee,
      discountAmount,
      couponCode: inv.couponCode,
      taxRate: finalTaxRate,
      taxAmount: finalTaxAmount,
      totalAmount: finalTotalAmount,
      currency: inv.currency || 'USD',
      gatewayId: inv.gatewayId || 'plugin-mock',
      gatewayTransactionId: inv.gatewayTransactionId,
      status: inv.status || 'paid',
      refundReference: inv.refundReference,
      issuedAt: inv.issuedAt || now,
      dueDate: inv.dueDate || now,
      paidAt: inv.status === 'paid' ? now : undefined,
      notes: inv.notes,
      createdAt: now,
      updatedAt: now
    };
    invoices.unshift(updated);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(invoices));
    notifyInvoiceStoreChanged();
  }
  return updated;
}

export function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus,
  refundDetails?: { refundReference: string; refundAmount: number }
): PlatformInvoice {
  const invoices = getPlatformInvoices();
  const idx = invoices.findIndex((i) => i.id === invoiceId);
  if (idx === -1) throw new Error(`Invoice ${invoiceId} not found.`);

  const now = new Date().toISOString();
  const target = invoices[idx];

  const updated: PlatformInvoice = {
    ...target,
    status,
    updatedAt: now,
    ...(status === 'paid' && !target.paidAt ? { paidAt: now } : {}),
    ...(status === 'refunded' && refundDetails
      ? {
          refundReference: refundDetails.refundReference,
          refundedAmount: refundDetails.refundAmount,
          refundedAt: now
        }
      : {})
  };

  invoices[idx] = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(invoices));
    notifyInvoiceStoreChanged();
  }
  return updated;
}

/**
 * Resend Email Receipt Simulator
 */
export function resendInvoiceEmailReceipt(invoiceId: string): { success: boolean; message: string } {
  const invoices = getPlatformInvoices();
  const invoice = invoices.find((i) => i.id === invoiceId);
  if (!invoice) return { success: false, message: 'Invoice not found.' };

  console.log(`[Invoice Engine] Resending email receipt for ${invoice.invoiceNumber} to ${invoice.userEmail}`);
  return {
    success: true,
    message: `Receipt for ${invoice.invoiceNumber} sent to ${invoice.userEmail} successfully.`
  };
}

/**
 * Renders printable HTML string for an invoice receipt
 */
export function renderInvoiceHTML(invoice: PlatformInvoice, settings: InvoiceSettings): string {
  const lineItemsHTML = invoice.lineItems
    .map(
      (li) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 13px;">${li.description}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 13px; text-align: center;">${li.quantity}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 13px; text-align: right;">${invoice.currency} $${li.unitPrice.toFixed(2)}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-weight: 700; font-size: 13px; text-align: right;">${invoice.currency} $${li.total.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; }
    .invoice-card { max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 900; background: linear-gradient(135deg, #4f46e5, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    .badge-paid { background: #dcfce7; color: #15803d; }
    .badge-failed { background: #ffe4e6; color: #be123c; }
    .badge-refunded { background: #fef3c7; color: #b45309; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 4px; }
    .val { font-size: 13px; font-weight: 600; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    th { background: #f8fafc; color: #475569; font-size: 11px; font-weight: 800; text-transform: uppercase; text-align: left; padding: 12px 16px; border-bottom: 2px solid #e2e8f0; }
    .totals-row { display: flex; justify-content: flex-end; }
    .totals-box { width: 300px; }
    .t-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; }
    .t-row.grand { font-size: 16px; font-weight: 900; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 6px; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 24px; font-size: 11px; color: #64748b; line-height: 1.6; text-align: center; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo">${settings.companyName || 'CreatorPulse'}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${settings.companyAddress}</div>
        <div style="font-size: 12px; color: #64748b;">Tax ID: ${settings.companyTaxId}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 20px; font-weight: 900; color: #0f172a;">INVOICE</div>
        <div style="font-size: 14px; font-weight: 700; color: #4f46e5; margin: 2px 0;">${invoice.invoiceNumber}</div>
        <div style="margin-top: 6px;">
          <span class="badge ${
            invoice.status === 'paid' ? 'badge-paid' : invoice.status === 'refunded' ? 'badge-refunded' : 'badge-failed'
          }">${invoice.status}</span>
        </div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="label">Billed To</div>
        <div class="val">${invoice.userName}</div>
        <div style="font-size: 12px; color: #64748b;">${invoice.userEmail}</div>
        ${invoice.userAddress ? `<div style="font-size: 12px; color: #64748b;">${invoice.userAddress}</div>` : ''}
      </div>
      <div>
        <div class="label">Invoice Details</div>
        <div class="t-row"><span style="color: #64748b;">Issued Date:</span> <span class="val">${invoice.issuedAt.substring(0, 10)}</span></div>
        <div class="t-row"><span style="color: #64748b;">Payment Gateway:</span> <span class="val">${invoice.gatewayId}</span></div>
        ${invoice.gatewayTransactionId ? `<div class="t-row"><span style="color: #64748b;">Txn Ref:</span> <span class="val" style="font-family: monospace;">${invoice.gatewayTransactionId}</span></div>` : ''}
        ${invoice.refundReference ? `<div class="t-row"><span style="color: #d97706;">Refund Ref:</span> <span class="val" style="font-family: monospace; color: #d97706;">${invoice.refundReference}</span></div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHTML}
      </tbody>
    </table>

    <div class="totals-row">
      <div class="totals-box">
        <div class="t-row"><span>Subtotal</span><span>${invoice.currency} $${invoice.subtotal.toFixed(2)}</span></div>
        ${invoice.discountAmount > 0 ? `<div class="t-row" style="color: #16a34a;"><span>Discount (${invoice.couponCode || 'Promo'})</span><span>-${invoice.currency} $${invoice.discountAmount.toFixed(2)}</span></div>` : ''}
        <div class="t-row"><span>Tax (${invoice.taxRate}%)</span><span>${invoice.currency} $${invoice.taxAmount.toFixed(2)}</span></div>
        <div class="t-row grand"><span>Total Paid</span><span>${invoice.currency} $${invoice.totalAmount.toFixed(2)}</span></div>
      </div>
    </div>

    <div class="footer">
      <p>${settings.footerTerms}</p>
      <p style="margin-top: 8px; font-weight: 700;">CreatorPulse Membership Platform • Generated Automatically</p>
    </div>
  </div>
</body>
</html>
  `;
}
