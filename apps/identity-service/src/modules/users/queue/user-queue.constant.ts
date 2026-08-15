import type { IdentityRequestMetadata } from '../../../common';

export const USER_QUEUE_NAME = 'user-queue';

export const USER_UPDATE_MEMBERSHIP_LEVEL_JOB = 'update-membership-level';
export const USER_RECALCULATE_MEMBERSHIP_LEVEL_JOB =
  'recalculate-membership-level';

export interface UpdateUserMembershipLevelJobPayload {
  userId: string;
  membershipLevel?: string | null;
  totalPurchaseAmount?: number | null;
  metadata?: IdentityRequestMetadata;
}

export interface MembershipSnapshot {
  id: string;
  name?: string | null;
  nickName?: string | null;
  basePeriod?: number | null;
  description?: string | null;
  minPrice?: number | null;
}

export interface MembershipPriceSnapshot {
  membershipName: string;
  membershipMinPrice: number;
}

export interface RecalculateUserMembershipLevelJobPayload {
  membershipId: string;
  previousMembership?: MembershipSnapshot;
  membership?: MembershipSnapshot;
  allMemberships?: MembershipPriceSnapshot[];
  metadata?: IdentityRequestMetadata;
}
