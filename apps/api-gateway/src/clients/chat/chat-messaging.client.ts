import { Injectable } from '@nestjs/common';
import {
  CreateMessageDto,
  CreateRoomDto,
  GetRoomsQueryDto,
  QueryMessagesDto,
  UpdateMessageDto,
} from '../../routes/messaging/dtos/messaging.dto';
import { ChatRequestMetadata } from '../../metadata/client.metadata';
import { ChatClientService } from './chat.client.service';
import { CHAT_MESSAGE_PATTERNS, CHAT_ROOM_PATTERNS } from './chat.pattern';

interface CreateRoomPayload {
  userId: string;
  createRoomDto: CreateRoomDto;
}

interface UserRoomsPayload {
  userId: string;
  query: GetRoomsQueryDto;
}

interface CreateMessagePayload {
  senderId: string;
  createMessageDto: CreateMessageDto;
}

interface RoomMessagesPayload {
  roomId: string;
  userId: string;
  query: QueryMessagesDto;
}

interface MessageIdPayload {
  messageId: string;
  userId: string;
}

interface UpdateMessagePayload extends MessageIdPayload {
  updateMessageDto: UpdateMessageDto;
}

@Injectable()
export class ChatMessagingClient {
  constructor(private readonly chatClientService: ChatClientService) {}

  createRoom(
    userId: string,
    createRoomDto: CreateRoomDto,
    metadata?: ChatRequestMetadata,
  ) {
    return this.chatClientService.send<CreateRoomPayload>(
      CHAT_ROOM_PATTERNS.createRoom,
      { data: { userId, createRoomDto }, metadata },
    );
  }

  listUserRooms(
    userId: string,
    query: GetRoomsQueryDto,
    metadata?: ChatRequestMetadata,
  ) {
    return this.chatClientService.send<UserRoomsPayload>(
      CHAT_ROOM_PATTERNS.listUserRooms,
      { data: { userId, query }, metadata },
    );
  }

  createMessage(
    senderId: string,
    createMessageDto: CreateMessageDto,
    metadata?: ChatRequestMetadata,
  ) {
    return this.chatClientService.send<CreateMessagePayload>(
      CHAT_MESSAGE_PATTERNS.createMessage,
      { data: { senderId, createMessageDto }, metadata },
    );
  }

  listRoomMessages(
    roomId: string,
    userId: string,
    query: QueryMessagesDto,
    metadata?: ChatRequestMetadata,
  ) {
    return this.chatClientService.send<RoomMessagesPayload>(
      CHAT_MESSAGE_PATTERNS.listRoomMessages,
      { data: { roomId, userId, query }, metadata },
    );
  }

  getMessageById(
    messageId: string,
    userId: string,
    metadata?: ChatRequestMetadata,
  ) {
    return this.chatClientService.send<MessageIdPayload>(
      CHAT_MESSAGE_PATTERNS.getMessageById,
      { data: { messageId, userId }, metadata },
    );
  }

  updateMessage(
    messageId: string,
    userId: string,
    updateMessageDto: UpdateMessageDto,
    metadata?: ChatRequestMetadata,
  ) {
    return this.chatClientService.send<UpdateMessagePayload>(
      CHAT_MESSAGE_PATTERNS.updateMessage,
      { data: { messageId, userId, updateMessageDto }, metadata },
    );
  }

  markMessageRead(
    messageId: string,
    userId: string,
    metadata?: ChatRequestMetadata,
  ) {
    return this.chatClientService.send<MessageIdPayload>(
      CHAT_MESSAGE_PATTERNS.markMessageRead,
      { data: { messageId, userId }, metadata },
    );
  }

  deleteMessage(
    messageId: string,
    userId: string,
    metadata?: ChatRequestMetadata,
  ) {
    return this.chatClientService.send<MessageIdPayload>(
      CHAT_MESSAGE_PATTERNS.deleteMessage,
      { data: { messageId, userId }, metadata },
    );
  }
}
