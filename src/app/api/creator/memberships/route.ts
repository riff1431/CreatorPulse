import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_CREATOR_TIERS, CreatorTier } from '@/lib/memberships/membership-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId') || 'user-creator-1';

    const tiers: CreatorTier[] = INITIAL_CREATOR_TIERS[creatorId] || INITIAL_CREATOR_TIERS['user-creator-1'] || [];

    const activeTiers = tiers.filter((t) => t.status === 'active');
    const totalSubscribers = tiers.reduce((sum, t) => sum + (t.subscribersCount || 0), 0);
    const monthlyRecurringRevenue = activeTiers.reduce((sum, t) => sum + (t.subscribersCount || 0) * t.priceMonthly, 0);

    return NextResponse.json({
      success: true,
      creatorId,
      tiers,
      metrics: {
        totalTiersCount: tiers.length,
        activeTiersCount: activeTiers.length,
        totalSubscribers,
        monthlyRecurringRevenue,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch creator memberships' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, creatorId, tier, tierId, newIndex, oldIndex } = body;

    const targetCreatorId = creatorId || 'user-creator-1';
    let currentTiers = [...(INITIAL_CREATOR_TIERS[targetCreatorId] || INITIAL_CREATOR_TIERS['user-creator-1'])];

    switch (action) {
      case 'CREATE_TIER': {
        if (!tier?.name || !tier?.priceMonthly) {
          return NextResponse.json({ success: false, error: 'Missing required tier fields.' }, { status: 400 });
        }
        const newTier: CreatorTier = {
          id: `plan-${Date.now()}`,
          creatorId: targetCreatorId,
          name: tier.name,
          priceMonthly: Number(tier.priceMonthly),
          priceAnnual: tier.priceAnnual ? Number(tier.priceAnnual) : Number((tier.priceMonthly * 9.6).toFixed(2)),
          description: tier.description || '',
          benefits: Array.isArray(tier.benefits) ? tier.benefits : [],
          status: 'active',
          popular: !!tier.popular,
          colorBadge: tier.colorBadge || 'pink',
          icon: tier.icon || 'zap',
          category: tier.category || 'Community',
          memberLimit: tier.memberLimit ? Number(tier.memberLimit) : undefined,
          welcomeMessage: tier.welcomeMessage || '',
          createdAt: new Date().toISOString(),
        };
        currentTiers.push(newTier);
        return NextResponse.json({ success: true, tier: newTier, message: 'Tier created successfully.' });
      }

      case 'UPDATE_TIER': {
        if (!tierId) {
          return NextResponse.json({ success: false, error: 'Tier ID is required for update.' }, { status: 400 });
        }
        const index = currentTiers.findIndex((t) => t.id === tierId);
        if (index === -1) {
          return NextResponse.json({ success: false, error: 'Tier not found.' }, { status: 404 });
        }
        currentTiers[index] = { ...currentTiers[index], ...tier };
        return NextResponse.json({ success: true, tier: currentTiers[index], message: 'Tier updated successfully.' });
      }

      case 'DELETE_TIER': {
        if (!tierId) {
          return NextResponse.json({ success: false, error: 'Tier ID is required for deletion.' }, { status: 400 });
        }
        currentTiers = currentTiers.filter((t) => t.id !== tierId);
        return NextResponse.json({ success: true, message: 'Tier deleted successfully.' });
      }

      case 'REORDER_TIERS': {
        if (typeof oldIndex === 'number' && typeof newIndex === 'number') {
          const item = currentTiers.splice(oldIndex, 1)[0];
          currentTiers.splice(newIndex, 0, item);
          return NextResponse.json({ success: true, tiers: currentTiers, message: 'Tiers reordered.' });
        }
        return NextResponse.json({ success: false, error: 'Invalid reorder indices.' }, { status: 400 });
      }

      default:
        return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Membership operation failed' },
      { status: 500 }
    );
  }
}
