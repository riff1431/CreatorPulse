import {
  VerificationApplication,
  VerificationHistoryEntry,
  VerificationNote,
  VerificationStats,
  VerificationStatus
} from '../database/schema';

export interface SubmitApplicationPayload {
  userId: string;
  fullLegalName: string;
  dateOfBirth?: string;
  country?: string;
  governmentIdUrl?: string;
  selfieUrl?: string;
  proofOfAddressUrl?: string;
  socialMediaLinks?: { platform: string; url: string }[];
  additionalNotes?: string;
}

export interface ReviewActionPayload {
  applicationId: string;
  adminId: string;
  adminName?: string;
  note?: string;
  reason?: string;
}

export interface ServiceResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export class VerificationService {
  /**
   * Submit a new verification application
   */
  static async submitApplication(payload: SubmitApplicationPayload): Promise<ServiceResult<VerificationApplication>> {
    console.log('[VerificationService] Submitting application for user:', payload.userId);
    try {
      const now = new Date().toISOString();
      const application: VerificationApplication = {
        id: crypto.randomUUID(),
        userId: payload.userId,
        status: 'pending',
        fullLegalName: payload.fullLegalName,
        dateOfBirth: payload.dateOfBirth,
        country: payload.country,
        governmentIdUrl: payload.governmentIdUrl,
        selfieUrl: payload.selfieUrl,
        proofOfAddressUrl: payload.proofOfAddressUrl,
        socialMediaLinks: payload.socialMediaLinks || [],
        additionalNotes: payload.additionalNotes,
        submittedAt: now,
        createdAt: now,
        updatedAt: now
      };
      return { success: true, message: 'Verification application submitted successfully.', data: application };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[VerificationService] Submit failed:', msg);
      return { success: false, error: msg };
    }
  }

  /**
   * Approve a verification application
   */
  static async approveApplication(payload: ReviewActionPayload): Promise<ServiceResult<VerificationHistoryEntry>> {
    console.log('[VerificationService] Approving application:', payload.applicationId);
    try {
      const now = new Date().toISOString();
      const historyEntry: VerificationHistoryEntry = {
        id: crypto.randomUUID(),
        applicationId: payload.applicationId,
        action: 'approved',
        actorId: payload.adminId,
        actorRole: 'admin',
        previousStatus: 'under_review',
        newStatus: 'approved',
        note: payload.note || 'Application approved. Creator identity verified.',
        createdAt: now
      };
      return { success: true, message: 'Application approved. Creator is now verified.', data: historyEntry };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Reject a verification application
   */
  static async rejectApplication(payload: ReviewActionPayload): Promise<ServiceResult<VerificationHistoryEntry>> {
    console.log('[VerificationService] Rejecting application:', payload.applicationId);
    try {
      if (!payload.reason) {
        return { success: false, error: 'A rejection reason is required.' };
      }
      const now = new Date().toISOString();
      const historyEntry: VerificationHistoryEntry = {
        id: crypto.randomUUID(),
        applicationId: payload.applicationId,
        action: 'rejected',
        actorId: payload.adminId,
        actorRole: 'admin',
        previousStatus: 'under_review',
        newStatus: 'rejected',
        note: payload.reason,
        createdAt: now
      };
      return { success: true, message: 'Application rejected.', data: historyEntry };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Request changes on a verification application
   */
  static async requestChanges(payload: ReviewActionPayload): Promise<ServiceResult<VerificationHistoryEntry>> {
    console.log('[VerificationService] Requesting changes on application:', payload.applicationId);
    try {
      if (!payload.reason) {
        return { success: false, error: 'A message describing required changes is required.' };
      }
      const now = new Date().toISOString();
      const historyEntry: VerificationHistoryEntry = {
        id: crypto.randomUUID(),
        applicationId: payload.applicationId,
        action: 'changes_requested',
        actorId: payload.adminId,
        actorRole: 'admin',
        previousStatus: 'under_review',
        newStatus: 'changes_requested',
        note: payload.reason,
        createdAt: now
      };
      return { success: true, message: 'Changes requested. Creator will be notified.', data: historyEntry };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Revoke a previously approved verification
   */
  static async revokeVerification(payload: ReviewActionPayload): Promise<ServiceResult<VerificationHistoryEntry>> {
    console.log('[VerificationService] Revoking verification for application:', payload.applicationId);
    try {
      if (!payload.reason) {
        return { success: false, error: 'A revocation reason is required.' };
      }
      const now = new Date().toISOString();
      const historyEntry: VerificationHistoryEntry = {
        id: crypto.randomUUID(),
        applicationId: payload.applicationId,
        action: 'revoked',
        actorId: payload.adminId,
        actorRole: 'admin',
        previousStatus: 'approved',
        newStatus: 'revoked',
        note: payload.reason,
        createdAt: now
      };
      return { success: true, message: 'Verification revoked. Creator badge removed.', data: historyEntry };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Add an internal or external note to an application
   */
  static async addNote(
    applicationId: string,
    authorId: string,
    authorName: string,
    content: string,
    isInternal: boolean = true
  ): Promise<ServiceResult<VerificationNote>> {
    console.log('[VerificationService] Adding note to application:', applicationId);
    try {
      const note: VerificationNote = {
        id: crypto.randomUUID(),
        applicationId,
        authorId,
        authorName,
        content,
        isInternal,
        createdAt: new Date().toISOString()
      };
      return { success: true, message: 'Note added successfully.', data: note };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<ServiceResult<VerificationStats>> {
    console.log('[VerificationService] Fetching dashboard statistics.');
    try {
      const stats: VerificationStats = {
        total: 0,
        pending: 0,
        underReview: 0,
        approved: 0,
        rejected: 0,
        changesRequested: 0,
        expired: 0,
        revoked: 0
      };
      return { success: true, data: stats };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Validate uploaded document file
   */
  static validateDocument(
    file: { name: string; size: number; type: string },
    maxSizeMB: number = 10,
    allowedTypes: string = 'image/jpeg,image/png,application/pdf'
  ): { valid: boolean; error?: string } {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return { valid: false, error: `File "${file.name}" exceeds maximum size of ${maxSizeMB}MB.` };
    }
    const allowed = allowedTypes.split(',').map(t => t.trim());
    if (!allowed.includes(file.type)) {
      return { valid: false, error: `File type "${file.type}" is not allowed. Accepted: ${allowedTypes}` };
    }
    return { valid: true };
  }

  /**
   * Check for expired verifications (scheduled job)
   */
  static async checkExpiredVerifications(expiryDays: number): Promise<ServiceResult<{ expiredCount: number }>> {
    console.log(`[VerificationService] Checking for verifications older than ${expiryDays} days.`);
    try {
      // In production, this would query the database for expired applications
      return { success: true, data: { expiredCount: 0 }, message: 'Expiry check completed.' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Generate a notification payload for the platform's notification system
   */
  static createNotification(params: {
    userId: string;
    actorId?: string;
    title: string;
    message: string;
    linkUrl?: string;
  }): { user_id: string; actor_id?: string; title: string; message: string; link_url?: string; is_read: boolean } {
    return {
      user_id: params.userId,
      actor_id: params.actorId,
      title: params.title,
      message: params.message,
      link_url: params.linkUrl,
      is_read: false
    };
  }
}
