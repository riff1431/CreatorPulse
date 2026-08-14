import { CreatorProfile, MOCK_CREATOR_DETAILS, MOCK_MEMBERSHIP_PLANS } from '@/lib/supabase/store';

export class CreatorService {
  static getFeaturedCreators(): CreatorProfile[] {
    return Object.values(MOCK_CREATOR_DETAILS);
  }

  static getCreatorByUsername(username: string): CreatorProfile | undefined {
    return Object.values(MOCK_CREATOR_DETAILS).find(
      (c) => c.username.toLowerCase() === username.toLowerCase()
    );
  }

  static calculateCreatorMetrics(creatorId: string) {
    const detail = MOCK_CREATOR_DETAILS[creatorId];
    if (!detail) {
      return {
        subscribers: 0,
        monthlyGross: 0,
        availableEarnings: 0,
        tierCount: 0,
      };
    }
    const plans = MOCK_MEMBERSHIP_PLANS[creatorId] || [];
    return {
      subscribers: detail.subscriberCount,
      monthlyGross: detail.totalRevenue,
      availableEarnings: detail.availableEarnings,
      tierCount: plans.length,
    };
  }
}
