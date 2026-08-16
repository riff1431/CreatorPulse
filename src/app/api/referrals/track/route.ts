import { NextRequest, NextResponse } from 'next/server';
import { ReferralEngine } from '@/lib/referrals/referral-engine';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const refCode = searchParams.get('ref');

    if (refCode) {
      await ReferralEngine.trackClick(refCode);
    }
  } catch (err: any) {
    console.error('[Referral Tracking] Error tracking click:', err);
  } finally {
    return NextResponse.redirect(new URL('/', req.url));
  }
}
