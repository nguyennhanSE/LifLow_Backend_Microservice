import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { LoyaltyRequestPayload } from '../../common';
import {
  AssignMembershipDto,
  BulkUpdateMembershipDto,
  CreateMembershipDto,
  MembershipUsersPayload,
  MembershipIdPayload,
  QueryMembershipDto,
  RemoveUserMembershipPayload,
  UpdateMembershipPayload,
  UpdateUserMembershipPayload,
  UserIdPayload,
  UserMembershipsPayload,
} from './dtos/membership.dto';
import { MEMBERSHIP_PATTERNS } from './patterns/membership.pattern';
import { MembershipService } from './membership.service';

@Controller()
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @MessagePattern(MEMBERSHIP_PATTERNS.createMembership)
  createMembership(
    @Payload() payload: LoyaltyRequestPayload<CreateMembershipDto>,
  ) {
    return this.membershipService.create(payload.data);
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.listMemberships)
  listMemberships(
    @Payload() payload: LoyaltyRequestPayload<QueryMembershipDto>,
  ) {
    return this.membershipService.findAll(payload.data);
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.getMembershipById)
  getMembershipById(
    @Payload() payload: LoyaltyRequestPayload<MembershipIdPayload>,
  ) {
    return this.membershipService.findOne(payload.data.id);
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.updateMembership)
  updateMembership(
    @Payload() payload: LoyaltyRequestPayload<UpdateMembershipPayload>,
  ) {
    return this.membershipService.update(
      payload.data.id,
      payload.data.updateMembershipDto,
      payload.metadata,
    );
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.deleteMembership)
  deleteMembership(
    @Payload() payload: LoyaltyRequestPayload<MembershipIdPayload>,
  ) {
    return this.membershipService.remove(payload.data.id, payload.metadata);
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.assignMembershipToUser)
  assignMembershipToUser(
    @Payload() payload: LoyaltyRequestPayload<AssignMembershipDto>,
  ) {
    return this.membershipService.assignMembershipToUser(
      payload.data,
      payload.metadata,
    );
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.getMembershipUsers)
  getMembershipUsers(
    @Payload() payload: LoyaltyRequestPayload<MembershipUsersPayload>,
  ) {
    return this.membershipService.getMembershipUsers(
      payload.data.membershipId,
      payload.data.query,
      payload.metadata,
    );
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.getUserMemberships)
  getUserMemberships(
    @Payload() payload: LoyaltyRequestPayload<UserMembershipsPayload>,
  ) {
    return this.membershipService.getUserMemberships(
      payload.data.userId,
      payload.data.query,
      payload.metadata,
    );
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.getUserActiveMembership)
  getUserActiveMembership(
    @Payload() payload: LoyaltyRequestPayload<UserIdPayload>,
  ) {
    return this.membershipService.getUserActiveMembership(
      payload.data.userId,
      payload.metadata,
    );
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.updateUserMembership)
  updateUserMembership(
    @Payload() payload: LoyaltyRequestPayload<UpdateUserMembershipPayload>,
  ) {
    return this.membershipService.updateUserMembership(
      payload.data.userId,
      payload.data.updateDto,
      payload.metadata,
    );
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.removeUserMembership)
  removeUserMembership(
    @Payload() payload: LoyaltyRequestPayload<RemoveUserMembershipPayload>,
  ) {
    return this.membershipService.removeUserMembership(
      payload.data.userId,
      payload.data.membershipId,
      payload.metadata,
    );
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.recalculateAllMemberships)
  recalculateAllMemberships(@Payload() payload: LoyaltyRequestPayload<{}>) {
    return this.membershipService.recalculateAllMemberships(payload.metadata);
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.bulkUpdateMemberships)
  bulkUpdateMemberships(
    @Payload() payload: LoyaltyRequestPayload<BulkUpdateMembershipDto>,
  ) {
    return this.membershipService.bulkUpdateMemberships(payload.data.updates);
  }
}
