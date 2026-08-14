import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AppLogger } from 'libs/common/logger';
import { Job } from 'bullmq';
import { UserRepository } from '../repositories/user.repository';
import {
  RecalculateUserMembershipLevelJobPayload,
  UpdateUserMembershipLevelJobPayload,
  USER_QUEUE_NAME,
  USER_RECALCULATE_MEMBERSHIP_LEVEL_JOB,
  USER_UPDATE_MEMBERSHIP_LEVEL_JOB,
} from './user-queue.constant';

@Processor(USER_QUEUE_NAME)
export class UserQueueProcessor extends WorkerHost {
  constructor(
    private readonly logger: AppLogger,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case USER_UPDATE_MEMBERSHIP_LEVEL_JOB:
        return this.updateMembershipLevel(
          job as Job<UpdateUserMembershipLevelJobPayload>,
        );

      case USER_RECALCULATE_MEMBERSHIP_LEVEL_JOB:
        return this.handleMembershipUpdated(
          job as Job<RecalculateUserMembershipLevelJobPayload>,
        );

      default:
        this.logger.warn(`[UserQueue] Unknown job name: ${job.name}`);
        return { skipped: true };
    }
  }

  private async updateMembershipLevel(
    job: Job<UpdateUserMembershipLevelJobPayload>,
  ) {
    const { userId, membershipLevel, totalPurchaseAmount } = job.data;

    if (!userId) {
      throw new Error('[UserQueue] userId is required');
    }

    this.logger.log(
      `[UserQueue] Updating membership level for user ${userId} (job=${job.id})`,
    );

    const user = await this.userRepository.updateMembershipSnapshot(userId, {
      membershipLevel,
      totalPurchaseAmount,
    });

    this.logger.log(
      `[UserQueue] Updated membership level for user ${user.id}: ${user.membershipLevel ?? 'null'}`,
    );

    return {
      userId: user.id,
      membershipLevel: user.membershipLevel,
      totalPurchaseAmount: user.totalPurchaseAmount,
    };
  }

  private async handleMembershipUpdated(
    job: Job<RecalculateUserMembershipLevelJobPayload>,
  ) {
    const {
      membershipId,
      allMemberships,
      membership,
      previousMembership,
      metadata,
    } = job.data;

    if (!membershipId) {
      throw new Error('[UserQueue] membershipId is required');
    }

    this.logger.log(
      `[UserQueue] Received membership update ${membershipId} (job=${job.id}, requestId=${metadata?.requestId ?? 'n/a'})`,
    );

    if (allMemberships?.length) {
      const syncedUsers =
        await this.recalculateMembershipLevels(allMemberships);

      return {
        membershipId,
        allMemberships,
        syncedUsers,
      };
    }

    if (
      previousMembership?.name &&
      membership?.name &&
      previousMembership.name !== membership.name
    ) {
      const result =
        await this.userRepository.updateUsersMembershipLevelByCurrentLevel(
          previousMembership.name,
          membership.name,
        );

      this.logger.log(
        `[UserQueue] Synced membershipLevel name ${previousMembership.name} -> ${membership.name}, updated=${result.count}`,
      );

      return {
        membershipId,
        allMemberships,
        syncedUsers: result.count,
      };
    }

    return {
      membershipId,
      allMemberships,
      syncedUsers: 0,
    };
  }

  private async recalculateMembershipLevels(
    allMemberships: RecalculateUserMembershipLevelJobPayload['allMemberships'],
  ): Promise<number> {
    const sortedMemberships = [...(allMemberships ?? [])]
      .filter((membership) => membership.membershipName)
      .sort((a, b) => b.membershipMinPrice - a.membershipMinPrice);
    let syncedUsers = 0;

    for (const [index, membership] of sortedMemberships.entries()) {
      const nextLowerMembership = sortedMemberships[index - 1];
      const result =
        await this.userRepository.updateUsersMembershipLevelByPurchaseRange({
          membershipLevel: membership.membershipName,
          minPurchaseAmount: membership.membershipMinPrice,
          maxPurchaseAmount: nextLowerMembership?.membershipMinPrice,
        });

      syncedUsers += result.count;
    }

    this.logger.log(
      `[UserQueue] Recalculated membershipLevel from allMemberships, updated=${syncedUsers}`,
    );

    return syncedUsers;
  }
}
