import { Processor, WorkerHost } from '@nestjs/bullmq';
import { AppLogger } from 'libs/common/logger';
import { Job } from 'bullmq';
import { UserRepository } from '../repositories/user.repository';
import {
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
      case USER_RECALCULATE_MEMBERSHIP_LEVEL_JOB:
        return this.updateMembershipLevel(
          job as Job<UpdateUserMembershipLevelJobPayload>,
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
}
