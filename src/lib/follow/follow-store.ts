import { UserProfile, MOCK_USERS, MOCK_CREATOR_DETAILS } from '../supabase/store';

export type FollowStatus = 'following' | 'pending' | 'none';

export interface FollowRecord {
  id: string;
  followerId: string;
  followingId: string;
  status: FollowStatus;
  createdAt: string;
}

export interface ConnectionUser {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  bio: string;
  role: 'member' | 'creator' | 'admin' | 'moderator';
  category?: string;
  isVerified: boolean;
  isPrivate?: boolean;
  followerCount: number;
  followingCount: number;
  isSubscriber?: boolean;
  followedAt?: string;
  requestedAt?: string;
  mutualCount?: number;
  isMutual?: boolean;
}

export interface SuggestedCreator {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  headline: string;
  bio: string;
  category: string;
  isVerified: boolean;
  followerCount: number;
  startingPrice: number;
  reason: string;
  mutualNames: string[];
}

const STORAGE_FOLLOWS_KEY = 'creatorpulse_follows_v1';
const STORAGE_PRIVACY_KEY = 'creatorpulse_privacy_settings_v1';
const EVENT_FOLLOW_CHANGE = 'creatorpulse_follow_change';

// Initial Seed Follow Relationships
const INITIAL_FOLLOWS: FollowRecord[] = [
  // Member (user-member - Alex Vance) follows:
  { id: 'f-1', followerId: 'user-member', followingId: 'user-creator-1', status: 'following', createdAt: '2026-02-01' },
  { id: 'f-2', followerId: 'user-member', followingId: 'user-creator-2', status: 'following', createdAt: '2026-02-10' },
  
  // Creators follow each other / members follow creators
  { id: 'f-3', followerId: 'user-creator-1', followingId: 'user-member', status: 'following', createdAt: '2026-02-02' }, // Mutual!
  { id: 'f-4', followerId: 'user-creator-2', followingId: 'user-creator-1', status: 'following', createdAt: '2026-01-15' },
  
  // Other followers of user-member (Alex Vance)
  { id: 'f-5', followerId: 'user-fan-2', followingId: 'user-member', status: 'following', createdAt: '2 days ago' },
  { id: 'f-6', followerId: 'user-fan-3', followingId: 'user-member', status: 'following', createdAt: '5 days ago' },

  // Followers of user-creator-1 (Sarah Jenkins)
  { id: 'f-7', followerId: 'user-fan-2', followingId: 'user-creator-1', status: 'following', createdAt: '3 days ago' },
  { id: 'f-8', followerId: 'user-fan-4', followingId: 'user-creator-1', status: 'following', createdAt: '1 week ago' },
  { id: 'f-9', followerId: 'user-fan-5', followingId: 'user-creator-1', status: 'following', createdAt: '2 weeks ago' },

  // Incoming follow request to user-member
  { id: 'f-req-1', followerId: 'user-fan-6', followingId: 'user-member', status: 'pending', createdAt: 'Just now' },

  // Outgoing pending follow request from user-member to private creator
  { id: 'f-req-2', followerId: 'user-member', followingId: 'user-creator-private', status: 'pending', createdAt: '1 hour ago' },
];

// Seed privacy settings: true = private profile, false = public profile
const INITIAL_PRIVACY: Record<string, boolean> = {
  'user-creator-private': true,
  'user-fan-6': true,
};

// Seed extended users dictionary for rich connection rendering
export const EXTENDED_USERS: Record<string, ConnectionUser> = {
  'user-member': {
    id: 'user-member',
    fullName: 'Alex Vance',
    username: 'alexvance',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bio: 'Tech enthusiast, indie hacker, and supporter of digital creators.',
    role: 'member',
    isVerified: false,
    followerCount: 3,
    followingCount: 2,
  },
  'user-creator-1': {
    id: 'user-creator-1',
    fullName: 'Sarah Jenkins',
    username: 'sarahdesign',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Senior Product Designer & Educator. Teaching UI/UX design engineering.',
    role: 'creator',
    category: 'Art & Design',
    isVerified: true,
    followerCount: 14280,
    followingCount: 340,
    isSubscriber: true,
  },
  'user-creator-2': {
    id: 'user-creator-2',
    fullName: 'Marcus Vance',
    username: 'marcuscode',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    bio: 'Fullstack Architect & Next.js specialist. Creator of DevScale.',
    role: 'creator',
    category: 'Education & Tech',
    isVerified: true,
    followerCount: 22100,
    followingCount: 180,
    isSubscriber: true,
  },
  'user-fan-2': {
    id: 'user-fan-2',
    fullName: 'Jordan Lee',
    username: 'jordanlee',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Creative coder & UI designer.',
    role: 'member',
    isVerified: false,
    followerCount: 420,
    followingCount: 95,
    isSubscriber: true,
  },
  'user-fan-3': {
    id: 'user-fan-3',
    fullName: 'Mia Wong',
    username: 'miawong',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'Digital illustrator & Motion animator.',
    role: 'member',
    category: 'Art & Design',
    isVerified: true,
    followerCount: 1250,
    followingCount: 210,
    isSubscriber: false,
  },
  'user-fan-4': {
    id: 'user-fan-4',
    fullName: 'David Miller',
    username: 'fitdavid',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: 'Fitness creator & nutrition strategist.',
    role: 'member',
    category: 'Fitness & Wellness',
    isVerified: false,
    followerCount: 890,
    followingCount: 140,
    isSubscriber: true,
  },
  'user-fan-5': {
    id: 'user-fan-5',
    fullName: 'Emma Torres',
    username: 'emmabakes',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    bio: 'Artisan baker & recipe creator.',
    role: 'member',
    category: 'Culinary',
    isVerified: true,
    followerCount: 3400,
    followingCount: 310,
    isSubscriber: false,
  },
  'user-fan-6': {
    id: 'user-fan-6',
    fullName: 'Chloe Bennett',
    username: 'chloedesign',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'UX researcher & accessibility advocate. Account private.',
    role: 'member',
    isVerified: false,
    isPrivate: true,
    followerCount: 150,
    followingCount: 80,
  },
  'user-creator-private': {
    id: 'user-creator-private',
    fullName: 'Elena Rostova',
    username: 'elena_vip',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    bio: 'Private VIP Design Circle. Request to follow for exclusive previews.',
    role: 'creator',
    category: 'Art & Design',
    isVerified: true,
    isPrivate: true,
    followerCount: 4890,
    followingCount: 120,
  },
  'user-creator-3': {
    id: 'user-creator-3',
    fullName: 'Maya Lin',
    username: 'mayalin_art',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    bio: '3D Artist & Shader developer. Building immersive WebGL experiences.',
    role: 'creator',
    category: 'Art & Design',
    isVerified: true,
    followerCount: 18900,
    followingCount: 210,
  },
  'user-creator-4': {
    id: 'user-creator-4',
    fullName: 'Liam Bennett',
    username: 'liamfit',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    bio: 'Strength coach & high performance mindset mentor.',
    role: 'creator',
    category: 'Fitness & Wellness',
    isVerified: true,
    followerCount: 15400,
    followingCount: 190,
  }
};

export const SUGGESTED_CREATORS_SEED: SuggestedCreator[] = [
  {
    id: 'user-creator-3',
    fullName: 'Maya Lin',
    username: 'mayalin_art',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    headline: '3D Artist & WebGL Shader Developer',
    bio: 'Creating interactive 3D assets, Three.js tutorials, and Figma graphics.',
    category: 'Art & Design',
    isVerified: true,
    followerCount: 18900,
    startingPrice: 8.00,
    reason: 'Followed by Sarah Jenkins & 2 mutuals',
    mutualNames: ['sarahdesign', 'marcuscode'],
  },
  {
    id: 'user-creator-4',
    fullName: 'Liam Bennett',
    username: 'liamfit',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    headline: 'Strength Coach & Daily Workout Routines',
    bio: 'Helping tech professionals build functional strength & high energy.',
    category: 'Fitness & Wellness',
    isVerified: true,
    followerCount: 15400,
    startingPrice: 10.00,
    reason: 'Popular Creator in Wellness',
    mutualNames: ['fitdavid'],
  },
  {
    id: 'user-creator-2',
    fullName: 'Marcus Vance',
    username: 'marcuscode',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    headline: 'Fullstack Architect & Next.js Masterclasses',
    bio: 'Deep dives into Supabase database design, React 19, and cloud scaling.',
    category: 'Education & Tech',
    isVerified: true,
    followerCount: 22100,
    startingPrice: 15.00,
    reason: 'Trending in Tech & Development',
    mutualNames: ['alexvance'],
  }
];

class FollowStoreManager {
  private follows: FollowRecord[] = [];
  private privacySettings: Record<string, boolean> = {};

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') {
      this.follows = [...INITIAL_FOLLOWS];
      this.privacySettings = { ...INITIAL_PRIVACY };
      return;
    }

    try {
      const storedFollows = localStorage.getItem(STORAGE_FOLLOWS_KEY);
      if (storedFollows) {
        this.follows = JSON.parse(storedFollows);
      } else {
        this.follows = [...INITIAL_FOLLOWS];
        localStorage.setItem(STORAGE_FOLLOWS_KEY, JSON.stringify(this.follows));
      }

      const storedPrivacy = localStorage.getItem(STORAGE_PRIVACY_KEY);
      if (storedPrivacy) {
        this.privacySettings = JSON.parse(storedPrivacy);
      } else {
        this.privacySettings = { ...INITIAL_PRIVACY };
        localStorage.setItem(STORAGE_PRIVACY_KEY, JSON.stringify(this.privacySettings));
      }
    } catch (err) {
      console.error('Error loading FollowStore from localStorage:', err);
      this.follows = [...INITIAL_FOLLOWS];
      this.privacySettings = { ...INITIAL_PRIVACY };
    }
  }

  private save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_FOLLOWS_KEY, JSON.stringify(this.follows));
      localStorage.setItem(STORAGE_PRIVACY_KEY, JSON.stringify(this.privacySettings));
      window.dispatchEvent(new CustomEvent(EVENT_FOLLOW_CHANGE, { detail: { timestamp: Date.now() } }));
    } catch (err) {
      console.error('Error saving FollowStore to localStorage:', err);
    }
  }

  public notifyListeners() {
    this.save();
  }

  // --- PRIVACY RULES ---
  public isProfilePrivate(userId: string): boolean {
    if (userId in this.privacySettings) {
      return this.privacySettings[userId];
    }
    const target = EXTENDED_USERS[userId];
    return target?.isPrivate || false;
  }

  public setProfilePrivacy(userId: string, isPrivate: boolean) {
    this.privacySettings[userId] = isPrivate;
    this.save();
  }

  // --- FOLLOW RELATIONSHIP STATUS ---
  public getFollowStatus(followerId: string, targetUserId: string): {
    status: FollowStatus;
    isFollowing: boolean;
    isPending: boolean;
    isFollower: boolean;
    isMutual: boolean;
    isPrivate: boolean;
  } {
    const isPrivate = this.isProfilePrivate(targetUserId);
    const outgoing = this.follows.find(
      (f) => f.followerId === followerId && f.followingId === targetUserId
    );
    const incoming = this.follows.find(
      (f) => f.followerId === targetUserId && f.followingId === followerId && f.status === 'following'
    );

    const status: FollowStatus = outgoing ? outgoing.status : 'none';
    const isFollowing = status === 'following';
    const isPending = status === 'pending';
    const isFollower = Boolean(incoming);
    const isMutual = isFollowing && isFollower;

    return {
      status,
      isFollowing,
      isPending,
      isFollower,
      isMutual,
      isPrivate,
    };
  }

  // --- FOLLOW ACTION ---
  public follow(followerId: string, targetUserId: string): FollowStatus {
    if (followerId === targetUserId) return 'none';

    const existing = this.follows.find(
      (f) => f.followerId === followerId && f.followingId === targetUserId
    );

    const isPrivate = this.isProfilePrivate(targetUserId);
    const targetStatus: FollowStatus = isPrivate ? 'pending' : 'following';

    if (existing) {
      existing.status = targetStatus;
      existing.createdAt = new Date().toISOString().split('T')[0];
    } else {
      this.follows.push({
        id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        followerId,
        followingId: targetUserId,
        status: targetStatus,
        createdAt: 'Just now',
      });
    }

    this.save();
    return targetStatus;
  }

  // --- UNFOLLOW ACTION ---
  public unfollow(followerId: string, targetUserId: string) {
    this.follows = this.follows.filter(
      (f) => !(f.followerId === followerId && f.followingId === targetUserId)
    );
    this.save();
  }

  // --- REMOVE FOLLOWER ACTION ---
  public removeFollower(userId: string, followerId: string) {
    // Remove the follow record where followerId is following userId
    this.follows = this.follows.filter(
      (f) => !(f.followerId === followerId && f.followingId === userId)
    );
    this.save();
  }

  // --- ACCEPT FOLLOW REQUEST ---
  public acceptFollowRequest(userId: string, requesterId: string) {
    const record = this.follows.find(
      (f) => f.followerId === requesterId && f.followingId === userId && f.status === 'pending'
    );
    if (record) {
      record.status = 'following';
      record.createdAt = 'Just now';
      this.save();
    }
  }

  // --- DECLINE FOLLOW REQUEST ---
  public declineFollowRequest(userId: string, requesterId: string) {
    this.follows = this.follows.filter(
      (f) => !(f.followerId === requesterId && f.followingId === userId && f.status === 'pending')
    );
    this.save();
  }

  // --- CANCEL OUTGOING REQUEST ---
  public cancelFollowRequest(followerId: string, targetUserId: string) {
    this.follows = this.follows.filter(
      (f) => !(f.followerId === followerId && f.followingId === targetUserId && f.status === 'pending')
    );
    this.save();
  }

  // --- GET FOLLOWERS LIST ---
  public getFollowers(userId: string, searchQuery: string = ''): ConnectionUser[] {
    const followerRecords = this.follows.filter(
      (f) => f.followingId === userId && f.status === 'following'
    );

    const q = searchQuery.toLowerCase().trim();

    return followerRecords
      .map((rec) => {
        const u = EXTENDED_USERS[rec.followerId] || MOCK_USERS[rec.followerId] || {
          id: rec.followerId,
          fullName: 'Community Member',
          username: rec.followerId,
          avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${rec.followerId}`,
          bio: 'Platform user.',
          role: 'member' as const,
          isVerified: false,
          followerCount: 100,
          followingCount: 50,
        };

        const mutualStatus = this.getFollowStatus(userId, u.id);

        return {
          ...u,
          followedAt: rec.createdAt,
          isMutual: mutualStatus.isMutual,
        };
      })
      .filter((u) => {
        if (!q) return true;
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          (u.bio && u.bio.toLowerCase().includes(q)) ||
          (u.category && u.category.toLowerCase().includes(q))
        );
      });
  }

  // --- GET FOLLOWING LIST ---
  public getFollowing(userId: string, searchQuery: string = '', roleFilter?: string): ConnectionUser[] {
    const followingRecords = this.follows.filter(
      (f) => f.followerId === userId && f.status === 'following'
    );

    const q = searchQuery.toLowerCase().trim();

    return followingRecords
      .map((rec) => {
        const u = EXTENDED_USERS[rec.followingId] || MOCK_CREATOR_DETAILS[rec.followingId] || MOCK_USERS[rec.followingId] || {
          id: rec.followingId,
          fullName: 'Creator Profile',
          username: rec.followingId,
          avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${rec.followingId}`,
          bio: 'Digital Creator on CreatorPulse.',
          role: 'creator' as const,
          isVerified: true,
          followerCount: 5000,
          followingCount: 120,
        };

        const mutualStatus = this.getFollowStatus(userId, u.id);

        return {
          ...u,
          followedAt: rec.createdAt,
          isMutual: mutualStatus.isMutual,
        };
      })
      .filter((u) => {
        if (roleFilter === 'creator' && u.role !== 'creator') return false;
        if (roleFilter === 'member' && u.role !== 'member') return false;
        if (!q) return true;
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          (u.bio && u.bio.toLowerCase().includes(q)) ||
          (u.category && u.category.toLowerCase().includes(q))
        );
      });
  }

  // --- GET PENDING REQUESTS ---
  public getPendingRequests(userId: string): {
    incoming: (ConnectionUser & { requestedAt: string })[];
    outgoing: (ConnectionUser & { requestedAt: string })[];
  } {
    const incomingRecords = this.follows.filter(
      (f) => f.followingId === userId && f.status === 'pending'
    );
    const outgoingRecords = this.follows.filter(
      (f) => f.followerId === userId && f.status === 'pending'
    );

    const incoming = incomingRecords.map((rec) => {
      const u = EXTENDED_USERS[rec.followerId] || MOCK_USERS[rec.followerId] || {
        id: rec.followerId,
        fullName: 'Community User',
        username: rec.followerId,
        avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${rec.followerId}`,
        bio: 'Wants to follow your updates.',
        role: 'member' as const,
        isVerified: false,
        followerCount: 50,
        followingCount: 20,
      };
      return { ...u, requestedAt: rec.createdAt };
    });

    const outgoing = outgoingRecords.map((rec) => {
      const u = EXTENDED_USERS[rec.followingId] || MOCK_CREATOR_DETAILS[rec.followingId] || {
        id: rec.followingId,
        fullName: 'Private Creator',
        username: rec.followingId,
        avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${rec.followingId}`,
        bio: 'Private account awaiting approval.',
        role: 'creator' as const,
        isVerified: true,
        followerCount: 1200,
        followingCount: 40,
      };
      return { ...u, requestedAt: rec.createdAt };
    });

    return { incoming, outgoing };
  }

  // --- GET MUTUAL CONNECTIONS ---
  public getMutualConnections(userId: string): ConnectionUser[] {
    const followers = this.getFollowers(userId);
    const following = this.getFollowing(userId);

    const followingMap = new Set(following.map((u) => u.id));
    return followers.filter((u) => followingMap.has(u.id));
  }

  // --- GET SUGGESTED CREATORS ---
  public getSuggestedCreators(userId: string): SuggestedCreator[] {
    const followingIds = new Set(
      this.follows
        .filter((f) => f.followerId === userId && (f.status === 'following' || f.status === 'pending'))
        .map((f) => f.followingId)
    );

    return SUGGESTED_CREATORS_SEED.filter((sc) => sc.id !== userId && !followingIds.has(sc.id));
  }

  // --- STATS COUNT HELPER ---
  public getCounts(userId: string): {
    followersCount: number;
    followingCount: number;
    pendingIncomingCount: number;
    pendingOutgoingCount: number;
    mutualCount: number;
  } {
    const followers = this.follows.filter((f) => f.followingId === userId && f.status === 'following');
    const following = this.follows.filter((f) => f.followerId === userId && f.status === 'following');
    const pendingInc = this.follows.filter((f) => f.followingId === userId && f.status === 'pending');
    const pendingOut = this.follows.filter((f) => f.followerId === userId && f.status === 'pending');
    const mutuals = this.getMutualConnections(userId);

    return {
      followersCount: followers.length,
      followingCount: following.length,
      pendingIncomingCount: pendingInc.length,
      pendingOutgoingCount: pendingOut.length,
      mutualCount: mutuals.length,
    };
  }
}

export const followStore = new FollowStoreManager();
export { EVENT_FOLLOW_CHANGE };
