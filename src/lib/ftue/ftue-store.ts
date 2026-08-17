import { UserProfile, UserRole } from '../supabase/store';

export interface FtueState {
  hasSeenWelcomeModal: boolean;
  hasCompletedTour: boolean;
  dismissedTooltips: string[];
  completedFirstActions: string[];
}

const DEFAULT_FTUE_STATE: FtueState = {
  hasSeenWelcomeModal: false,
  hasCompletedTour: false,
  dismissedTooltips: [],
  completedFirstActions: [],
};

const STORAGE_PREFIX = 'creatorpulse_ftue_';

/**
 * Gets the current FTUE state for a given user ID.
 */
export function getFtueState(userId?: string | null): FtueState {
  if (!userId || typeof window === 'undefined') {
    return DEFAULT_FTUE_STATE;
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (raw) {
      return { ...DEFAULT_FTUE_STATE, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error reading FTUE state from localStorage', e);
  }

  return DEFAULT_FTUE_STATE;
}

/**
 * Saves updated FTUE state for a user ID.
 */
export function setFtueState(userId: string, updates: Partial<FtueState>): FtueState {
  if (!userId || typeof window === 'undefined') {
    return DEFAULT_FTUE_STATE;
  }

  try {
    const current = getFtueState(userId);
    const next: FtueState = {
      ...current,
      ...updates,
      dismissedTooltips: updates.dismissedTooltips || current.dismissedTooltips,
      completedFirstActions: updates.completedFirstActions || current.completedFirstActions,
    };

    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(next));

    // Dispatch global event so components re-render instantly
    window.dispatchEvent(
      new CustomEvent('creatorpulse_ftue_updated', {
        detail: { userId, state: next },
      })
    );

    return next;
  } catch (e) {
    console.warn('Error writing FTUE state to localStorage', e);
    return DEFAULT_FTUE_STATE;
  }
}

/**
 * Marks welcome modal as seen.
 */
export function markWelcomeSeen(userId: string): FtueState {
  return setFtueState(userId, { hasSeenWelcomeModal: true });
}

/**
 * Marks guided tour as completed.
 */
export function markTourCompleted(userId: string): FtueState {
  return setFtueState(userId, { hasCompletedTour: true, hasSeenWelcomeModal: true });
}

/**
 * Dismisses a specific feature tooltip.
 */
export function dismissTooltip(userId: string, tooltipId: string): FtueState {
  const current = getFtueState(userId);
  if (current.dismissedTooltips.includes(tooltipId)) {
    return current;
  }
  return setFtueState(userId, {
    dismissedTooltips: [...current.dismissedTooltips, tooltipId],
  });
}

/**
 * Marks a starter first action as completed.
 */
export function completeFirstAction(userId: string, actionId: string): FtueState {
  const current = getFtueState(userId);
  if (current.completedFirstActions.includes(actionId)) {
    return current;
  }
  return setFtueState(userId, {
    completedFirstActions: [...current.completedFirstActions, actionId],
  });
}

/**
 * Checks if a tooltip has been dismissed.
 */
export function isTooltipDismissed(userId: string, tooltipId: string): boolean {
  const state = getFtueState(userId);
  return state.dismissedTooltips.includes(tooltipId);
}
