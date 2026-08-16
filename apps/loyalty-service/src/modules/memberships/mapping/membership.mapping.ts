import type {
  Membership,
  UserMembership,
} from 'libs/prisma/generated/loyalty-service/client';
import {
  MembershipEntity,
  UserMembershipEntity,
} from '../entities/membership.entity';

type UserMembershipWithMembership = UserMembership & {
  membership?: Membership | null;
};

export function toMembershipEntity(membership: Membership): MembershipEntity {
  return {
    id: membership.id,
    name: membership.name ?? '',
    nickName: membership.nickName,
    basePeriod: membership.basePeriod,
    description: membership.description,
    minPrice: membership.minPrice ?? 0,
    createdAt: membership.createdAt ?? new Date(0),
    updatedAt: membership.updatedAt,
  };
}

export function toUserMembershipEntity(
  userMembership: UserMembershipWithMembership,
): UserMembershipEntity {
  return {
    id: userMembership.id,
    userId: userMembership.userId,
    membershipId: userMembership.membershipId,
    membershipName: userMembership.membershipName,
    membershipDescription: userMembership.membershipDescription,
    status: userMembership.status,
    startDate: userMembership.startDate,
    endDate: userMembership.endDate,
    updatedByAdmin: userMembership.updatedByAdmin,
    createdAt: userMembership.createdAt,
    updatedAt: userMembership.updatedAt,
    membership: userMembership.membership
      ? toMembershipEntity(userMembership.membership)
      : undefined,
  };
}
