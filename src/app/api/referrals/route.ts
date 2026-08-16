import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ReferralEngine } from '@/lib/referrals/referral-engine';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'my_links': {
        const links = await ReferralEngine.getUserReferralLinks(user.id);
        return NextResponse.json({ success: true, links });
      }
      case 'my_conversions': {
        const conversions = await ReferralEngine.getConversions({ referrerId: user.id });
        return NextResponse.json({ success: true, conversions });
      }
      case 'my_earnings': {
        const earnings = await ReferralEngine.getUserEarnings(user.id);
        return NextResponse.json({ success: true, earnings });
      }
      case 'my_payouts': {
        const payouts = await ReferralEngine.getUserPayouts(user.id);
        return NextResponse.json({ success: true, payouts });
      }
      default:
        return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'generate_link': {
        const link = await ReferralEngine.generateReferralLink(user.id, body.campaignId, body.couponId);
        return NextResponse.json({ success: true, link });
      }
      case 'request_payout': {
        const payout = await ReferralEngine.requestPayout(user.id, body.amount, body.payoutMethod, body.accountDetails);
        return NextResponse.json({ success: true, payout });
      }
      case 'toggle_link': {
        const link = await ReferralEngine.toggleLinkActive(body.linkId, body.isActive);
        return NextResponse.json({ success: true, link });
      }
      default:
        return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server Error' }, { status: 500 });
  }
}
