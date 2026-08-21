import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { IPaginate } from 'libs/common/pagination/pagination.model';
import type { Prisma } from 'libs/prisma/generated/loyalty-service/client';
import type { LoyaltyRequestMetadata } from '../../common';
import { AppLogger } from 'libs/common/logger/logger.service';
import { IdentityClientService } from '../../clients/identity/identity-client.service';
import {
  AssignMembershipDto,
  BulkUpdateMembershipItemDto,
  CreateMembershipDto,
  QueryMembershipDto,
  QueryUserMembershipsDto,
  UpdateMembershipDto,
  UpdateUserMembershipDto,
} from './dtos/membership.dto';
import {
  MembershipEntity,
  UserMembershipEntity,
} from './entities/membership.entity';
import { EMembershipStatus } from './enums/membership.enum';
import {
  MembershipPriceSnapshot,
  MembershipRepository,
} from './repositories/membership.repository';
import { MEMBERSHIP_PATTERNS } from '../../messaging/memberships/memberships.pattern';

const IDENTITY_USER_PATTERNS = {
  checkUserId: 'user.check-id',
  getUserByIds: 'user.get-by-ids',
  updateUser: 'user.update',
} as const;

interface IdentityCheckUserIdResponse {
  exists: boolean;
  userId: string;
}

interface IdentityUserResponse {
  id: string;
  name?: string;
  email?: string;
}

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

  async remove(
    id: string,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<{ message: string; membership: MembershipEntity }> {
    await this.findOne(id);
    const membership = await this.membershipRepository.deleteMembership(id);
    const allMemberships =
      await this.membershipRepository.getMembershipPriceSnapshots();

    this.emitMembershipDeleted(membership, allMemberships, metadata);
    return {
      message: `Membership with id "${id}" deleted successfully`,
      membership,
    };
  }

  async assignMembershipToUser(
    assignDto: AssignMembershipDto,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<UserMembershipEntity> {
    await this.ensureUserExists(assignDto.userId, metadata);

    const membership = await this.findOne(assignDto.membershipId);
    const existing = await this.membershipRepository.getUserMembershipByUserId(
      assignDto.userId,
    );

    if (existing) {
      throw new ConflictException(
        `User "${assignDto.userId}" already has a membership assigned`,
      );
    }

    const { startDate, endDate } = this.parseDateRange(
      assignDto.startDate,
      assignDto.endDate,
    );

    const userMembership = await this.membershipRepository.createUserMembership(
      {
        userId: assignDto.userId,
        membershipId: membership.id,
        membershipName: membership.name,
        membershipDescription: membership.description ?? '',
        status: assignDto.status ?? EMembershipStatus.NORMAL,
        startDate,
        endDate,
        updatedByAdmin: true,
      },
    );

    await this.syncIdentityMembershipLevel(
      assignDto.userId,
      this.resolveIdentityMembershipLevel(userMembership),
      metadata,
    );

    return userMembership;
  }

  async getMembershipUsers(
    membershipId: string,
    query: QueryUserMembershipsDto,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<IPaginate<UserMembershipEntity>> {
    await this.findOne(membershipId);

    const page = await this.membershipRepository.getUserMembershipsPaginated({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sort: query.sortOrder ?? 'desc',
      sortBy: query.sortBy ?? 'createdAt',
      membershipId,
      status: query.status,
      counted: true,
    });

    return this.enrichUserMemberships(page, metadata);
  }

  async getUserMemberships(
    userId: string,
    query: QueryUserMembershipsDto,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<IPaginate<UserMembershipEntity>> {
    await this.ensureUserExists(userId, metadata);

    return this.membershipRepository.getUserMembershipsPaginated({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sort: query.sortOrder ?? 'desc',
      sortBy: query.sortBy ?? 'createdAt',
      userId,
      membershipId: query.membershipId,
      status: query.status,
      counted: true,
    });
  }

  async getUserActiveMembership(
    userId: string,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<UserMembershipEntity | null> {
    await this.ensureUserExists(userId, metadata);

    return this.membershipRepository.getActiveUserMembership(userId);
  }

  async updateUserMembership(
    userId: string,
    updateDto: UpdateUserMembershipDto,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<UserMembershipEntity> {
    await this.ensureUserExists(userId, metadata);

    const existing =
      await this.membershipRepository.getUserMembershipByUserId(userId);

    if (!existing) {
      throw new NotFoundException(`Membership for user "${userId}" not found`);
    }

    const updateData: Prisma.UserMembershipUncheckedUpdateInput = {
      updatedByAdmin: true,
    };
    let shouldSyncIdentityMembershipLevel = false;

    if (updateDto.startDate !== undefined || updateDto.endDate !== undefined) {
      const { startDate, endDate } = this.parseDateRange(
        updateDto.startDate,
        updateDto.endDate,
        existing,
      );

      updateData.startDate = startDate;
      updateData.endDate = endDate;
      shouldSyncIdentityMembershipLevel = true;
    }

    if (updateDto.status !== undefined) {
      updateData.status = updateDto.status;
      shouldSyncIdentityMembershipLevel = true;
    }

    if (updateDto.membershipLevel !== undefined) {
      const membership = await this.membershipRepository.getMembershipByName(
        updateDto.membershipLevel,
      );

      if (!membership) {
        throw new NotFoundException(
          `Membership with name "${updateDto.membershipLevel}" not found`,
        );
      }

      updateData.membershipId = membership.id;
      updateData.membershipName = membership.name;
      updateData.membershipDescription = membership.description ?? '';
      shouldSyncIdentityMembershipLevel = true;
    }

    if (Object.keys(updateData).length === 1) {
      throw new BadRequestException('No update data provided');
    }

    const userMembership = await this.membershipRepository.updateUserMembership(
      userId,
      updateData,
    );

    if (shouldSyncIdentityMembershipLevel) {
      await this.syncIdentityMembershipLevel(
        userId,
        this.resolveIdentityMembershipLevel(userMembership),
        metadata,
      );
    }

    return userMembership;
  }

  async removeUserMembership(
    userId: string,
    membershipId: string,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<{ message: string; membership: UserMembershipEntity }> {
    await this.ensureUserExists(userId, metadata);

    const userMembership =
      await this.membershipRepository.getUserMembershipByUserAndMembership(
        userId,
        membershipId,
      );

    if (!userMembership) {
      throw new NotFoundException(
        `Membership "${membershipId}" for user "${userId}" not found`,
      );
    }

    const membership = await this.membershipRepository.deleteUserMembership(
      userMembership.id,
    );

    await this.syncIdentityMembershipLevel(userId, null, metadata);

    return {
      message: `Membership "${membershipId}" removed from user "${userId}" successfully`,
      membership,
    };
  }

  async recalculateAllMemberships(
    metadata?: LoyaltyRequestMetadata,
  ): Promise<{ enqueued: boolean; pattern: string }> {
    const allMemberships =
      await this.membershipRepository.getMembershipPriceSnapshots();

    this.emitMembershipRecalculation(allMemberships, metadata);

    return {
      enqueued: true,
      pattern: MEMBERSHIP_PATTERNS.membershipUpdated,
    };
  }

  async bulkUpdateMemberships(updates: BulkUpdateMembershipItemDto[]): Promise<{
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

  private emitMembershipDeleted(
    membership: MembershipEntity,
    allMemberships: MembershipPriceSnapshot[],
    metadata?: LoyaltyRequestMetadata,
  ) {
    this.emitMembershipRecalculation(
      allMemberships,
      metadata,
      membership.id,
      membership,
    );
  }

  private emitMembershipRecalculation(
    allMemberships: MembershipPriceSnapshot[],
    metadata?: LoyaltyRequestMetadata,
    membershipId = 'manual-recalculate-all',
    previousMembership?: MembershipEntity,
  ) {
    void this.identityClientService
      .emit(MEMBERSHIP_PATTERNS.membershipUpdated, {
        data: {
          membershipId,
          previousMembership,
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

  private async ensureUserExists(
    userId: string,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<void> {
    let result: IdentityCheckUserIdResponse;

    try {
      result = await this.identityClientService.send<
        IdentityCheckUserIdResponse,
        { id: string }
      >(IDENTITY_USER_PATTERNS.checkUserId, {
        data: { id: userId },
        metadata,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `[${this.context}] Failed to verify user "${userId}" via ${IDENTITY_USER_PATTERNS.checkUserId}: ${message}`,
        error instanceof Error ? error : undefined,
        this.context,
      );

      throw new ServiceUnavailableException(
        'Unable to verify user existence from identity service',
      );
    }

    if (!result.exists) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }
  }

  private async syncIdentityMembershipLevel(
    userId: string,
    membershipLevel: string | null,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<void> {
    await this.identityClientService.send<
      unknown,
      {
        id: string;
        updateUserDto: { membershipLevel: string | null };
      }
    >(IDENTITY_USER_PATTERNS.updateUser, {
      data: {
        id: userId,
        updateUserDto: { membershipLevel },
      },
      metadata,
    });
  }

  private async enrichUserMemberships(
    page: IPaginate<UserMembershipEntity>,
    metadata?: LoyaltyRequestMetadata,
  ): Promise<IPaginate<UserMembershipEntity>> {
    const userIds = page.docs.map((membership) => membership.userId);

    if (userIds.length === 0) {
      return page;
    }

    try {
      const users = await this.identityClientService.send<
        IdentityUserResponse[],
        { ids: string[] }
      >(IDENTITY_USER_PATTERNS.getUserByIds, {
        data: { ids: userIds },
        metadata,
      });
      const usersById = new Map(users.map((user) => [user.id, user]));

      return {
        ...page,
        docs: page.docs.map((membership) => ({
          ...membership,
          user: usersById.get(membership.userId),
        })),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `[${this.context}] Failed to enrich membership users: ${message}`,
        error instanceof Error ? error : undefined,
        this.context,
      );

      return page;
    }
  }

  private parseDateRange(
    startDateValue?: string,
    endDateValue?: string,
    existing?: UserMembershipEntity,
  ): { startDate: Date; endDate: Date } {
    const startDate = startDateValue
      ? new Date(startDateValue)
      : existing?.startDate;
    const endDate = endDateValue ? new Date(endDateValue) : existing?.endDate;

    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid membership date range');
    }

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return { startDate, endDate };
  }

  private resolveIdentityMembershipLevel(
    userMembership: UserMembershipEntity,
  ): string | null {
    const now = new Date();
    const userMembershipStatus = Object.values(EMembershipStatus).includes(
      userMembership.status as EMembershipStatus,
    )
      ? (userMembership.status as EMembershipStatus)
      : undefined;
    const isActive =
      userMembershipStatus === EMembershipStatus.NORMAL &&
      userMembership.startDate <= now &&
      userMembership.endDate >= now;

    return isActive ? userMembership.membershipName : null;
  }
}
