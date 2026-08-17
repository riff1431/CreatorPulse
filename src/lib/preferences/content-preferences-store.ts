import { Post, CreatorProfile } from '../supabase/store';

export interface ContentPreferences {
  preferredCategories: string[];
  preferredTopics: string[];
  preferredCreatorIds: string[];
  mutedTopics: string[];
  mutedCreatorIds: string[];
  hiddenPostTypes: string[];
  recommendationMode: 'balanced' | 'familiarity' | 'discovery';
  sensitiveContentFilter: 'strict' | 'standard' | 'relaxed';
  enablePersonalization: boolean;
  includeLiveStreams: boolean;
  discoveryWeight: number; // 0 to 100
}

export const DEFAULT_CONTENT_PREFERENCES: ContentPreferences = {
  preferredCategories: ['Art & Design', 'Education & Tech', 'Fitness & Wellness'],
  preferredTopics: ['#blender', '#react', '#fitness', '#3d'],
  preferredCreatorIds: ['c-sarah', 'user-creator-1'],
  mutedTopics: ['#spoilers', '#politics'],
  mutedCreatorIds: [],
  hiddenPostTypes: [],
  recommendationMode: 'balanced',
  sensitiveContentFilter: 'standard',
  enablePersonalization: true,
  includeLiveStreams: true,
  discoveryWeight: 60,
};

const STORAGE_PREFS_KEY = 'creatorpulse_content_prefs_v1';
export const EVENT_PREFERENCES_CHANGE = 'creatorpulse_preferences_change';

/**
 * Get current content preferences from local storage with default fallback
 */
export function getContentPreferences(): ContentPreferences {
  if (typeof window === 'undefined') return DEFAULT_CONTENT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_PREFS_KEY);
    if (!raw) return DEFAULT_CONTENT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONTENT_PREFERENCES, ...parsed };
  } catch (err) {
    console.error('Failed to parse content preferences:', err);
    return DEFAULT_CONTENT_PREFERENCES;
  }
}

/**
 * Save updated content preferences to local storage and broadcast change event
 */
export function saveContentPreferences(newPrefs: Partial<ContentPreferences>): ContentPreferences {
  if (typeof window === 'undefined') return DEFAULT_CONTENT_PREFERENCES;
  try {
    const current = getContentPreferences();
    const updated = { ...current, ...newPrefs };
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(EVENT_PREFERENCES_CHANGE));
    return updated;
  } catch (err) {
    console.error('Failed to save content preferences:', err);
    return DEFAULT_CONTENT_PREFERENCES;
  }
}

/**
 * Reset content preferences back to factory defaults
 */
export function resetContentPreferences(): ContentPreferences {
  if (typeof window === 'undefined') return DEFAULT_CONTENT_PREFERENCES;
  try {
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(DEFAULT_CONTENT_PREFERENCES));
    window.dispatchEvent(new Event(EVENT_PREFERENCES_CHANGE));
    return DEFAULT_CONTENT_PREFERENCES;
  } catch (err) {
    console.error('Failed to reset content preferences:', err);
    return DEFAULT_CONTENT_PREFERENCES;
  }
}

/**
 * Evaluate if a post matches user's preferences, or should be hidden
 */
export function evaluatePostRelevance(
  post: Post,
  prefs: ContentPreferences,
  searchHistoryQueries: string[] = []
): { score: number; isHidden: boolean; matchReason?: string; matchTags: string[] } {
  if (!prefs.enablePersonalization) {
    return { score: 50, isHidden: false, matchTags: [] };
  }

  // Check muted creator
  if (prefs.mutedCreatorIds.includes(post.authorId) || prefs.mutedCreatorIds.includes(post.authorUsername)) {
    return { score: 0, isHidden: true, matchReason: 'Muted Creator', matchTags: [] };
  }

  // Check hidden post type
  if (prefs.hiddenPostTypes.includes(post.postType)) {
    return { score: 0, isHidden: true, matchReason: 'Hidden Content Type', matchTags: [] };
  }

  const contentLower = `${post.title || ''} ${post.content || ''} ${post.authorCategory || ''}`.toLowerCase();

  // Check muted topics/keywords
  for (const mutedTopic of prefs.mutedTopics) {
    const cleanTopic = mutedTopic.replace(/^#/, '').toLowerCase();
    if (contentLower.includes(cleanTopic)) {
      return { score: 0, isHidden: true, matchReason: `Muted Topic (${mutedTopic})`, matchTags: [] };
    }
  }

  let score = 50; // base score
  const matchTags: string[] = [];

  // Boost preferred creator
  if (prefs.preferredCreatorIds.includes(post.authorId) || prefs.preferredCreatorIds.includes(post.authorUsername)) {
    score += 40;
    matchTags.push('Favorite Creator');
  }

  // Boost preferred categories
  if (post.authorCategory && prefs.preferredCategories.some(c => c.toLowerCase() === post.authorCategory.toLowerCase())) {
    score += 25;
    matchTags.push(post.authorCategory);
  }

  // Boost preferred topics
  for (const topic of prefs.preferredTopics) {
    const cleanTopic = topic.replace(/^#/, '').toLowerCase();
    if (contentLower.includes(cleanTopic)) {
      score += 20;
      if (!matchTags.includes(topic)) {
        matchTags.push(topic);
      }
    }
  }

  // Boost from search history queries if any
  for (const q of searchHistoryQueries) {
    if (q.length > 2 && contentLower.includes(q.toLowerCase())) {
      score += 15;
      if (!matchTags.includes(`#${q}`)) {
        matchTags.push(`#${q}`);
      }
    }
  }

  // Mode adjustment
  if (prefs.recommendationMode === 'familiarity') {
    if (matchTags.length > 0) score += 15;
  } else if (prefs.recommendationMode === 'discovery') {
    if (matchTags.length === 0) score += 10;
  }

  return {
    score: Math.min(score, 100),
    isHidden: false,
    matchReason: matchTags.length > 0 ? `Matches ${matchTags.join(', ')}` : undefined,
    matchTags,
  };
}

/**
 * Evaluate creator profile relevance for recommendations
 */
export function evaluateCreatorRelevance(
  creator: CreatorProfile,
  prefs: ContentPreferences,
  searchHistoryQueries: string[] = []
): { score: number; isHidden: boolean; matchReason?: string; matchTags: string[] } {
  if (!prefs.enablePersonalization) {
    return { score: 50, isHidden: false, matchTags: [] };
  }

  if (prefs.mutedCreatorIds.includes(creator.id) || prefs.mutedCreatorIds.includes(creator.username)) {
    return { score: 0, isHidden: true, matchReason: 'Muted Creator', matchTags: [] };
  }

  const profileLower = `${creator.fullName} ${creator.username} ${creator.category} ${creator.headline} ${creator.bio || ''}`.toLowerCase();

  // Check muted topics
  for (const mutedTopic of prefs.mutedTopics) {
    const cleanTopic = mutedTopic.replace(/^#/, '').toLowerCase();
    if (profileLower.includes(cleanTopic)) {
      return { score: 0, isHidden: true, matchReason: `Muted Topic (${mutedTopic})`, matchTags: [] };
    }
  }

  let score = 50;
  const matchTags: string[] = [];

  if (prefs.preferredCreatorIds.includes(creator.id) || prefs.preferredCreatorIds.includes(creator.username)) {
    score += 45;
    matchTags.push('Favorite Creator');
  }

  const cat = creator.category;
  if (cat) {
    if (prefs.preferredCategories.some(c => c && cat && c.toLowerCase() === cat.toLowerCase())) {
      score += 30;
      matchTags.push(cat);
    }
  }

  for (const topic of prefs.preferredTopics) {
    const cleanTopic = topic.replace(/^#/, '').toLowerCase();
    if (profileLower.includes(cleanTopic)) {
      score += 20;
      if (!matchTags.includes(topic)) {
        matchTags.push(topic);
      }
    }
  }

  for (const q of searchHistoryQueries) {
    if (q.length > 2 && profileLower.includes(q.toLowerCase())) {
      score += 15;
    }
  }

  return {
    score: Math.min(score, 100),
    isHidden: false,
    matchReason: matchTags.length > 0 ? `Matches ${matchTags.join(', ')}` : undefined,
    matchTags,
  };
}
