import { Injectable } from '@nestjs/common';

import {
  AssignMembershipDto,
  BulkUpdateMembershipDto,
  CreateMembershipDto,
  QueryMembershipDto,
  QueryUserMembershipsDto,
  UpdateMembershipDto,
  UpdateUserMembershipDto,
} from '../../routes/memberships/dtos/membership.dto';
import { LoyaltyRequestMetadata } from '../metadata/client.metadata';
import { LOYALTY_MEMBERSHIP_PATTERNS } from './loyalty.pattern';
import { LoyaltyClientService } from './loyalty.client.service';

interface MembershipIdPayload {
  id: string;
}

interface UpdateMembershipPayload {
  id: string;
  updateMembershipDto: UpdateMembershipDto;
}

interface MembershipUsersPayload {
  membershipId: string;
  query: QueryUserMembershipsDto;
}

interface UserMembershipsPayload {
  userId: string;
  query: QueryUserMembershipsDto;
}

interface UserIdPayload {
  userId: string;
}

interface UpdateUserMembershipPayload {
  userId: string;
  updateDto: UpdateUserMembershipDto;
}

interface RemoveUserMembershipPayload {
  userId: string;
  membershipId: string;
}

type EmptyPayload = Record<string, never>;

@Injectable()
export class LoyaltyMembershipClient {
  constructor(private readonly loyaltyClientService: LoyaltyClientService) {}

  createMembership(
    createMembershipDto: CreateMembershipDto,
    metadata?: LoyaltyRequestMetadata,
  ) {
    return this.loyaltyClientService.send<CreateMembershipDto>(
      LOYALTY_MEMBERSHIP_PATTERNS.createMembership,
      { data: createMembershipDto, metadata },
    );
  }

  listMemberships(
    query: QueryMembershipDto,
    metadata?: LoyaltyRequestMetadata,
  ) {
    return this.loyaltyClientService.send<QueryMembershipDto>(
      LOYALTY_MEMBERSHIP_PATTERNS.listMemberships,
      { data: query, metadata },
    );
  }

  getMembershipById(id: string, metadata?: LoyaltyRequestMetadata) {
    return this.loyaltyClientService.send<MembershipIdPayload>(
      LOYALTY_MEMBERSHIP_PATTERNS.getMembershipById,
      { data: { id }, metadata },
    );
  }

  updateMembership(
    id: string,
    updateMembershipDto: UpdateMembershipDto,
    metadata?: LoyaltyRequestMetadata,
  ) {
    return this.loyaltyClientService.send<UpdateMembershipPayload>(
      LOYALTY_MEMBERSHIP_PATTERNS.updateMembership,
      { data: { id, updateMembershipDto }, metadata },
    );
  }

  deleteMembership(id: string, metadata?: LoyaltyRequestMetadata) {
    return this.loyaltyClientService.send<MembershipIdPayload>(
      LOYALTY_MEMBERSHIP_PATTERNS.deleteMembership,
      { data: { id }, metadata },
    );
  }

  assignMembershipToUser(
    assignDto: AssignMembershipDto,
    metadata?: LoyaltyRequestMetadata,
  ) {
    return this.loyaltyClientService.send<AssignMembershipDto>(
      LOYALTY_MEMBERSHIP_PATTERNS.assignMembershipToUser,
      { data: assignDto, metadata },
    );
  }

  getMembershipUsers(
    membershipId: string,
    query: QueryUserMembershipsDto,
    metadata?: LoyaltyRequestMetadata,
  ) {
    return this.loyaltyClientService.send<MembershipUsersPayload>(
      LOYALTY_MEMBERSHIP_PATTERNS.getMembershipUsers,
      { data: { membershipId, query }, metadata },
    );
  }

  getUserMemberships(
    userId: string,
    query: QueryUserMembershipsDto,
    metadata?: LoyaltyRequestMetadata,
  ) {
    return this.loyaltyClientService.send<UserMembershipsPayload>(
      LOYALTY_MEMBERSHIP_PATTERNS.getUserMemberships,
      { data: { userId, query }, metadata },
    );
  }

  getUserActiveMembership(
    userId: string,
    metadata?: LoyaltyRequestMetadata,
  ) {
    return this.loyaltyClientService.send<UserIdPayload>(
      LOYALTY_MEMBERSHIP_PATTERNS.getUserActiveMembership,
      { data: { userId }, metadata },
    );
  }

  updateUserMembership(
    userId: string,
    updateDto: UpdateUserMembershipDto,
    metadata?: LoyaltyRequestMetadata,
  ) {
    return this.loyaltyClientService.send<UpdateUserMembershipPayload>(
      LOYALTY_MEMBERSHIP_PATTERNS.updateUserMembership,
      { data: { userId, updateDto }, metadata },
    );
  }

  removeUserMembership(
    userId: string,
    membershipId: string,
    metadata?: LoyaltyRequestMetadata,
  ) {
    return this.loyaltyClientService.send<RemoveUserMembershipPayload>(
      LOYALTY_MEMBERSHIP_PATTERNS.removeUserMembership,
      { data: { userId, membershipId }, metadata },
    );
  }

  recalculateAllMemberships(metadata?: LoyaltyRequestMetadata) {
    return this.loyaltyClientService.send<EmptyPayload>(
      LOYALTY_MEMBERSHIP_PATTERNS.recalculateAllMemberships,
      { data: {}, metadata },
    );
  }

  bulkUpdateMemberships(
    bulkUpdateDto: BulkUpdateMembershipDto,
    metadata?: LoyaltyRequestMetadata,
  ) {
    return this.loyaltyClientService.send<BulkUpdateMembershipDto>(
      LOYALTY_MEMBERSHIP_PATTERNS.bulkUpdateMemberships,
      { data: bulkUpdateDto, metadata },
    );
  }
}
