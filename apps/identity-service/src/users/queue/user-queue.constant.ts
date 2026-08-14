export const USER_QUEUE_NAME = 'user-queue';

export const USER_UPDATE_MEMBERSHIP_LEVEL_JOB = 'update-membership-level';
export const USER_RECALCULATE_MEMBERSHIP_LEVEL_JOB =
  'recalculate-membership-level';

export interface UpdateUserMembershipLevelJobPayload {
  userId: string;
  membershipLevel?: string | null;
  totalPurchaseAmount?: number | null;
}

export type RecalculateUserMembershipLevelJobPayload =
  UpdateUserMembershipLevelJobPayload;
