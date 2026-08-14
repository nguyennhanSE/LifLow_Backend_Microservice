import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { LoyaltyRequestPayload } from '../../common';
import {
  BulkUpdateMembershipDto,
  CreateMembershipDto,
  MembershipIdPayload,
  QueryMembershipDto,
  UpdateMembershipPayload,
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
    return this.membershipService.remove(payload.data.id);
  }

  @MessagePattern(MEMBERSHIP_PATTERNS.bulkUpdateMemberships)
  bulkUpdateMemberships(
    @Payload() payload: LoyaltyRequestPayload<BulkUpdateMembershipDto>,
  ) {
    return this.membershipService.bulkUpdateMemberships(payload.data.updates);
  }
}
