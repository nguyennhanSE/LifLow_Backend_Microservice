import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import type { Request } from 'express';
import { Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  GeneralNotificationMessage,
  MessagingService,
} from '../../../libs/messaging/messaging.service';

type NotificationConnection = Subject<MessageEvent>;

@Injectable()
export class NotificationGateway
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly connections = new Map<string, Set<NotificationConnection>>();
  private unsubscribeGeneralNotifications?: () => void;
  private readonly generalNotificationHandler = (
    message: GeneralNotificationMessage,
  ) => {
    this.sendToUser(
      message.userId,
      message.data,
      message.event ?? 'notification',
      message.id,
    );
  };

  constructor(private readonly messagingService: MessagingService) {}

  onModuleInit() {
    this.unsubscribeGeneralNotifications =
      this.messagingService.onGeneralNotification(
        this.generalNotificationHandler,
      );
  }

  onApplicationShutdown() {
    this.unsubscribeGeneralNotifications?.();
    this.unsubscribeGeneralNotifications = undefined;
  }

  connect(userId: string, request: Request): Observable<MessageEvent> {
    const connection = new Subject<MessageEvent>();
    const userConnections = this.connections.get(userId) ?? new Set();

    userConnections.add(connection);
    this.connections.set(userId, userConnections);

    connection.next({
      type: 'connected',
      data: {
        userId,
        connected: true,
      },
    });

    const cleanup = () => this.disconnect(userId, connection);
    request.on('close', cleanup);

    return connection.asObservable().pipe(
      finalize(() => {
        request.off('close', cleanup);
        cleanup();
      }),
    );
  }

  sendToUser(
    userId: string,
    data: string | object,
    event = 'notification',
    id?: string,
  ): number {
    const userConnections = this.connections.get(userId);

    if (!userConnections) {
      return 0;
    }

    for (const connection of userConnections) {
      connection.next({
        id,
        type: event,
        data,
      });
    }

    return userConnections.size;
  }

  getConnectionCount(userId?: string): number {
    if (userId) {
      return this.connections.get(userId)?.size ?? 0;
    }

    let count = 0;
    for (const userConnections of this.connections.values()) {
      count += userConnections.size;
    }

    return count;
  }

  private disconnect(userId: string, connection: NotificationConnection) {
    const userConnections = this.connections.get(userId);

    if (!userConnections) {
      return;
    }

    userConnections.delete(connection);
    connection.complete();

    if (userConnections.size === 0) {
      this.connections.delete(userId);
    }
  }
}
