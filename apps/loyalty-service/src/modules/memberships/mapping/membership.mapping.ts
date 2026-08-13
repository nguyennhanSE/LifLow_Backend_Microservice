import type { Membership } from 'libs/prisma/generated/loyalty-service/client';
import { MembershipEntity } from '../entities/membership.entity';

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
