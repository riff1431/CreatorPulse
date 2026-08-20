import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userName, userUsername, userAvatar, creatorId, creatorName, creatorUsername, creatorAvatar, tierId, billingCycle, paymentMethod } = body;

    if (!userId || !creatorId || !tierId) {
      return NextResponse.json({ success: false, error: 'Missing required subscription fields.' }, { status: 400 });
    }

    const currentPeriodEnd = new Date();
    if (billingCycle === 'annual') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
    }

    const subscription = {
      id: `sub-${Date.now()}`,
      userId,
      userName: userName || 'Patron Fan',
      userUsername: userUsername || 'patron',
      userAvatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      creatorId,
      creatorName: creatorName || 'Creator',
      creatorUsername: creatorUsername || 'creator',
      creatorAvatar: creatorAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      tierId,
      billingCycle: billingCycle || 'monthly',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      autoRenew: true,
      paymentMethod: paymentMethod || 'wallet',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Subscription successfully activated! All tier perks & facilities are now unlocked.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
