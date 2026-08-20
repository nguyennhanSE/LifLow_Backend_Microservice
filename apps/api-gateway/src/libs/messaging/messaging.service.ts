import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { RedisMessagingService } from 'libs/redis';
import { GENERAL_NOTIFICATION_CHANNELS } from '../../clients/notification/notification.pattern';

export interface GeneralNotificationMessage {
  userId: string;
  event?: string;
  data: string | object;
  id?: string;
}

export type GeneralNotificationHandler = (
  message: GeneralNotificationMessage,
) => void;

@Injectable()
export class MessagingService implements OnModuleInit, OnApplicationShutdown {
  private readonly generalNotificationHandlers = new Set<GeneralNotificationHandler>();
  private readonly generalNotificationRedisHandler = (message: string) => {
    const parsedMessage = this.parseGeneralNotificationMessage(message);

    if (!parsedMessage) {
      return;
    }

    for (const handler of this.generalNotificationHandlers) {
      handler(parsedMessage);
    }
  };

  constructor(private readonly redisMessagingService: RedisMessagingService) {}

  async onModuleInit() {
    await this.redisMessagingService.subscribe(
      GENERAL_NOTIFICATION_CHANNELS.userNotifications,
      this.generalNotificationRedisHandler,
    );
  }

  async onApplicationShutdown() {
    await this.redisMessagingService.unsubscribe(
      GENERAL_NOTIFICATION_CHANNELS.userNotifications,
      this.generalNotificationRedisHandler,
    );
  }

  onGeneralNotification(handler: GeneralNotificationHandler): () => void {
    this.generalNotificationHandlers.add(handler);

    return () => {
      this.generalNotificationHandlers.delete(handler);
    };
  }

  private parseGeneralNotificationMessage(
    message: string,
  ): GeneralNotificationMessage | null {
    try {
      const parsedMessage = JSON.parse(
        message,
      ) as Partial<GeneralNotificationMessage>;

      if (!parsedMessage.userId || !('data' in parsedMessage)) {
        return null;
      }

      return {
        userId: parsedMessage.userId,
        event: parsedMessage.event,
        data: this.toMessageData(parsedMessage.data),
        id: parsedMessage.id,
      };
    } catch {
      return null;
    }
  }

  private toMessageData(data: unknown): string | object {
    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      return data;
    }

    return { value: data };
  }
}
