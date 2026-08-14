import { NextResponse } from 'next/server';
import { getPaymentLogs } from '@/lib/payments/payment-service';

export async function GET() {
  try {
    const logs = getPaymentLogs();
    return NextResponse.json(logs);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
