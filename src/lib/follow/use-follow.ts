'use client';

import { useState, useEffect, useCallback } from 'react';
import { followStore, EVENT_FOLLOW_CHANGE, FollowStatus, ConnectionUser, SuggestedCreator } from './follow-store';
import { useAuth } from '../auth/auth-context';

export function useFollow(targetUserId?: string) {
  const { user } = useAuth();
  const currentUserId = user?.id || 'user-member';
  const effectiveTargetId = targetUserId || currentUserId;

  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleFollowChange = () => {
      setVersion((v) => v + 1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(EVENT_FOLLOW_CHANGE, handleFollowChange);
      return () => window.removeEventListener(EVENT_FOLLOW_CHANGE, handleFollowChange);
    }
  }, []);

  const counts = followStore.getCounts(effectiveTargetId);
  const status = followStore.getFollowStatus(currentUserId, effectiveTargetId);
  const isPrivate = followStore.isProfilePrivate(effectiveTargetId);

  const follow = useCallback(
    (targetId?: string) => {
      const id = targetId || effectiveTargetId;
      const res = followStore.follow(currentUserId, id);
      setVersion((v) => v + 1);
      return res;
    },
    [currentUserId, effectiveTargetId]
  );

  const unfollow = useCallback(
    (targetId?: string) => {
      const id = targetId || effectiveTargetId;
      followStore.unfollow(currentUserId, id);
      setVersion((v) => v + 1);
    },
    [currentUserId, effectiveTargetId]
  );

  const removeFollower = useCallback(
    (followerId: string) => {
      followStore.removeFollower(currentUserId, followerId);
      setVersion((v) => v + 1);
    },
    [currentUserId]
  );

  const acceptRequest = useCallback(
    (requesterId: string) => {
      followStore.acceptFollowRequest(currentUserId, requesterId);
      setVersion((v) => v + 1);
    },
    [currentUserId]
  );

  const declineRequest = useCallback(
    (requesterId: string) => {
      followStore.declineFollowRequest(currentUserId, requesterId);
      setVersion((v) => v + 1);
    },
    [currentUserId]
  );

  const cancelRequest = useCallback(
    (targetId?: string) => {
      const id = targetId || effectiveTargetId;
      followStore.cancelFollowRequest(currentUserId, id);
      setVersion((v) => v + 1);
    },
    [currentUserId, effectiveTargetId]
  );

  const setPrivacy = useCallback(
    (privateMode: boolean) => {
      followStore.setProfilePrivacy(currentUserId, privateMode);
      setVersion((v) => v + 1);
    },
    [currentUserId]
  );

  const getFollowers = useCallback(
    (query?: string) => followStore.getFollowers(effectiveTargetId, query),
    [effectiveTargetId, version]
  );

  const getFollowing = useCallback(
    (query?: string, roleFilter?: string) => followStore.getFollowing(effectiveTargetId, query, roleFilter),
    [effectiveTargetId, version]
  );

  const getPendingRequests = useCallback(
    () => followStore.getPendingRequests(effectiveTargetId),
    [effectiveTargetId, version]
  );

  const getMutualConnections = useCallback(
    () => followStore.getMutualConnections(effectiveTargetId),
    [effectiveTargetId, version]
  );

  const getSuggestedCreators = useCallback(
    () => followStore.getSuggestedCreators(currentUserId),
    [currentUserId, version]
  );

  return {
    currentUserId,
    effectiveTargetId,
    status: status.status,
    isFollowing: status.isFollowing,
    isPending: status.isPending,
    isFollower: status.isFollower,
    isMutual: status.isMutual,
    isPrivate,
    counts,
    follow,
    unfollow,
    removeFollower,
    acceptRequest,
    declineRequest,
    cancelRequest,
    setPrivacy,
    getFollowers,
    getFollowing,
    getPendingRequests,
    getMutualConnections,
    getSuggestedCreators,
  };
}
