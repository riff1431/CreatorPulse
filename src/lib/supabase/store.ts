export type UserRole = 'guest' | 'member' | 'creator' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  coverUrl?: string;
  bio: string;
  role: UserRole;
  isVerified: boolean;
  category?: string;
  createdAt: string;
}

export interface CreatorProfile extends UserProfile {
  headline: string;
  coverImageUrl: string;
  followerCount: number;
  subscriberCount: number;
  startingPrice: number;
  monthlyPrice?: number;
  totalRevenue: number;
  availableEarnings: number;
  pendingEarnings: number;
  profileViews: number;
  payoutMethod: string;
  perks?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface MembershipPlan {
  id: string;
  creatorId: string;
  name: string;
  priceMonthly: number;
  description: string;
  benefits: string[];
  popular?: boolean;
}

export interface SubscriptionItem {
  id: string;
  memberId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  planName: string;
  durationMonths: number;
  amount: number;
  autoRenew: boolean;
  status: 'active' | 'cancelled' | 'expired';
  expiresAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorVerified: boolean;
  authorCategory: string;
  title?: string;
  content: string;
  postType: 'text' | 'image' | 'video' | 'short' | 'audio' | 'poll';
  mediaUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  poll?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
    userVotedId?: string;
  };
  visibility: 'public' | 'followers' | 'subscribers' | 'members_only' | 'vip_only';
  unlockPrice?: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface Story {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorUsername: string;
  mediaUrl: string;
  caption?: string;
  createdAt: string;
  expiresAt: string;
}

export interface Reel {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  title: string;
  videoUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  category: string;
  hashtags: string[];
}

export type ShortVideo = Reel;

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  mediaUrl?: string;
  audioUrl?: string;
  isPaywalled?: boolean;
  unlockPrice?: number;
  isUnlocked?: boolean;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationThread {
  id: string;
  participantId: string;
  participantName: string;
  participantUsername: string;
  participantAvatar: string;
  participantVerified: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface UserBalance {
  availableBalance: number;
  pendingBalance: number;
  totalSpent: number;
  creatorTotalEarnings: number;
}

export interface TransactionRecord {
  id: string;
  date: string;
  type: 'Top-Up' | 'Membership' | 'Tip Support' | 'Premium Unlock' | 'Payout';
  description: string;
  recipientOrSender: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface PayoutRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  amount: number;
  processingFee: number;
  netPayout: number;
  payoutMethod: string;
  accountDetails: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'subscriber' | 'tip' | 'like' | 'comment' | 'payout';
}

export interface ReportItem {
  id: string;
  reporterName: string;
  targetType: 'post' | 'user' | 'comment';
  targetTitle: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface CreatorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  category: string;
  portfolioUrl: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

// ----------------------------------------------------------------------------
// SEED MOCK DATA
// ----------------------------------------------------------------------------
export const MOCK_USERS: Record<string, UserProfile> = {
  'user-member': {
    id: 'user-member',
    email: 'alex@community.io',
    fullName: 'Alex Vance',
    username: 'alexvance',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bio: 'Tech enthusiast, indie hacker, and supporter of digital creators.',
    role: 'member',
    isVerified: false,
    createdAt: '2026-01-15'
  },
  'user-creator-1': {
    id: 'user-creator-1',
    email: 'sarah@designcode.com',
    fullName: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Senior Product Designer & Educator. Teaching UI/UX design engineering.',
    role: 'creator',
    isVerified: true,
    category: 'Art & Design',
    createdAt: '2025-11-10'
  },
  'user-creator-2': {
    id: 'user-creator-2',
    email: 'marcus@codemaster.io',
    fullName: 'Marcus Vance',
    username: 'marcuscode',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    bio: 'Fullstack Architect & Next.js specialist.',
    role: 'creator',
    isVerified: true,
    category: 'Education & Tech',
    createdAt: '2025-08-20'
  },
  'user-admin': {
    id: 'user-admin',
    email: 'admin@creatorpulse.com',
    fullName: 'Elena Rostova',
    username: 'elena_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    bio: 'CreatorPulse Administrator.',
    role: 'admin',
    isVerified: true,
    createdAt: '2025-01-01'
  }
};

export const MOCK_CREATOR_DETAILS: Record<string, CreatorProfile> = {
  'user-creator-1': {
    ...MOCK_USERS['user-creator-1'],
    headline: 'UI/UX Design Systems & Design Engineering Masterclasses',
    coverImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
    followerCount: 14280,
    subscriberCount: 840,
    startingPrice: 5.00,
    monthlyPrice: 12.99,
    totalRevenue: 34500.00,
    availableEarnings: 4850.00,
    pendingEarnings: 1200.00,
    profileViews: 128400,
    payoutMethod: 'Bank Transfer (•••• 4920)',
    perks: [
      'Access to 40+ Figma Design Kit UI Templates',
      'Exclusive Members-Only Weekly Design Critiques',
      'Direct 1-on-1 Q&A Messaging Thread',
      'Private CreatorPulse VIP Circle Discord Access'
    ]
  },
  'user-creator-2': {
    ...MOCK_USERS['user-creator-2'],
    headline: 'Advanced Next.js 15, PostgreSQL & Supabase Database Architecture',
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
    followerCount: 22100,
    subscriberCount: 1450,
    startingPrice: 15.00,
    monthlyPrice: 19.99,
    totalRevenue: 68900.00,
    availableEarnings: 9400.00,
    pendingEarnings: 2800.00,
    profileViews: 245100,
    payoutMethod: 'Stripe Direct',
    perks: [
      'Full Source Code Repositories & Boilerplates',
      'Weekly Live Backend & Database Architecture Streams',
      'Member-Only Supabase RLS Security Audits'
    ]
  }
};

export const MOCK_MEMBERSHIP_PLANS: Record<string, MembershipPlan[]> = {
  'user-creator-1': [
    {
      id: 'plan-starter-1',
      creatorId: 'user-creator-1',
      name: 'Starter Community',
      priceMonthly: 5.00,
      description: 'Access to public post updates & general community lounge.',
      benefits: ['Access to Starter Posts', 'Community Chat Threads', 'Weekly Q&A Access']
    },
    {
      id: 'plan-premium-1',
      creatorId: 'user-creator-1',
      name: 'Pro Designer Tier',
      priceMonthly: 15.00,
      description: 'Full Figma UI Kits, Design System Tokens, and Video Tutorials.',
      benefits: ['All Starter Benefits', '40+ Figma Template UI Kits', 'Exclusive Design Video Masterclasses'],
      popular: true
    },
    {
      id: 'plan-vip-1',
      creatorId: 'user-creator-1',
      name: 'VIP Inner Circle',
      priceMonthly: 30.00,
      description: 'Direct 1-on-1 Portfolio Reviews and Private Discord Channel.',
      benefits: ['All Pro Benefits', 'Direct 1-on-1 DM Thread', 'Monthly 30-min Portfolio Review Call']
    }
  ]
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-creator-1',
    authorName: 'Sarah Jenkins',
    authorUsername: 'sarahdesign',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    authorVerified: true,
    authorCategory: 'Art & Design',
    title: 'Modern Micro-Interactions in Web Apps: 5 CSS Tricks You Need to Master',
    content: 'Micro-animations elevate simple UI components into responsive experiences. Check out our CSS bezier curve breakdowns!',
    postType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900',
    visibility: 'public',
    likesCount: 342,
    commentsCount: 28,
    viewsCount: 2410,
    isLiked: true,
    isSaved: false,
    createdAt: '2 hours ago'
  },
  {
    id: 'post-poll-1',
    authorId: 'user-creator-1',
    authorName: 'Sarah Jenkins',
    authorUsername: 'sarahdesign',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    authorVerified: true,
    authorCategory: 'Art & Design',
    title: '📊 Community Poll: Which Figma UI Kit Should We Release Next?',
    content: 'Vote for our upcoming design system update! The winning kit will be published next Monday for all subscribers.',
    postType: 'poll',
    poll: {
      question: 'Which design kit should we build next?',
      options: [
        { id: 'opt1', text: 'SaaS Analytics Dashboard Kit', votes: 142 },
        { id: 'opt2', text: 'Mobile E-Commerce App Kit', votes: 89 },
        { id: 'opt3', text: 'AI Prompt Sharing UI Kit', votes: 215 }
      ],
      totalVotes: 446
    },
    visibility: 'public',
    likesCount: 94,
    commentsCount: 16,
    viewsCount: 1200,
    isLiked: false,
    isSaved: true,
    createdAt: '4 hours ago'
  },
  {
    id: 'post-2',
    authorId: 'user-creator-2',
    authorName: 'Marcus Vance',
    authorUsername: 'marcuscode',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    authorVerified: true,
    authorCategory: 'Education & Tech',
    title: '🔒 [VIP MEMBERS] Full Production Setup for Supabase Row Level Security (RLS)',
    content: 'Here is the step-by-step SQL script for setting up enterprise multi-tenant databases with Supabase.',
    postType: 'video',
    mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900',
    visibility: 'members_only',
    unlockPrice: 9.99,
    likesCount: 184,
    commentsCount: 42,
    viewsCount: 890,
    isLiked: false,
    isSaved: true,
    createdAt: '5 hours ago'
  }
];

export const MOCK_STORIES: Story[] = [
  {
    id: 'story-1',
    creatorId: 'user-creator-1',
    creatorName: 'Sarah Jenkins',
    creatorUsername: 'sarahdesign',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
    caption: 'Workspace preview! Recording today’s design masterclass 🎨',
    createdAt: '3 hours ago',
    expiresAt: '21 hours remaining'
  },
  {
    id: 'story-2',
    creatorId: 'user-creator-2',
    creatorName: 'Marcus Vance',
    creatorUsername: 'marcuscode',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    mediaUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600',
    caption: 'Live Q&A starting in 30 minutes! Drop your questions below 💻',
    createdAt: '6 hours ago',
    expiresAt: '18 hours remaining'
  }
];

export const MOCK_SHORTS: ShortVideo[] = [
  {
    id: 'short-1',
    authorId: 'user-creator-1',
    authorName: 'Sarah Jenkins',
    authorUsername: 'sarahdesign',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: '3 UI Design Mistakes You’re Making Right Now! ❌✨',
    videoUrl: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600',
    likesCount: 1420,
    commentsCount: 89,
    sharesCount: 310,
    isLiked: true,
    category: 'Art & Design',
    hashtags: ['#design', '#uiux', '#css']
  },
  {
    id: 'short-2',
    authorId: 'user-creator-2',
    authorName: 'Marcus Vance',
    authorUsername: 'marcuscode',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    title: 'Why Supabase RLS is a Game-Changer for SaaS Developers 🚀',
    videoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
    likesCount: 2890,
    commentsCount: 164,
    sharesCount: 520,
    isLiked: false,
    category: 'Education & Tech',
    hashtags: ['#nextjs', '#supabase', '#coding']
  }
];

export const MOCK_REELS = MOCK_SHORTS;

export const MOCK_BALANCE: UserBalance = {
  availableBalance: 245.50,
  pendingBalance: 40.00,
  totalSpent: 185.00,
  creatorTotalEarnings: 4850.00
};

export const MOCK_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-1',
    date: '2026-08-12',
    type: 'Membership',
    description: 'Pro Designer Tier (1 Month)',
    recipientOrSender: 'Sarah Jenkins (@sarahdesign)',
    amount: 15.00,
    platformFee: 0.75,
    netAmount: 14.25,
    status: 'Completed'
  },
  {
    id: 'tx-2',
    date: '2026-08-10',
    type: 'Tip Support',
    description: 'Creator Tip & Appreciation',
    recipientOrSender: 'Marcus Vance (@marcuscode)',
    amount: 25.00,
    platformFee: 1.25,
    netAmount: 23.75,
    status: 'Completed'
  },
  {
    id: 'tx-3',
    date: '2026-08-05',
    type: 'Top-Up',
    description: 'Wallet Balance Deposit',
    recipientOrSender: 'Visa Card (•••• 8821)',
    amount: 100.00,
    platformFee: 0.00,
    netAmount: 100.00,
    status: 'Completed'
  }
];

export const MOCK_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'conv-1',
    participantId: 'user-creator-1',
    participantName: 'Sarah Jenkins',
    participantUsername: 'sarahdesign',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    participantVerified: true,
    lastMessage: 'Here is the Figma UI link for the VIP masterclass kit!',
    lastMessageTime: '10m ago',
    unreadCount: 1,
    isOnline: true
  },
  {
    id: 'conv-2',
    participantId: 'user-creator-2',
    participantName: 'Marcus Vance',
    participantUsername: 'marcuscode',
    participantAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    participantVerified: true,
    lastMessage: 'Thanks for supporting the channel! Let me know if you have RLS questions.',
    lastMessageTime: '2h ago',
    unreadCount: 0,
    isOnline: false
  }
];

export const MOCK_MESSAGES: Record<string, MessageItem[]> = {
  'conv-1': [
    {
      id: 'm-1',
      conversationId: 'conv-1',
      senderId: 'user-creator-1',
      senderName: 'Sarah Jenkins',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      content: 'Hey Alex! Thank you for subscribing to the Pro Designer tier.',
      isRead: true,
      createdAt: '1 hour ago'
    },
    {
      id: 'm-2',
      conversationId: 'conv-1',
      senderId: 'user-creator-1',
      senderName: 'Sarah Jenkins',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      content: '🔒 Exclusive Member Source File: Download the complete Figma Design Token system below.',
      mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
      isPaywalled: true,
      unlockPrice: 5.00,
      isUnlocked: false,
      isRead: false,
      createdAt: '10m ago'
    }
  ]
};

export const MOCK_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: 'pay-1',
    creatorId: 'user-creator-1',
    creatorName: 'Sarah Jenkins',
    amount: 1500.00,
    processingFee: 15.00,
    netPayout: 1485.00,
    payoutMethod: 'Bank Transfer (•••• 4920)',
    accountDetails: 'Chase Bank - Routing: 122000247',
    status: 'Pending',
    requestedAt: 'Yesterday at 4:30 PM'
  }
];

export const MOCK_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    reporterName: 'Jordan Lee',
    targetType: 'post',
    targetTitle: 'Off-topic spam promotion in public feed',
    reason: 'Unsolicited marketing link in comment section',
    status: 'pending',
    createdAt: '1 hour ago'
  },
  {
    id: 'rep-2',
    reporterName: 'Mia Wong',
    targetType: 'user',
    targetTitle: 'User Profile @crypto_bot_99',
    reason: 'Impersonation of verified creator',
    status: 'pending',
    createdAt: '4 hours ago'
  }
];

export const MOCK_APPLICATIONS: CreatorApplication[] = [
  {
    id: 'app-1',
    userId: 'user-app-1',
    userName: 'David Miller',
    userEmail: 'david@fitnesshacks.com',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    category: 'Fitness & Wellness',
    portfolioUrl: 'https://instagram.com/fitnessdavid',
    reason: 'Certified personal trainer with 40k YouTube subscribers. Want to offer custom workout programs & nutrition plans.',
    status: 'pending',
    submittedAt: 'Yesterday'
  },
  {
    id: 'app-2',
    userId: 'user-app-2',
    userName: 'Elena Rostova',
    userEmail: 'elena@soundstudio.io',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    category: 'Music & Sound',
    portfolioUrl: 'https://soundcloud.com/elenabeats',
    reason: 'Audio engineer sharing sample packs, Ableton Live templates, and synth tutorials.',
    status: 'pending',
    submittedAt: '2 days ago'
  }
];
