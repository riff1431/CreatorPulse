import { useState, useEffect, useCallback } from 'react';
import { 
  ContentPreferences, 
  getContentPreferences, 
  saveContentPreferences, 
  resetContentPreferences,
  EVENT_PREFERENCES_CHANGE,
  evaluatePostRelevance,
  evaluateCreatorRelevance
} from './content-preferences-store';
import { 
  SearchAndDiscoveryHistory, 
  getSearchHistory, 
  saveSearchHistoryState,
  addSearchQuery,
  removeSearchItem,
  clearSearchHistory,
  trackDiscoveredCreator,
  removeDiscoveredCreator,
  clearDiscoveryHistory,
  clearAllHistory,
  EVENT_HISTORY_CHANGE
} from '../history/search-history-store';
import { Post, CreatorProfile } from '../supabase/store';

export function useContentPreferences() {
  const [preferences, setPreferences] = useState<ContentPreferences>(getContentPreferences());
  const [history, setHistory] = useState<SearchAndDiscoveryHistory>(getSearchHistory());

  useEffect(() => {
    const handlePrefChange = () => {
      setPreferences(getContentPreferences());
    };

    const handleHistoryChange = () => {
      setHistory(getSearchHistory());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(EVENT_PREFERENCES_CHANGE, handlePrefChange);
      window.addEventListener(EVENT_HISTORY_CHANGE, handleHistoryChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(EVENT_PREFERENCES_CHANGE, handlePrefChange);
        window.removeEventListener(EVENT_HISTORY_CHANGE, handleHistoryChange);
      }
    };
  }, []);

  // Preference Action Handlers
  const togglePreferredCategory = useCallback((category: string) => {
    setPreferences(prev => {
      const exists = prev.preferredCategories.includes(category);
      const updated = exists
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category];
      return saveContentPreferences({ preferredCategories: updated });
    });
  }, []);

  const addPreferredTopic = useCallback((topic: string) => {
    const formatted = topic.startsWith('#') ? topic.toLowerCase() : `#${topic.toLowerCase()}`;
    setPreferences(prev => {
      if (prev.preferredTopics.includes(formatted)) return prev;
      return saveContentPreferences({ preferredTopics: [...prev.preferredTopics, formatted] });
    });
  }, []);

  const removePreferredTopic = useCallback((topic: string) => {
    setPreferences(prev => {
      const updated = prev.preferredTopics.filter(t => t !== topic);
      return saveContentPreferences({ preferredTopics: updated });
    });
  }, []);

  const togglePreferredCreator = useCallback((creatorIdOrUsername: string) => {
    setPreferences(prev => {
      const exists = prev.preferredCreatorIds.includes(creatorIdOrUsername);
      const updated = exists
        ? prev.preferredCreatorIds.filter(id => id !== creatorIdOrUsername)
        : [...prev.preferredCreatorIds, creatorIdOrUsername];
      return saveContentPreferences({ preferredCreatorIds: updated });
    });
  }, []);

  const muteTopic = useCallback((topic: string) => {
    const formatted = topic.startsWith('#') ? topic.toLowerCase() : `#${topic.toLowerCase()}`;
    setPreferences(prev => {
      // If topic was preferred, remove from preferred
      const preferredUpdated = prev.preferredTopics.filter(t => t !== formatted);
      if (prev.mutedTopics.includes(formatted)) return prev;
      return saveContentPreferences({ 
        preferredTopics: preferredUpdated,
        mutedTopics: [...prev.mutedTopics, formatted] 
      });
    });
  }, []);

  const unmuteTopic = useCallback((topic: string) => {
    setPreferences(prev => {
      const updated = prev.mutedTopics.filter(t => t !== topic);
      return saveContentPreferences({ mutedTopics: updated });
    });
  }, []);

  const muteCreator = useCallback((creatorIdOrUsername: string) => {
    setPreferences(prev => {
      const preferredUpdated = prev.preferredCreatorIds.filter(id => id !== creatorIdOrUsername);
      if (prev.mutedCreatorIds.includes(creatorIdOrUsername)) return prev;
      return saveContentPreferences({ 
        preferredCreatorIds: preferredUpdated,
        mutedCreatorIds: [...prev.mutedCreatorIds, creatorIdOrUsername] 
      });
    });
  }, []);

  const unmuteCreator = useCallback((creatorIdOrUsername: string) => {
    setPreferences(prev => {
      const updated = prev.mutedCreatorIds.filter(id => id !== creatorIdOrUsername);
      return saveContentPreferences({ mutedCreatorIds: updated });
    });
  }, []);

  const toggleHiddenPostType = useCallback((postType: string) => {
    setPreferences(prev => {
      const exists = prev.hiddenPostTypes.includes(postType);
      const updated = exists
        ? prev.hiddenPostTypes.filter(t => t !== postType)
        : [...prev.hiddenPostTypes, postType];
      return saveContentPreferences({ hiddenPostTypes: updated });
    });
  }, []);

  const updatePreferenceSetting = useCallback(<K extends keyof ContentPreferences>(key: K, value: ContentPreferences[K]) => {
    setPreferences(saveContentPreferences({ [key]: value }));
  }, []);

  const resetAllPreferences = useCallback(() => {
    setPreferences(resetContentPreferences());
  }, []);

  // History Actions
  const handleAddSearchQuery = useCallback((query: string, category?: string) => {
    setHistory(addSearchQuery(query, category));
  }, []);

  const handleRemoveSearchItem = useCallback((id: string) => {
    setHistory(removeSearchItem(id));
  }, []);

  const handleClearSearchHistory = useCallback(() => {
    setHistory(clearSearchHistory());
  }, []);

  const handleTrackDiscoveredCreator = useCallback((creator: {
    creatorId: string;
    creatorName: string;
    creatorUsername: string;
    avatarUrl: string;
    category: string;
  }) => {
    setHistory(trackDiscoveredCreator(creator));
  }, []);

  const handleRemoveDiscoveredCreator = useCallback((id: string) => {
    setHistory(removeDiscoveredCreator(id));
  }, []);

  const handleClearDiscoveryHistory = useCallback(() => {
    setHistory(clearDiscoveryHistory());
  }, []);

  const handleClearAllHistory = useCallback(() => {
    setHistory(clearAllHistory());
  }, []);

  const updatePrivacySetting = useCallback(<K extends keyof SearchAndDiscoveryHistory>(key: K, value: SearchAndDiscoveryHistory[K]) => {
    setHistory(saveSearchHistoryState({ [key]: value }));
  }, []);

  // Post & Creator Scorer helpers
  const scorePost = useCallback((post: Post) => {
    const searchQueries = history.useHistoryForRecommendations ? history.recentSearches.map(s => s.query) : [];
    return evaluatePostRelevance(post, preferences, searchQueries);
  }, [preferences, history]);

  const scoreCreator = useCallback((creator: CreatorProfile) => {
    const searchQueries = history.useHistoryForRecommendations ? history.recentSearches.map(s => s.query) : [];
    return evaluateCreatorRelevance(creator, preferences, searchQueries);
  }, [preferences, history]);

  return {
    preferences,
    history,
    // Preference Mutators
    togglePreferredCategory,
    addPreferredTopic,
    removePreferredTopic,
    togglePreferredCreator,
    muteTopic,
    unmuteTopic,
    muteCreator,
    unmuteCreator,
    toggleHiddenPostType,
    updatePreferenceSetting,
    resetAllPreferences,
    // History Mutators
    addSearchQuery: handleAddSearchQuery,
    removeSearchItem: handleRemoveSearchItem,
    clearSearchHistory: handleClearSearchHistory,
    trackDiscoveredCreator: handleTrackDiscoveredCreator,
    removeDiscoveredCreator: handleRemoveDiscoveredCreator,
    clearDiscoveryHistory: handleClearDiscoveryHistory,
    clearAllHistory: handleClearAllHistory,
    updatePrivacySetting,
    // Evaluators
    scorePost,
    scoreCreator,
  };
}
