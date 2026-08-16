'use client';

import { useState, useEffect, useCallback } from 'react';

interface VerificationState {
  status: 'none' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'changes_requested' | 'expired' | 'revoked';
  applicationId?: string;
  submittedAt?: string;
  reviewedAt?: string;
  adminMessage?: string;
  rejectionReason?: string;
  expiresAt?: string;
  isLoading: boolean;
  error?: string;
}

/**
 * React hook for client-side verification state management.
 * Fetches the current user's verification status from the plugin API.
 */
export function useVerification(userId?: string) {
  const [state, setState] = useState<VerificationState>({
    status: 'none',
    isLoading: true
  });

  const fetchStatus = useCallback(async () => {
    if (!userId) {
      setState({ status: 'none', isLoading: false });
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));
      const response = await fetch(`/api/plugins/creator-verification/my-application?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setState({
          status: data.data.status || 'none',
          applicationId: data.data.id,
          submittedAt: data.data.submittedAt,
          reviewedAt: data.data.reviewedAt,
          adminMessage: data.data.adminMessage,
          rejectionReason: data.data.rejectionReason,
          expiresAt: data.data.expiresAt,
          isLoading: false
        });
      } else {
        setState({ status: 'none', isLoading: false });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch verification status';
      console.error('[useVerification] Error:', errorMsg);
      setState({ status: 'none', isLoading: false, error: errorMsg });
    }
  }, [userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const refresh = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    ...state,
    isVerified: state.status === 'approved',
    isPending: state.status === 'pending' || state.status === 'under_review',
    needsChanges: state.status === 'changes_requested',
    canApply: state.status === 'none' || state.status === 'rejected' || state.status === 'expired' || state.status === 'revoked',
    refresh
  };
}
