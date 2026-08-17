export interface SearchItem {
  id: string;
  query: string;
  timestamp: string;
  category?: string;
}

export interface DiscoveredCreatorItem {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  avatarUrl: string;
  category: string;
  discoveredAt: string;
}

export interface SearchAndDiscoveryHistory {
  recentSearches: SearchItem[];
  discoveredCreators: DiscoveredCreatorItem[];
  pauseSearchHistory: boolean;
  pauseDiscoveryHistory: boolean;
  useHistoryForRecommendations: boolean;
}

export const DEFAULT_SEARCH_HISTORY: SearchAndDiscoveryHistory = {
  recentSearches: [
    { id: 'sh-1', query: '3D Animation', timestamp: '10 mins ago', category: 'Art & Design' },
    { id: 'sh-2', query: 'UI/UX Masterclass', timestamp: '2 hours ago', category: 'Education & Tech' },
    { id: 'sh-3', query: 'Lo-Fi Beats', timestamp: 'Yesterday', category: 'Music & Sound' },
    { id: 'sh-4', query: 'React Stems', timestamp: '3 days ago', category: 'Education & Tech' },
  ],
  discoveredCreators: [
    {
      id: 'dc-1',
      creatorId: 'c-sarah',
      creatorName: 'Sarah Jenkins',
      creatorUsername: 'sarahdesign',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      category: 'Design & Creative',
      discoveredAt: '1 hour ago'
    },
    {
      id: 'dc-2',
      creatorId: 'user-creator-2',
      creatorName: 'Marcus Vance',
      creatorUsername: 'marcuscode',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      category: 'Software & Code',
      discoveredAt: 'Yesterday'
    }
  ],
  pauseSearchHistory: false,
  pauseDiscoveryHistory: false,
  useHistoryForRecommendations: true,
};

const STORAGE_HISTORY_KEY = 'creatorpulse_search_history_v1';
export const EVENT_HISTORY_CHANGE = 'creatorpulse_search_history_change';

/**
 * Get current search and discovery history from local storage
 */
export function getSearchHistory(): SearchAndDiscoveryHistory {
  if (typeof window === 'undefined') return DEFAULT_SEARCH_HISTORY;
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (!raw) return DEFAULT_SEARCH_HISTORY;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SEARCH_HISTORY, ...parsed };
  } catch (err) {
    console.error('Failed to parse search history:', err);
    return DEFAULT_SEARCH_HISTORY;
  }
}

/**
 * Save history state to local storage and trigger change event
 */

export function saveSearchHistoryState(newState: Partial<SearchAndDiscoveryHistory>): SearchAndDiscoveryHistory {
  if (typeof window === 'undefined') return DEFAULT_SEARCH_HISTORY;
  try {
    const current = getSearchHistory();
    const updated = { ...current, ...newState };
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(EVENT_HISTORY_CHANGE));
    return updated;
  } catch (err) {
    console.error('Failed to save search history state:', err);
    return DEFAULT_SEARCH_HISTORY;
  }
}

/**
 * Log a new search query if search history recording is active
 */
export function addSearchQuery(query: string, category?: string): SearchAndDiscoveryHistory {
  const clean = query.trim();
  if (!clean) return getSearchHistory();
  const current = getSearchHistory();
  if (current.pauseSearchHistory) return current;

  // Filter existing duplicate search if present
  const filtered = current.recentSearches.filter(s => s.query.toLowerCase() !== clean.toLowerCase());
  const newItem: SearchItem = {
    id: `sh-${Date.now()}`,
    query: clean,
    timestamp: 'Just now',
    category,
  };

  const updatedSearches = [newItem, ...filtered].slice(0, 15); // keep last 15
  return saveSearchHistoryState({ recentSearches: updatedSearches });
}

/**
 * Remove an individual search history item by ID
 */
export function removeSearchItem(id: string): SearchAndDiscoveryHistory {
  const current = getSearchHistory();
  const updatedSearches = current.recentSearches.filter(s => s.id !== id);
  return saveSearchHistoryState({ recentSearches: updatedSearches });
}

/**
 * Clear all recent searches
 */
export function clearSearchHistory(): SearchAndDiscoveryHistory {
  return saveSearchHistoryState({ recentSearches: [] });
}

/**
 * Track a discovered creator if discovery history recording is active
 */
export function trackDiscoveredCreator(creator: {
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  avatarUrl: string;
  category: string;
}): SearchAndDiscoveryHistory {
  const current = getSearchHistory();
  if (current.pauseDiscoveryHistory) return current;

  const filtered = current.discoveredCreators.filter(d => d.creatorId !== creator.creatorId);
  const newItem: DiscoveredCreatorItem = {
    id: `dc-${Date.now()}`,
    ...creator,
    discoveredAt: 'Just now',
  };

  const updatedDiscovered = [newItem, ...filtered].slice(0, 20); // keep last 20
  return saveSearchHistoryState({ discoveredCreators: updatedDiscovered });
}

/**
 * Remove an individual discovered creator item by ID
 */
export function removeDiscoveredCreator(id: string): SearchAndDiscoveryHistory {
  const current = getSearchHistory();
  const updatedDiscovered = current.discoveredCreators.filter(d => d.id !== id);
  return saveSearchHistoryState({ discoveredCreators: updatedDiscovered });
}

/**
 * Clear all discovered creators history
 */
export function clearDiscoveryHistory(): SearchAndDiscoveryHistory {
  return saveSearchHistoryState({ discoveredCreators: [] });
}

/**
 * Clear both search logs and discovered creator logs
 */
export function clearAllHistory(): SearchAndDiscoveryHistory {
  return saveSearchHistoryState({
    recentSearches: [],
    discoveredCreators: [],
  });
}
