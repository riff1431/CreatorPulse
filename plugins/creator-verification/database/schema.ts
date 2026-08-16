export type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'changes_requested' | 'expired' | 'revoked';

export interface VerificationApplication {
  id: string;
  userId: string;
  status: VerificationStatus;
  fullLegalName: string;
  dateOfBirth?: string;
  country?: string;
  governmentIdUrl?: string;
  selfieUrl?: string;
  proofOfAddressUrl?: string;
  socialMediaLinks: { platform: string; url: string }[];
  additionalNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationHistoryEntry {
  id: string;
  applicationId: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  previousStatus?: string;
  newStatus?: string;
  note?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface VerificationNote {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface VerificationStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  changesRequested: number;
  expired: number;
  revoked: number;
}
