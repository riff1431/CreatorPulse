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

    const { data: hasPermission, error: permError } = await supabase.rpc('has_permission', {
      usr_id: user.id,
      perm: 'manage_settings'
    });

    if (permError || !hasPermission) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    switch (action) {
      case 'settings': {
        const settings = await ReferralEngine.getSettings();
        return NextResponse.json({ success: true, settings });
      }
      case 'campaigns': {
        const filters = Object.fromEntries(searchParams.entries());
        const campaigns = await ReferralEngine.getCampaigns(filters);
        return NextResponse.json({ success: true, campaigns });
      }
      case 'conversions': {
        const filters = Object.fromEntries(searchParams.entries());
        const conversions = await ReferralEngine.getConversions(filters);
        return NextResponse.json({ success: true, conversions });
      }
      case 'payouts': {
        const filters = Object.fromEntries(searchParams.entries());
        const payouts = await ReferralEngine.getAllPayouts(filters);
        return NextResponse.json({ success: true, payouts });
      }
      case 'analytics': {
        const analytics = await ReferralEngine.getAdminAnalytics();
        return NextResponse.json({ success: true, analytics });
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

    const { data: hasPermission, error: permError } = await supabase.rpc('has_permission', {
      usr_id: user.id,
      perm: 'manage_settings'
    });

    if (permError || !hasPermission) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'update_settings': {
        const settings = await ReferralEngine.updateSettings(body.data);
        return NextResponse.json({ success: true, settings });
      }
      case 'create_campaign': {
        const campaign = await ReferralEngine.createCampaign(body.data);
        return NextResponse.json({ success: true, campaign });
      }
      case 'update_campaign': {
        const campaign = await ReferralEngine.updateCampaign(body.id, body.data);
        return NextResponse.json({ success: true, campaign });
      }
      case 'delete_campaign': {
        const result = await ReferralEngine.deleteCampaign(body.id);
        return NextResponse.json({ success: true, result });
      }
      case 'process_payout': {
        const payout = await ReferralEngine.processPayoutAdmin(body.payoutId, body.payoutAction, body.notes);
        return NextResponse.json({ success: true, payout });
      }
      case 'update_conversion': {
        const conversion = await ReferralEngine.updateConversionStatus(body.id, body.status, body.notes);
        return NextResponse.json({ success: true, conversion });
      }
      case 'bulk_update_conversions': {
        const result = await ReferralEngine.bulkUpdateConversions(body.ids, body.status);
        return NextResponse.json({ success: true, result });
      }
      default:
        return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server Error' }, { status: 500 });
  }
}
