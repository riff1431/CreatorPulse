import { UserProfile, UserRole } from '../supabase/store';

export interface CompletionTask {
  id: string;
  title: string;
  description: string;
  weight: number;
  isCompleted: boolean;
  isRequired: boolean;
  actionUrl: string;
  actionLabel: string;
  iconName: string;
}

export interface ProfileCompletionReport {
  percentage: number;
  isComplete: boolean;
  completedTasksCount: number;
  totalTasksCount: number;
  tasks: CompletionTask[];
  missingTasks: CompletionTask[];
  primarySuggestion: CompletionTask | null;
}

/**
 * Calculates the profile completion score and actionable suggestions for a given user.
 */
export function calculateProfileCompletion(user: UserProfile | null): ProfileCompletionReport {
  if (!user || user.role === 'guest') {
    return {
      percentage: 0,
      isComplete: false,
      completedTasksCount: 0,
      totalTasksCount: 0,
      tasks: [],
      missingTasks: [],
      primarySuggestion: null
    };
  }

  const isCreator = user.role === 'creator';
  const data = user.onboardingData || {};

  let tasks: CompletionTask[] = [];

  if (isCreator) {
    // ==========================================
    // CREATOR COMPLETION CHECKLIST
    // ==========================================
    const hasAvatar = Boolean(user.avatarUrl && !user.avatarUrl.includes('api.dicebear.com'));
    const hasCover = Boolean(user.coverUrl || data.coverImageUrl);
    const hasBio = Boolean(user.bio && user.bio.trim().length > 15);
    const hasCategory = Boolean(user.category && user.category.trim().length > 0);
    const hasPricing = Boolean(data.startingPrice || (user as any).startingPrice || (user as any).monthlyPrice);
    const hasPayout = Boolean(data.payoutMethod || (user as any).payoutMethod);
    const hasSocials = Boolean(data.socialLinks && Object.values(data.socialLinks).some((v) => Boolean(v)));

    tasks = [
      {
        id: 'creator_avatar',
        title: 'Upload Profile Photo',
        description: 'Add a high-resolution avatar photo to build trust with your audience.',
        weight: 15,
        isCompleted: hasAvatar,
        isRequired: true,
        actionUrl: '/settings?tab=profile',
        actionLabel: 'Upload Avatar',
        iconName: 'Camera'
      },
      {
        id: 'creator_cover',
        title: 'Add Channel Banner Cover',
        description: 'Upload a 16:9 widescreen header cover for your creator profile.',
        weight: 15,
        isCompleted: hasCover,
        isRequired: false,
        actionUrl: '/settings?tab=profile',
        actionLabel: 'Upload Banner',
        iconName: 'Image'
      },
      {
        id: 'creator_bio',
        title: 'Write Bio & Headline',
        description: 'Introduce yourself, what you teach, and what subscribers receive.',
        weight: 15,
        isCompleted: hasBio,
        isRequired: true,
        actionUrl: '/settings?tab=profile',
        actionLabel: 'Edit Bio',
        iconName: 'FileText'
      },
      {
        id: 'creator_category',
        title: 'Set Creator Category',
        description: 'Select your primary niche to appear in creator discovery rankings.',
        weight: 10,
        isCompleted: hasCategory,
        isRequired: true,
        actionUrl: '/settings?tab=profile',
        actionLabel: 'Select Category',
        iconName: 'Tag'
      },
      {
        id: 'creator_pricing',
        title: 'Configure Tier Pricing',
        description: 'Set your monthly membership subscription rate and VIP drop prices.',
        weight: 15,
        isCompleted: hasPricing,
        isRequired: true,
        actionUrl: '/creator/dashboard',
        actionLabel: 'Set Pricing',
        iconName: 'DollarSign'
      },
      {
        id: 'creator_payout',
        title: 'Connect Payout Method',
        description: 'Set up Stripe Connect, Bank Wire, or Crypto USDC to receive creator payouts.',
        weight: 15,
        isCompleted: hasPayout,
        isRequired: true,
        actionUrl: '/balance',
        actionLabel: 'Connect Payout',
        iconName: 'CreditCard'
      },
      {
        id: 'creator_socials',
        title: 'Link Social Accounts',
        description: 'Link your X, Instagram, or YouTube to verify your creator identity.',
        weight: 15,
        isCompleted: hasSocials,
        isRequired: false,
        actionUrl: '/settings?tab=social',
        actionLabel: 'Link Socials',
        iconName: 'Share2'
      },
    ];
  } else {
    // ==========================================
    // FAN (MEMBER) COMPLETION CHECKLIST
    // ==========================================
    const hasAvatar = Boolean(user.avatarUrl && !user.avatarUrl.includes('api.dicebear.com'));
    const hasBio = Boolean(user.bio && user.bio.trim().length > 5);
    const hasInterests = Boolean(data.interests && data.interests.length >= 2);
    const hasFollows = Boolean(data.followedCreators && data.followedCreators.length >= 1);

    tasks = [
      {
        id: 'fan_avatar',
        title: 'Personalize Your Avatar',
        description: 'Upload a custom photo or choose an illustrated avatar identity.',
        weight: 25,
        isCompleted: hasAvatar,
        isRequired: true,
        actionUrl: '/settings?tab=profile',
        actionLabel: 'Upload Photo',
        iconName: 'Camera'
      },
      {
        id: 'fan_bio',
        title: 'Add a Profile Bio',
        description: 'Tell the community a little about your passions and favorite topics.',
        weight: 25,
        isCompleted: hasBio,
        isRequired: false,
        actionUrl: '/settings?tab=profile',
        actionLabel: 'Add Bio',
        iconName: 'FileText'
      },
      {
        id: 'fan_interests',
        title: 'Select Favorite Topics',
        description: 'Choose your interests so we can personalize your home feed.',
        weight: 25,
        isCompleted: hasInterests,
        isRequired: true,
        actionUrl: '/explore',
        actionLabel: 'Pick Topics',
        iconName: 'Sparkles'
      },
      {
        id: 'fan_follows',
        title: 'Follow Creators',
        description: 'Follow at least one creator to stay updated on drops and posts.',
        weight: 25,
        isCompleted: hasFollows,
        isRequired: false,
        actionUrl: '/explore',
        actionLabel: 'Explore Creators',
        iconName: 'Users'
      },
    ];
  }

  const completedTasks = tasks.filter((t) => t.isCompleted);
  const missingTasks = tasks.filter((t) => !t.isCompleted);

  // Calculate weighted percentage
  const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0);
  const earnedWeight = completedTasks.reduce((sum, t) => sum + t.weight, 0);
  const percentage = Math.min(100, Math.round((earnedWeight / (totalWeight || 100)) * 100));

  // Determine top priority suggestion (required first, then highest weight)
  const primarySuggestion = missingTasks.slice().sort((a, b) => {
    if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
    return b.weight - a.weight;
  })[0] || null;

  return {
    percentage,
    isComplete: percentage >= 100,
    completedTasksCount: completedTasks.length,
    totalTasksCount: tasks.length,
    tasks,
    missingTasks,
    primarySuggestion
  };
}
