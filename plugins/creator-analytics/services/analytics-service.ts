export type TimeRange = '7d' | '30d' | '90d' | '12m';

export interface ProfileViewStat {
  period: string;
  views: number;
  uniqueViewers: number;
}

export interface TrafficSourceStat {
  source: string;
  count: number;
  percentage: number;
  color: string;
}

export interface FollowerGrowthStat {
  period: string;
  followers: number;
  subscribers: number;
  gained: number;
  lost: number;
}

export interface RevenueTrendStat {
  period: string;
  subscriptions: number;
  tips: number;
  payPerView: number;
  total: number;
}

export interface ContentMetricItem {
  id: string;
  title: string;
  type: 'Post' | 'Reel' | 'Story';
  thumbnailUrl?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTimeSeconds: number;
  completionRate: number;
  revenue: number;
  engagementRate: number;
  publishedAt: string;
}

export interface CreatorAnalyticsSummary {
  timeRange: TimeRange;
  profileViews: {
    total: number;
    changePercent: number;
    history: ProfileViewStat[];
    sources: TrafficSourceStat[];
  };
  followers: {
    totalFollowers: number;
    netGrowth: number;
    totalSubscribers: number;
    subscriberChurnRate: number;
    history: FollowerGrowthStat[];
  };
  contentSummary: {
    totalPosts: number;
    totalReels: number;
    totalStories: number;
    totalViews: number;
    avgEngagementRate: number;
    items: ContentMetricItem[];
  };
  revenue: {
    totalRevenue: number;
    changePercent: number;
    subscriptionsTotal: number;
    tipsTotal: number;
    ppvTotal: number;
    history: RevenueTrendStat[];
  };
}

export interface AdminAggregatedSummary {
  timeRange: TimeRange;
  totalPlatformCreators: number;
  totalActiveSubscribers: number;
  totalPlatformViews: number;
  totalPlatformRevenue: number;
  avgCreatorEarnings: number;
  topPerformingCreators: {
    rank: number;
    creatorId: string;
    name: string;
    handle: string;
    avatarUrl: string;
    followersCount: number;
    subscribersCount: number;
    monthlyRevenue: number;
    engagementRate: number;
  }[];
  contentFormatDistribution: {
    format: string;
    percentage: number;
    count: number;
    color: string;
  }[];
  peakEngagementHours: {
    hour: string;
    activityScore: number;
  }[];
}

const mockCreatorAnalytics: Record<TimeRange, CreatorAnalyticsSummary> = {
  '7d': {
    timeRange: '7d',
    profileViews: {
      total: 5840,
      changePercent: +14.2,
      history: [
        { period: 'Mon', views: 720, uniqueViewers: 580 },
        { period: 'Tue', views: 810, uniqueViewers: 640 },
        { period: 'Wed', views: 790, uniqueViewers: 610 },
        { period: 'Thu', views: 890, uniqueViewers: 720 },
        { period: 'Fri', views: 940, uniqueViewers: 780 },
        { period: 'Sat', views: 860, uniqueViewers: 690 },
        { period: 'Sun', views: 830, uniqueViewers: 670 }
      ],
      sources: [
        { source: 'Profile Direct Links', count: 2450, percentage: 42, color: '#EC4899' },
        { source: 'Posts Feed', count: 1630, percentage: 28, color: '#BE185D' },
        { source: 'Reels Explorer', count: 1170, percentage: 20, color: '#F43F5E' },
        { source: 'Stories Tray', count: 590, percentage: 10, color: '#F59E0B' }
      ]
    },
    followers: {
      totalFollowers: 14280,
      netGrowth: +210,
      totalSubscribers: 1420,
      subscriberChurnRate: 1.2,
      history: [
        { period: 'Mon', followers: 14080, subscribers: 1390, gained: 42, lost: 6 },
        { period: 'Tue', followers: 14120, subscribers: 1398, gained: 48, lost: 8 },
        { period: 'Wed', followers: 14150, subscribers: 1404, gained: 38, lost: 8 },
        { period: 'Thu', followers: 14190, subscribers: 1410, gained: 46, lost: 6 },
        { period: 'Fri', followers: 14220, subscribers: 1415, gained: 39, lost: 9 },
        { period: 'Sat', followers: 14250, subscribers: 1418, gained: 37, lost: 7 },
        { period: 'Sun', followers: 14280, subscribers: 1420, gained: 36, lost: 6 }
      ]
    },
    contentSummary: {
      totalPosts: 3,
      totalReels: 2,
      totalStories: 18,
      totalViews: 24800,
      avgEngagementRate: 8.4,
      items: [
        { id: 'c1', title: '🚀 5 Advanced Next.js App Router Optimizations', type: 'Post', views: 8400, likes: 920, comments: 142, shares: 68, watchTimeSeconds: 0, completionRate: 0, revenue: 185.00, engagementRate: 13.4, publishedAt: '2026-08-14' },
        { id: 'c2', title: '✨ Quick Micro-Interactions in React & Tailwind', type: 'Reel', views: 12400, likes: 1450, comments: 210, shares: 185, watchTimeSeconds: 42, completionRate: 78.5, revenue: 320.50, engagementRate: 14.8, publishedAt: '2026-08-12' },
        { id: 'c3', title: 'Behind the Scenes: My Studio Setup 2026', type: 'Story', views: 2400, likes: 310, comments: 45, shares: 12, watchTimeSeconds: 15, completionRate: 89.0, revenue: 45.00, engagementRate: 15.2, publishedAt: '2026-08-15' },
        { id: 'c4', title: 'System Architecture Checklist for SaaS', type: 'Post', views: 1600, likes: 180, comments: 28, shares: 19, watchTimeSeconds: 0, completionRate: 0, revenue: 60.00, engagementRate: 14.1, publishedAt: '2026-08-10' }
      ]
    },
    revenue: {
      totalRevenue: 611.00,
      changePercent: +18.5,
      subscriptionsTotal: 420.00,
      tipsTotal: 125.00,
      ppvTotal: 66.00,
      history: [
        { period: 'Mon', subscriptions: 55, tips: 15, payPerView: 10, total: 80 },
        { period: 'Tue', subscriptions: 60, tips: 20, payPerView: 12, total: 92 },
        { period: 'Wed', subscriptions: 58, tips: 12, payPerView: 8, total: 78 },
        { period: 'Thu', subscriptions: 62, tips: 25, payPerView: 15, total: 102 },
        { period: 'Fri', subscriptions: 65, tips: 22, payPerView: 11, total: 98 },
        { period: 'Sat', subscriptions: 60, tips: 16, payPerView: 5, total: 81 },
        { period: 'Sun', subscriptions: 60, tips: 15, payPerView: 5, total: 80 }
      ]
    }
  },
  '30d': {
    timeRange: '30d',
    profileViews: {
      total: 28400,
      changePercent: +22.8,
      history: [
        { period: 'Week 1', views: 6200, uniqueViewers: 4800 },
        { period: 'Week 2', views: 6800, uniqueViewers: 5300 },
        { period: 'Week 3', views: 7500, uniqueViewers: 5900 },
        { period: 'Week 4', views: 7900, uniqueViewers: 6200 }
      ],
      sources: [
        { source: 'Profile Direct Links', count: 11928, percentage: 42, color: '#EC4899' },
        { source: 'Posts Feed', count: 7952, percentage: 28, color: '#BE185D' },
        { source: 'Reels Explorer', count: 5680, percentage: 20, color: '#F43F5E' },
        { source: 'Stories Tray', count: 2840, percentage: 10, color: '#F59E0B' }
      ]
    },
    followers: {
      totalFollowers: 14280,
      netGrowth: +1480,
      totalSubscribers: 1420,
      subscriberChurnRate: 2.1,
      history: [
        { period: 'Week 1', followers: 13100, subscribers: 1280, gained: 340, lost: 40 },
        { period: 'Week 2', followers: 13500, subscribers: 1320, gained: 430, lost: 30 },
        { period: 'Week 3', followers: 13900, subscribers: 1370, gained: 420, lost: 20 },
        { period: 'Week 4', followers: 14280, subscribers: 1420, gained: 410, lost: 30 }
      ]
    },
    contentSummary: {
      totalPosts: 12,
      totalReels: 6,
      totalStories: 72,
      totalViews: 118400,
      avgEngagementRate: 9.1,
      items: [
        { id: 'c2', title: '✨ Quick Micro-Interactions in React & Tailwind', type: 'Reel', views: 42500, likes: 4800, comments: 620, shares: 480, watchTimeSeconds: 42, completionRate: 78.5, revenue: 1250.00, engagementRate: 13.8, publishedAt: '2026-08-02' },
        { id: 'c1', title: '🚀 5 Advanced Next.js App Router Optimizations', type: 'Post', views: 28400, likes: 3100, comments: 410, shares: 290, watchTimeSeconds: 0, completionRate: 0, revenue: 780.00, engagementRate: 13.3, publishedAt: '2026-08-08' },
        { id: 'c5', title: '🎨 Designing Modern Dark Mode Interfaces in Figma', type: 'Reel', views: 19800, likes: 2150, comments: 240, shares: 180, watchTimeSeconds: 58, completionRate: 65.2, revenue: 540.00, engagementRate: 13.0, publishedAt: '2026-07-28' },
        { id: 'c6', title: '💡 How I Scaled My Creator Business to 5-Figures', type: 'Post', views: 16500, likes: 1950, comments: 280, shares: 140, watchTimeSeconds: 0, completionRate: 0, revenue: 420.00, engagementRate: 14.3, publishedAt: '2026-07-24' },
        { id: 'c3', title: 'Behind the Scenes: My Studio Setup 2026', type: 'Story', views: 11200, likes: 1380, comments: 190, shares: 42, watchTimeSeconds: 15, completionRate: 89.0, revenue: 180.00, engagementRate: 14.4, publishedAt: '2026-08-15' }
      ]
    },
    revenue: {
      totalRevenue: 3170.00,
      changePercent: +24.1,
      subscriptionsTotal: 2100.00,
      tipsTotal: 650.00,
      ppvTotal: 420.00,
      history: [
        { period: 'Week 1', subscriptions: 480, tips: 140, payPerView: 90, total: 710 },
        { period: 'Week 2', subscriptions: 520, tips: 160, payPerView: 110, total: 790 },
        { period: 'Week 3', subscriptions: 540, tips: 175, payPerView: 105, total: 820 },
        { period: 'Week 4', subscriptions: 560, tips: 175, payPerView: 115, total: 850 }
      ]
    }
  },
  '90d': {
    timeRange: '90d',
    profileViews: {
      total: 82500,
      changePercent: +31.5,
      history: [
        { period: 'Month 1', views: 22400, uniqueViewers: 17800 },
        { period: 'Month 2', views: 26500, uniqueViewers: 20900 },
        { period: 'Month 3', views: 33600, uniqueViewers: 26200 }
      ],
      sources: [
        { source: 'Profile Direct Links', count: 34650, percentage: 42, color: '#EC4899' },
        { source: 'Posts Feed', count: 23100, percentage: 28, color: '#BE185D' },
        { source: 'Reels Explorer', count: 16500, percentage: 20, color: '#F43F5E' },
        { source: 'Stories Tray', count: 8250, percentage: 10, color: '#F59E0B' }
      ]
    },
    followers: {
      totalFollowers: 14280,
      netGrowth: +4820,
      totalSubscribers: 1420,
      subscriberChurnRate: 1.8,
      history: [
        { period: 'Month 1', followers: 9460, subscribers: 920, gained: 1600, lost: 120 },
        { period: 'Month 2', followers: 11800, subscribers: 1180, gained: 2460, lost: 120 },
        { period: 'Month 3', followers: 14280, subscribers: 1420, gained: 2600, lost: 120 }
      ]
    },
    contentSummary: {
      totalPosts: 36,
      totalReels: 18,
      totalStories: 216,
      totalViews: 345000,
      avgEngagementRate: 9.6,
      items: [
        { id: 'c2', title: '✨ Quick Micro-Interactions in React & Tailwind', type: 'Reel', views: 98000, likes: 11200, comments: 1420, shares: 1100, watchTimeSeconds: 42, completionRate: 78.5, revenue: 2850.00, engagementRate: 14.0, publishedAt: '2026-08-02' },
        { id: 'c1', title: '🚀 5 Advanced Next.js App Router Optimizations', type: 'Post', views: 64000, likes: 7200, comments: 910, shares: 620, watchTimeSeconds: 0, completionRate: 0, revenue: 1950.00, engagementRate: 13.6, publishedAt: '2026-08-08' },
        { id: 'c5', title: '🎨 Designing Modern Dark Mode Interfaces in Figma', type: 'Reel', views: 48000, likes: 5400, comments: 620, shares: 410, watchTimeSeconds: 58, completionRate: 65.2, revenue: 1350.00, engagementRate: 13.4, publishedAt: '2026-07-28' },
        { id: 'c6', title: '💡 How I Scaled My Creator Business to 5-Figures', type: 'Post', views: 42000, likes: 4900, comments: 590, shares: 380, watchTimeSeconds: 0, completionRate: 0, revenue: 1100.00, engagementRate: 14.0, publishedAt: '2026-07-24' }
      ]
    },
    revenue: {
      totalRevenue: 8940.00,
      changePercent: +35.8,
      subscriptionsTotal: 5800.00,
      tipsTotal: 1940.00,
      ppvTotal: 1200.00,
      history: [
        { period: 'Month 1', subscriptions: 1600, tips: 500, payPerView: 300, total: 2400 },
        { period: 'Month 2', subscriptions: 1900, tips: 640, payPerView: 400, total: 2940 },
        { period: 'Month 3', subscriptions: 2300, tips: 800, payPerView: 500, total: 3600 }
      ]
    }
  },
  '12m': {
    timeRange: '12m',
    profileViews: {
      total: 310000,
      changePercent: +85.4,
      history: [
        { period: 'Q1', views: 52000, uniqueViewers: 41000 },
        { period: 'Q2', views: 74000, uniqueViewers: 58000 },
        { period: 'Q3', views: 88000, uniqueViewers: 69000 },
        { period: 'Q4', views: 96000, uniqueViewers: 76000 }
      ],
      sources: [
        { source: 'Profile Direct Links', count: 130200, percentage: 42, color: '#EC4899' },
        { source: 'Posts Feed', count: 86800, percentage: 28, color: '#BE185D' },
        { source: 'Reels Explorer', count: 62000, percentage: 20, color: '#F43F5E' },
        { source: 'Stories Tray', count: 31000, percentage: 10, color: '#F59E0B' }
      ]
    },
    followers: {
      totalFollowers: 14280,
      netGrowth: +9620,
      totalSubscribers: 1420,
      subscriberChurnRate: 1.5,
      history: [
        { period: 'Q1', followers: 4660, subscribers: 420, gained: 2100, lost: 180 },
        { period: 'Q2', followers: 7800, subscribers: 780, gained: 3340, lost: 200 },
        { period: 'Q3', followers: 11200, subscribers: 1120, gained: 3600, lost: 200 },
        { period: 'Q4', followers: 14280, subscribers: 1420, gained: 3280, lost: 200 }
      ]
    },
    contentSummary: {
      totalPosts: 144,
      totalReels: 72,
      totalStories: 860,
      totalViews: 1420000,
      avgEngagementRate: 9.8,
      items: [
        { id: 'c2', title: '✨ Quick Micro-Interactions in React & Tailwind', type: 'Reel', views: 240000, likes: 28400, comments: 3420, shares: 2800, watchTimeSeconds: 42, completionRate: 78.5, revenue: 7850.00, engagementRate: 14.4, publishedAt: '2026-08-02' },
        { id: 'c1', title: '🚀 5 Advanced Next.js App Router Optimizations', type: 'Post', views: 185000, likes: 21000, comments: 2600, shares: 1900, watchTimeSeconds: 0, completionRate: 0, revenue: 5400.00, engagementRate: 13.8, publishedAt: '2026-08-08' }
      ]
    },
    revenue: {
      totalRevenue: 34200.00,
      changePercent: +92.0,
      subscriptionsTotal: 22800.00,
      tipsTotal: 7400.00,
      ppvTotal: 4000.00,
      history: [
        { period: 'Q1', subscriptions: 3600, tips: 1100, payPerView: 600, total: 5300 },
        { period: 'Q2', subscriptions: 5400, tips: 1700, payPerView: 900, total: 8000 },
        { period: 'Q3', subscriptions: 6500, tips: 2100, payPerView: 1200, total: 9800 },
        { period: 'Q4', subscriptions: 7300, tips: 2500, payPerView: 1300, total: 11100 }
      ]
    }
  }
};

const mockAdminAggregated: Record<TimeRange, AdminAggregatedSummary> = {
  '7d': {
    timeRange: '7d',
    totalPlatformCreators: 128,
    totalActiveSubscribers: 8940,
    totalPlatformViews: 185000,
    totalPlatformRevenue: 42800.00,
    avgCreatorEarnings: 334.37,
    topPerformingCreators: [
      { rank: 1, creatorId: 'cr_1', name: 'Sophia Chen', handle: '@sophiacodes', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', followersCount: 42800, subscribersCount: 3120, monthlyRevenue: 8450.00, engagementRate: 14.2 },
      { rank: 2, creatorId: 'cr_2', name: 'Marcus Vance', handle: '@marcusvance', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', followersCount: 36500, subscribersCount: 2450, monthlyRevenue: 6890.00, engagementRate: 12.8 },
      { rank: 3, creatorId: 'cr_3', name: 'Elena Rostova', handle: '@elenadesign', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', followersCount: 29400, subscribersCount: 1980, monthlyRevenue: 5120.00, engagementRate: 11.5 },
      { rank: 4, creatorId: 'cr_4', name: 'Devon Knight', handle: '@devonbeats', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', followersCount: 24100, subscribersCount: 1650, monthlyRevenue: 4320.00, engagementRate: 13.1 }
    ],
    contentFormatDistribution: [
      { format: 'Short Video Reels', percentage: 48, count: 88800, color: '#F43F5E' },
      { format: 'Rich Posts & Articles', percentage: 32, count: 59200, color: '#BE185D' },
      { format: '24h Ephemeral Stories', percentage: 20, count: 37000, color: '#F59E0B' }
    ],
    peakEngagementHours: [
      { hour: '00:00', activityScore: 25 },
      { hour: '04:00', activityScore: 12 },
      { hour: '08:00', activityScore: 55 },
      { hour: '12:00', activityScore: 78 },
      { hour: '16:00', activityScore: 88 },
      { hour: '20:00', activityScore: 98 },
      { hour: '22:00', activityScore: 84 }
    ]
  },
  '30d': {
    timeRange: '30d',
    totalPlatformCreators: 128,
    totalActiveSubscribers: 8940,
    totalPlatformViews: 842000,
    totalPlatformRevenue: 198400.00,
    avgCreatorEarnings: 1550.00,
    topPerformingCreators: [
      { rank: 1, creatorId: 'cr_1', name: 'Sophia Chen', handle: '@sophiacodes', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', followersCount: 42800, subscribersCount: 3120, monthlyRevenue: 32450.00, engagementRate: 14.8 },
      { rank: 2, creatorId: 'cr_2', name: 'Marcus Vance', handle: '@marcusvance', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', followersCount: 36500, subscribersCount: 2450, monthlyRevenue: 26890.00, engagementRate: 13.2 },
      { rank: 3, creatorId: 'cr_3', name: 'Elena Rostova', handle: '@elenadesign', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', followersCount: 29400, subscribersCount: 1980, monthlyRevenue: 21120.00, engagementRate: 12.1 },
      { rank: 4, creatorId: 'cr_4', name: 'Devon Knight', handle: '@devonbeats', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', followersCount: 24100, subscribersCount: 1650, monthlyRevenue: 18320.00, engagementRate: 13.6 }
    ],
    contentFormatDistribution: [
      { format: 'Short Video Reels', percentage: 52, count: 437840, color: '#F43F5E' },
      { format: 'Rich Posts & Articles', percentage: 30, count: 252600, color: '#BE185D' },
      { format: '24h Ephemeral Stories', percentage: 18, count: 151560, color: '#F59E0B' }
    ],
    peakEngagementHours: [
      { hour: '00:00', activityScore: 30 },
      { hour: '04:00', activityScore: 15 },
      { hour: '08:00', activityScore: 62 },
      { hour: '12:00', activityScore: 84 },
      { hour: '16:00', activityScore: 92 },
      { hour: '20:00', activityScore: 100 },
      { hour: '22:00', activityScore: 88 }
    ]
  },
  '90d': {
    timeRange: '90d',
    totalPlatformCreators: 128,
    totalActiveSubscribers: 8940,
    totalPlatformViews: 2650000,
    totalPlatformRevenue: 612000.00,
    avgCreatorEarnings: 4781.25,
    topPerformingCreators: [
      { rank: 1, creatorId: 'cr_1', name: 'Sophia Chen', handle: '@sophiacodes', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', followersCount: 42800, subscribersCount: 3120, monthlyRevenue: 98400.00, engagementRate: 15.1 }
    ],
    contentFormatDistribution: [
      { format: 'Short Video Reels', percentage: 50, count: 1325000, color: '#F43F5E' },
      { format: 'Rich Posts & Articles', percentage: 32, count: 848000, color: '#BE185D' },
      { format: '24h Ephemeral Stories', percentage: 18, count: 477000, color: '#F59E0B' }
    ],
    peakEngagementHours: [
      { hour: '00:00', activityScore: 28 },
      { hour: '04:00', activityScore: 14 },
      { hour: '08:00', activityScore: 60 },
      { hour: '12:00', activityScore: 80 },
      { hour: '16:00', activityScore: 90 },
      { hour: '20:00', activityScore: 98 },
      { hour: '22:00', activityScore: 85 }
    ]
  },
  '12m': {
    timeRange: '12m',
    totalPlatformCreators: 128,
    totalActiveSubscribers: 8940,
    totalPlatformViews: 11200000,
    totalPlatformRevenue: 2480000.00,
    avgCreatorEarnings: 19375.00,
    topPerformingCreators: [
      { rank: 1, creatorId: 'cr_1', name: 'Sophia Chen', handle: '@sophiacodes', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', followersCount: 42800, subscribersCount: 3120, monthlyRevenue: 385000.00, engagementRate: 15.5 }
    ],
    contentFormatDistribution: [
      { format: 'Short Video Reels', percentage: 54, count: 6048000, color: '#F43F5E' },
      { format: 'Rich Posts & Articles', percentage: 28, count: 3136000, color: '#BE185D' },
      { format: '24h Ephemeral Stories', percentage: 18, count: 2016000, color: '#F59E0B' }
    ],
    peakEngagementHours: [
      { hour: '00:00', activityScore: 32 },
      { hour: '04:00', activityScore: 18 },
      { hour: '08:00', activityScore: 65 },
      { hour: '12:00', activityScore: 86 },
      { hour: '16:00', activityScore: 94 },
      { hour: '20:00', activityScore: 100 },
      { hour: '22:00', activityScore: 90 }
    ]
  }
};

export class AnalyticsService {
  /**
   * Get creator analytics summary for a given time range
   */
  public static getCreatorAnalytics(range: TimeRange = '30d'): CreatorAnalyticsSummary {
    return mockCreatorAnalytics[range] || mockCreatorAnalytics['30d'];
  }

  /**
   * Get admin-level aggregated platform analytics for a given time range
   */
  public static getAdminAnalytics(range: TimeRange = '30d'): AdminAggregatedSummary {
    return mockAdminAggregated[range] || mockAdminAggregated['30d'];
  }

  /**
   * Track an analytics event
   */
  public static trackEvent(
    eventType: string,
    creatorId: string,
    contentId?: string,
    contentType?: string,
    metadata?: Record<string, unknown>
  ) {
    console.log(`[Plugin: Creator Analytics] Event logged: ${eventType} for creator ${creatorId}`, {
      contentId,
      contentType,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Export Creator Analytics data as CSV string
   */
  public static generateCSVReport(summary: CreatorAnalyticsSummary): string {
    const lines: string[] = [];

    lines.push(`Creator Analytics & Insights Report (${summary.timeRange.toUpperCase()})`);
    lines.push(`Generated At: ${new Date().toLocaleString()}`);
    lines.push('');

    lines.push('--- SUMMARY OVERVIEW ---');
    lines.push(`Total Profile Views,${summary.profileViews.total}`);
    lines.push(`Total Followers,${summary.followers.totalFollowers}`);
    lines.push(`Net Follower Growth,${summary.followers.netGrowth}`);
    lines.push(`Total Active Subscribers,${summary.followers.totalSubscribers}`);
    lines.push(`Subscriber Churn Rate,${summary.followers.subscriberChurnRate}%`);
    lines.push(`Average Engagement Rate,${summary.contentSummary.avgEngagementRate}%`);
    lines.push(`Total Revenue ($),${summary.revenue.totalRevenue.toFixed(2)}`);
    lines.push('');

    lines.push('--- TOP PERFORMING CONTENT ---');
    lines.push('Content ID,Title,Format,Views,Likes,Comments,Shares,Watch Time (Sec),Completion Rate (%),Revenue ($),Engagement Rate (%)');

    summary.contentSummary.items.forEach((item) => {
      const cleanTitle = `"${item.title.replace(/"/g, '""')}"`;
      lines.push([
        item.id,
        cleanTitle,
        item.type,
        item.views,
        item.likes,
        item.comments,
        item.shares,
        item.watchTimeSeconds,
        item.completionRate,
        item.revenue.toFixed(2),
        item.engagementRate
      ].join(','));
    });

    lines.push('');
    lines.push('--- REVENUE BREAKDOWN ---');
    lines.push('Period,Subscriptions ($),Tips ($),Pay-Per-View ($),Total ($)');
    summary.revenue.history.forEach((h) => {
      lines.push(`${h.period},${h.subscriptions.toFixed(2)},${h.tips.toFixed(2)},${h.payPerView.toFixed(2)},${h.total.toFixed(2)}`);
    });

    return lines.join('\n');
  }

  /**
   * Export Creator Analytics data as formatted JSON string
   */
  public static generateJSONReport(summary: CreatorAnalyticsSummary): string {
    return JSON.stringify({
      reportType: 'Creator Analytics & Insights',
      generatedAt: new Date().toISOString(),
      timeRange: summary.timeRange,
      summary
    }, null, 2);
  }

  /**
   * Export Admin Aggregated Analytics data as CSV string
   */
  public static generateAdminCSVReport(summary: AdminAggregatedSummary): string {
    const lines: string[] = [];

    lines.push(`CreatorPulse Platform Aggregated Analytics Report (${summary.timeRange.toUpperCase()})`);
    lines.push(`Generated At: ${new Date().toLocaleString()}`);
    lines.push('');

    lines.push('--- PLATFORM METRICS ---');
    lines.push(`Total Platform Creators,${summary.totalPlatformCreators}`);
    lines.push(`Total Active Subscribers,${summary.totalActiveSubscribers}`);
    lines.push(`Total Platform Views,${summary.totalPlatformViews}`);
    lines.push(`Total Platform Revenue ($),${summary.totalPlatformRevenue.toFixed(2)}`);
    lines.push(`Average Creator Earnings ($),${summary.avgCreatorEarnings.toFixed(2)}`);
    lines.push('');

    lines.push('--- TOP PERFORMING CREATORS LEADERBOARD ---');
    lines.push('Rank,Creator Name,Handle,Followers,Subscribers,Monthly Revenue ($),Engagement Rate (%)');
    summary.topPerformingCreators.forEach((c) => {
      lines.push(`${c.rank},"${c.name}",${c.handle},${c.followersCount},${c.subscribersCount},${c.monthlyRevenue.toFixed(2)},${c.engagementRate}%`);
    });

    return lines.join('\n');
  }
}
