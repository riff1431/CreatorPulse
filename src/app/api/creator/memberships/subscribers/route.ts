import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId') || 'user-creator-1';

    // Mock rich subscribers list for creator studio
    const subscribers = [
      {
        id: 'sub-1',
        name: 'Alex Rivers',
        username: 'alexrivers',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        tierName: 'Pro Designer Tier',
        tierIcon: 'zap',
        priceMonthly: 15.00,
        billingCycle: 'monthly',
        status: 'active',
        joinedDate: '2026-06-15',
        totalPaid: 45.00,
        lastPayment: '2026-08-15',
      },
      {
        id: 'sub-2',
        name: 'Sophia Chen',
        username: 'sophiac',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        tierName: 'VIP Inner Circle',
        tierIcon: 'crown',
        priceMonthly: 30.00,
        billingCycle: 'annual',
        status: 'active',
        joinedDate: '2026-05-10',
        totalPaid: 288.00,
        lastPayment: '2026-05-10',
      },
      {
        id: 'sub-3',
        name: 'Marcus Vance',
        username: 'marcuscode',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        tierName: 'Starter Community',
        tierIcon: 'star',
        priceMonthly: 5.00,
        billingCycle: 'monthly',
        status: 'active',
        joinedDate: '2026-07-20',
        totalPaid: 10.00,
        lastPayment: '2026-08-20',
      },
      {
        id: 'sub-4',
        name: 'David Kim',
        username: 'davidbeats',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        tierName: 'Pro Designer Tier',
        tierIcon: 'zap',
        priceMonthly: 15.00,
        billingCycle: 'monthly',
        status: 'active',
        joinedDate: '2026-04-12',
        totalPaid: 60.00,
        lastPayment: '2026-08-12',
      },
    ];

    const totalMRR = subscribers.reduce((sum, s) => sum + s.priceMonthly, 0);

    return NextResponse.json({
      success: true,
      creatorId,
      subscribers,
      metrics: {
        totalActiveSubscribers: subscribers.length,
        totalMRR,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
