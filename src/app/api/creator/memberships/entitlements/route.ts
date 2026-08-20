import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_TIER_ENTITLEMENTS } from '@/lib/memberships/entitlement-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const creatorId = searchParams.get('creatorId');

    if (!userId || !creatorId) {
      return NextResponse.json({ success: false, error: 'userId and creatorId are required.' }, { status: 400 });
    }

    // If viewing own content as creator
    if (userId === creatorId) {
      return NextResponse.json({
        success: true,
        hasAccess: true,
        isCreator: true,
        tierLevel: 99,
        entitlements: {
          can_view_vip_posts: true,
          can_download_assets: true,
          can_direct_message: true,
          has_supporter_badge: true,
          can_book_call: true,
          can_access_discord: true,
          commercial_license: true,
        }
      });
    }

    // Default entitlements resolution
    const defaultEntitlements = DEFAULT_TIER_ENTITLEMENTS['Community'];

    return NextResponse.json({
      success: true,
      hasAccess: true,
      tierLevel: 1,
      entitlements: defaultEntitlements
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to resolve user entitlements' },
      { status: 500 }
    );
  }
}
