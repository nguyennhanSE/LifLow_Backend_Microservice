import { Injectable } from '@nestjs/common';
import {
  CreateMessageData,
  CreateRoomData,
  JoinRoomData,
  ListRoomMessagesData,
  ListUserRoomsData,
  MessageIdData,
  UpdateMessageData,
} from './dtos/messaging.dto';
import { toMessageResponse, toRoomResponse } from './mapping/messaging.mapping';
import { MessagingQueueService } from './queue/messaging-queue.service';
import { MessagingRepository } from './repositories/messaging.repository';

@Injectable()
export class MessagingService {
  constructor(
    private readonly messagingRepository: MessagingRepository,
    private readonly messagingQueueService: MessagingQueueService,
  ) {}

  async createRoom(data: CreateRoomData) {
    const room = await this.messagingRepository.createRoom(data.userId);
    return toRoomResponse(room);
  }

  async joinRoom(data: JoinRoomData) {
    const room = await this.messagingRepository.joinRoom(
      data.roomId,
      data.userId,
    );

    return toRoomResponse(room);
  }

  async listUserRooms(data: ListUserRoomsData) {
    const result = await this.messagingRepository.listUserRooms(data);

    return {
      rooms: result.rooms.map(toRoomResponse),
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  async createMessage(data: CreateMessageData) {
    const message = await this.messagingRepository.createMessage(data);
    await this.messagingQueueService.enqueueMessageCreated({
      messageId: message.id,
      roomId: message.roomId,
      senderId: message.senderId ?? '',
    });

    return toMessageResponse(message);
  }

  async listRoomMessages(data: ListRoomMessagesData) {
    const result = await this.messagingRepository.listRoomMessages(data);

    return {
      messages: result.messages.map(toMessageResponse),
      page: result.page,
      limit: result.limit,
      total: result.total,
    };
  }

  async getMessageById(data: MessageIdData) {
    const message = await this.messagingRepository.getMessageById(
      data.messageId,
      data.userId,
    );

    return toMessageResponse(message);
  }

  async updateMessage(data: UpdateMessageData) {
    const message = await this.messagingRepository.updateMessage(data);
    return toMessageResponse(message);
  }

  async markMessageRead(data: MessageIdData) {
    const message = await this.messagingRepository.markMessageRead(
      data.messageId,
      data.userId,
    );

    return toMessageResponse(message);
  }

  deleteMessage(data: MessageIdData) {
    return this.messagingRepository.deleteMessage(data.messageId, data.userId);
  }
}
