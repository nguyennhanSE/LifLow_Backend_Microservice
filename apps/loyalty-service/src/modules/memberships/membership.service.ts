import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IPaginate } from 'libs/common/pagination/pagination.model';
import type { Prisma } from 'libs/prisma/generated/loyalty-service/client';
import type { LoyaltyRequestMetadata } from '../../common';
import { AppLogger } from 'libs/common/logger/logger.service';
import { IdentityClientService } from '../../clients/identity/identity-client.service';
import {
  BulkUpdateMembershipItemDto,
  CreateMembershipDto,
  QueryMembershipDto,
  UpdateMembershipDto,
} from './dtos/membership.dto';
import { MembershipEntity } from './entities/membership.entity';
import {
  MembershipPriceSnapshot,
  MembershipRepository,
} from './repositories/membership.repository';
import { MEMBERSHIP_PATTERNS } from './patterns/membership.pattern';

@Injectable()
export class MembershipService {
  private readonly context = MembershipService.name;

  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly logger: AppLogger,
    private readonly identityClientService: IdentityClientService,
  ) {}

  async create(
    createMembershipDto: CreateMembershipDto,
  ): Promise<MembershipEntity> {
    const existing = await this.membershipRepository.getMembershipByName(
      createMembershipDto.name,
    );

    if (existing) {
      throw new ConflictException(
        `Membership with name "${createMembershipDto.name}" already exists`,
      );
    }

    return this.membershipRepository.createMembership(createMembershipDto);
  }

  findAll(query: QueryMembershipDto): Promise<IPaginate<MembershipEntity>> {
    return this.membershipRepository.getMembershipsPaginated({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sort: query.sortOrder ?? 'asc',
      sortBy: query.sortBy ?? 'name',
      search: query.search,
      name: query.name,
      counted: true,
    });
  }

  async findOne(id: string): Promise<MembershipEntity> {
    const membership = await this.membershipRepository.getMembershipById(id);

    if (!membership) {
      throw new NotFoundException(`Membership with id "${id}" not found`);
    }

    return membership;
  }

  async update(
    id: string,
    updateMembershipDto: UpdateMembershipDto,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<MembershipEntity> {
    const previousMembership = await this.findOne(id);

    if (updateMembershipDto.name) {
      const existing = await this.membershipRepository.getMembershipByName(
        updateMembershipDto.name,
      );

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Membership with name "${updateMembershipDto.name}" already exists`,
        );
      }
    }

    const membership = await this.membershipRepository.updateMembership(
      id,
      updateMembershipDto,
    );
    const allMemberships =
      await this.membershipRepository.getMembershipPriceSnapshots();

    this.emitMembershipUpdated(
      previousMembership,
      membership,
      allMemberships,
      metadata,
    );

    return membership;
  }

  async remove(id: string): Promise<{ message: string; membership: MembershipEntity }> {
    await this.findOne(id);
    const membership = await this.membershipRepository.deleteMembership(id);

    return {
      message: `Membership with id "${id}" deleted successfully`,
      membership,
    };
  }

  async bulkUpdateMemberships(
    updates: BulkUpdateMembershipItemDto[],
  ): Promise<{
    totalProcessed: number;
    successful: number;
    failed: number;
    results: Array<{
      membershipId: string;
      success: boolean;
      data?: MembershipEntity;
      error?: string;
    }>;
  }> {
    this.logger.log(`Processing bulk update for ${updates.length} memberships`);

    const results: Array<{
      membershipId: string;
      success: boolean;
      data?: MembershipEntity;
      error?: string;
    }> = [];
    let successful = 0;
    let failed = 0;

    for (const update of updates) {
      try {
        const data = await this.updateMembershipFromBulkItem(update);

        results.push({
          membershipId: update.membershipId,
          success: true,
          data,
        });
        successful += 1;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        results.push({
          membershipId: update.membershipId,
          success: false,
          error: errorMessage,
        });
        failed += 1;
      }
    }

    return {
      totalProcessed: updates.length,
      successful,
      failed,
      results,
    };
  }

  private async updateMembershipFromBulkItem(
    update: BulkUpdateMembershipItemDto,
  ): Promise<MembershipEntity> {
    const membership = await this.membershipRepository.getMembershipById(
      update.membershipId,
    );

    if (!membership) {
      throw new NotFoundException(
        `Membership with id "${update.membershipId}" not found`,
      );
    }

    const updateData: Prisma.MembershipUpdateInput = {};

    if (update.nickName !== undefined) {
      updateData.nickName = update.nickName;
    }
    if (update.minPrice !== undefined) {
      updateData.minPrice = update.minPrice;
    }
    if (update.basePeriod !== undefined) {
      updateData.basePeriod = update.basePeriod;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        `No update data provided for membership "${update.membershipId}"`,
      );
    }

    return this.membershipRepository.updateMembership(
      update.membershipId,
      updateData,
    );
  }

  private emitMembershipUpdated(
    previousMembership: MembershipEntity,
    membership: MembershipEntity,
    allMemberships: MembershipPriceSnapshot[],
    metadata?: LoyaltyRequestMetadata,
  ) {
    void this.identityClientService
      .emit(MEMBERSHIP_PATTERNS.membershipUpdated, {
        data: {
          membershipId: membership.id,
          previousMembership,
          membership,
          allMemberships,
        },
        metadata,
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);

        this.logger.error(
          `[${this.context}] Failed to emit ${MEMBERSHIP_PATTERNS.membershipUpdated}: ${message}`,
          error instanceof Error ? error : undefined,
          this.context,
        );
      });
  }
}
