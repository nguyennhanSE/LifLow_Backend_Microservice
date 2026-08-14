import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import {
  RecalculateUserMembershipLevelJobPayload,
  UpdateUserMembershipLevelJobPayload,
  USER_QUEUE_NAME,
  USER_RECALCULATE_MEMBERSHIP_LEVEL_JOB,
  USER_UPDATE_MEMBERSHIP_LEVEL_JOB,
} from './user-queue.constant';

@Injectable()
export class UserQueueService {
  constructor(@InjectQueue(USER_QUEUE_NAME) private readonly userQueue: Queue) {}

  enqueueUpdateMembershipLevel(
    payload: UpdateUserMembershipLevelJobPayload,
    options?: JobsOptions,
  ) {
    return this.userQueue.add(USER_UPDATE_MEMBERSHIP_LEVEL_JOB, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
      ...options,
    });
  }

  enqueueRecalculateMembershipLevel(
    payload: RecalculateUserMembershipLevelJobPayload,
    options?: JobsOptions,
  ) {
    return this.userQueue.add(USER_RECALCULATE_MEMBERSHIP_LEVEL_JOB, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 3000 },
      removeOnComplete: true,
      removeOnFail: false,
      ...options,
    });
  }
}
