import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { ClientProxyFactory } from '@nestjs/microservices/client/client-proxy-factory';
import { Transport } from '@nestjs/microservices/enums/transport.enum';
import { AppConfigService } from 'libs/config/config.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { timeout } from 'rxjs/internal/operators/timeout';
import {
  CreateNotificationDto,
  QueryNotificationDto,
} from '../../routes/notification/dtos/notification.dto';
import { NotificationRequestMetadata } from '../metadata/client.metadata';
import { NOTIFICATION_PATTERNS } from './notification.pattern';

export interface NotificationRequestPayload<TData> {
  data: TData;
  metadata?: NotificationRequestMetadata;
}

interface UserIdPayload {
  userId: string;
}

interface NotificationIdPayload extends UserIdPayload {
  notificationId: string;
}

interface ListMyNotificationsPayload extends UserIdPayload {
  query: QueryNotificationDto;
}

@Injectable()
export class NotificationClientService implements OnModuleDestroy {
  private readonly client: ClientProxy;
  private readonly timeoutMs: number;

  constructor(private readonly configService: AppConfigService) {
    this.timeoutMs = this.configService.get<number>('rabbitmq.timeoutMs', 5000);
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: this.configService.get<string[]>('rabbitmq.urls', [
          'amqp://localhost:5672',
        ]),
        queue: this.configService.get<string>(
          'rabbitmq.queues.notification',
          'notification_queue',
        ),
        queueOptions: {
          durable: this.configService.get<boolean>(
            'rabbitmq.queueOptions.durable',
            false,
          ),
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  createNotification(
    createNotificationDto: CreateNotificationDto,
    metadata?: NotificationRequestMetadata,
  ) {
    return this.send<CreateNotificationDto>(
      NOTIFICATION_PATTERNS.createNotification,
      { data: createNotificationDto, metadata },
    );
  }

  listMyNotifications(
    userId: string,
    query: QueryNotificationDto,
    metadata?: NotificationRequestMetadata,
  ) {
    return this.send<ListMyNotificationsPayload>(
      NOTIFICATION_PATTERNS.listMyNotifications,
      { data: { userId, query }, metadata },
    );
  }

  getMyUnreadCount(userId: string, metadata?: NotificationRequestMetadata) {
    return this.send<UserIdPayload>(NOTIFICATION_PATTERNS.getMyUnreadCount, {
      data: { userId },
      metadata,
    });
  }

  markNotificationRead(
    userId: string,
    notificationId: string,
    metadata?: NotificationRequestMetadata,
  ) {
    return this.send<NotificationIdPayload>(
      NOTIFICATION_PATTERNS.markNotificationRead,
      { data: { userId, notificationId }, metadata },
    );
  }

  markAllNotificationsRead(
    userId: string,
    metadata?: NotificationRequestMetadata,
  ) {
    return this.send<UserIdPayload>(
      NOTIFICATION_PATTERNS.markAllNotificationsRead,
      { data: { userId }, metadata },
    );
  }

  deleteNotification(
    userId: string,
    notificationId: string,
    metadata?: NotificationRequestMetadata,
  ) {
    return this.send<NotificationIdPayload>(
      NOTIFICATION_PATTERNS.deleteNotification,
      { data: { userId, notificationId }, metadata },
    );
  }

  private send<TData>(
    pattern: string,
    payload: NotificationRequestPayload<TData>,
  ) {
    return firstValueFrom(
      this.client.send(pattern, payload).pipe(timeout(this.timeoutMs)),
    );
  }
}
