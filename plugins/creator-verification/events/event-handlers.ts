/* eslint-disable @typescript-eslint/no-unused-vars */
import { VerificationService } from '../services/plugin.service';

/**
 * Creator Verification Manager — Event Handlers
 * These handlers respond to verification lifecycle events and trigger
 * platform notifications, badge updates, and audit log entries.
 */
export const eventHandlers = {
  /**
   * Fired when a creator submits a new verification application.
   * Notifies admin users about the pending review.
   */
  onVerificationSubmitted: async (application: {
    id: string;
    userId: string;
    fullLegalName: string;
  }) => {
    console.log(`[Verification Event] Application submitted by ${application.fullLegalName} (${application.id})`);
    const notification = VerificationService.createNotification({
      userId: 'admin', // In production: query all admin user IDs
      actorId: application.userId,
      title: 'New Verification Application',
      message: `${application.fullLegalName} has submitted a verification application for review.`,
      linkUrl: `/admin/plugins/creator-verification?highlight=${application.id}`
    });
    console.log('[Verification Event] Admin notification payload:', notification);
  },

  /**
   * Fired when an admin approves a verification application.
   * Updates profiles.is_verified and notifies the creator.
   */
  onVerificationApproved: async (data: {
    applicationId: string;
    userId: string;
    adminId: string;
    fullLegalName: string;
  }) => {
    console.log(`[Verification Event] Application ${data.applicationId} approved for ${data.fullLegalName}`);
    // In production: UPDATE profiles SET is_verified = true WHERE id = data.userId
    const notification = VerificationService.createNotification({
      userId: data.userId,
      actorId: data.adminId,
      title: '🎉 Verification Approved!',
      message: 'Congratulations! Your identity has been verified. Your profile now displays the verified creator badge.',
      linkUrl: '/creator/verification'
    });
    console.log('[Verification Event] Creator notification payload:', notification);
  },

  /**
   * Fired when an admin rejects a verification application.
   */
  onVerificationRejected: async (data: {
    applicationId: string;
    userId: string;
    adminId: string;
    reason: string;
  }) => {
    console.log(`[Verification Event] Application ${data.applicationId} rejected. Reason: ${data.reason}`);
    const notification = VerificationService.createNotification({
      userId: data.userId,
      actorId: data.adminId,
      title: 'Verification Application Update',
      message: `Your verification application was not approved. Reason: ${data.reason}`,
      linkUrl: '/creator/verification'
    });
    console.log('[Verification Event] Creator notification payload:', notification);
  },

  /**
   * Fired when an admin requests changes on a verification application.
   */
  onVerificationChangesRequested: async (data: {
    applicationId: string;
    userId: string;
    adminId: string;
    message: string;
  }) => {
    console.log(`[Verification Event] Changes requested on ${data.applicationId}: ${data.message}`);
    const notification = VerificationService.createNotification({
      userId: data.userId,
      actorId: data.adminId,
      title: 'Verification: Changes Required',
      message: `Your verification application needs updates: ${data.message}`,
      linkUrl: '/creator/verification'
    });
    console.log('[Verification Event] Creator notification payload:', notification);
  },

  /**
   * Fired when an admin revokes a previously approved verification.
   */
  onVerificationRevoked: async (data: {
    applicationId: string;
    userId: string;
    adminId: string;
    reason: string;
  }) => {
    console.log(`[Verification Event] Verification revoked for ${data.applicationId}. Reason: ${data.reason}`);
    // In production: UPDATE profiles SET is_verified = false WHERE id = data.userId
    const notification = VerificationService.createNotification({
      userId: data.userId,
      actorId: data.adminId,
      title: 'Verification Status Changed',
      message: `Your verified creator status has been revoked. Reason: ${data.reason}`,
      linkUrl: '/creator/verification'
    });
    console.log('[Verification Event] Creator notification payload:', notification);
  },

  /**
   * System event fired when a verification expires based on configured expiry days.
   */
  onVerificationExpired: async (data: {
    applicationId: string;
    userId: string;
    expiryDate: string;
  }) => {
    console.log(`[Verification Event] Verification expired for user ${data.userId} on ${data.expiryDate}`);
    // In production: UPDATE profiles SET is_verified = false WHERE id = data.userId
    const notification = VerificationService.createNotification({
      userId: data.userId,
      title: 'Verification Expired',
      message: 'Your creator verification has expired. Please re-apply to maintain your verified badge.',
      linkUrl: '/creator/verification'
    });
    console.log('[Verification Event] Creator notification payload:', notification);
  }
};
