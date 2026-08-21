import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { AppConfigService } from 'libs/config';
import { firstValueFrom, Observable, timeout } from 'rxjs';
import {
  CreateMessageDto,
  CreateRoomDto,
  GetRoomsQueryDto,
  QueryMessagesDto,
  UpdateMessageDto,
} from '../../routes/messaging/dtos/messaging.dto';
import { ChatRequestMetadata } from '../../metadata/client.metadata';
import { CHAT_MESSAGING_GRPC_CLIENT } from './chat.client.module';

interface ChatRequestPayload<TData> {
  data: TData;
  metadata?: ChatRequestMetadata;
}

interface CreateRoomData {
  userId: string;
}

interface JoinRoomData {
  roomId: string;
  userId: string;
}

interface ListUserRoomsData extends GetRoomsQueryDto {
  userId: string;
}

interface CreateMessageData {
  roomId: string;
  senderId: string;
  content: string;
}

interface ListRoomMessagesData extends QueryMessagesDto {
  roomId: string;
  userId: string;
}

interface MessageIdData {
  messageId: string;
  userId: string;
}

interface UpdateMessageData extends MessageIdData {
  content?: string;
  isRead?: boolean;
  hasContent: boolean;
  hasIsRead: boolean;
}

interface ChatMessagingGrpcService {
  createRoom(payload: ChatRequestPayload<CreateRoomData>): Observable<unknown>;
  joinRoom(payload: ChatRequestPayload<JoinRoomData>): Observable<unknown>;
  listUserRooms(
    payload: ChatRequestPayload<ListUserRoomsData>,
  ): Observable<unknown>;
  createMessage(
    payload: ChatRequestPayload<CreateMessageData>,
  ): Observable<unknown>;
  listRoomMessages(
    payload: ChatRequestPayload<ListRoomMessagesData>,
  ): Observable<unknown>;
  getMessageById(
    payload: ChatRequestPayload<MessageIdData>,
  ): Observable<unknown>;
  updateMessage(
    payload: ChatRequestPayload<UpdateMessageData>,
  ): Observable<unknown>;
  markMessageRead(
    payload: ChatRequestPayload<MessageIdData>,
  ): Observable<unknown>;
  deleteMessage(
    payload: ChatRequestPayload<MessageIdData>,
  ): Observable<unknown>;
}

@Injectable()
export class ChatMessagingClient implements OnModuleInit {
  private chatMessagingService!: ChatMessagingGrpcService;
  private readonly timeoutMs: number;

  constructor(
    @Inject(CHAT_MESSAGING_GRPC_CLIENT)
    private readonly chatMessagingGrpcClient: ClientGrpc,
    private readonly configService: AppConfigService,
  ) {
    this.timeoutMs = this.configService.get<number>(
      'apiGateway.downstreams.chat.timeoutMs',
      5000,
    );
  }

  onModuleInit() {
    this.chatMessagingService =
      this.chatMessagingGrpcClient.getService<ChatMessagingGrpcService>(
        'ChatMessagingGrpcService',
      );
  }

  createRoom(
    userId: string,
    _createRoomDto: CreateRoomDto,
    metadata?: ChatRequestMetadata,
  ) {
    return this.send(
      this.chatMessagingService.createRoom({
        data: { userId },
        metadata,
      }),
    );
  }

  joinRoom(roomId: string, userId: string, metadata?: ChatRequestMetadata) {
    return this.send(
      this.chatMessagingService.joinRoom({
        data: { roomId, userId },
        metadata,
      }),
    );
  }

  listUserRooms(
    userId: string,
    query: GetRoomsQueryDto,
    metadata?: ChatRequestMetadata,
  ) {
    return this.send(
      this.chatMessagingService.listUserRooms({
        data: { userId, ...query },
        metadata,
      }),
    );
  }

  createMessage(
    senderId: string,
    createMessageDto: CreateMessageDto,
    metadata?: ChatRequestMetadata,
  ) {
    return this.send(
      this.chatMessagingService.createMessage({
        data: {
          roomId: createMessageDto.roomId,
          senderId,
          content: createMessageDto.content,
        },
        metadata,
      }),
    );
  }

  listRoomMessages(
    roomId: string,
    userId: string,
    query: QueryMessagesDto,
    metadata?: ChatRequestMetadata,
  ) {
    return this.send(
      this.chatMessagingService.listRoomMessages({
        data: { roomId, userId, ...query },
        metadata,
      }),
    );
  }

  getMessageById(
    messageId: string,
    userId: string,
    metadata?: ChatRequestMetadata,
  ) {
    return this.send(
      this.chatMessagingService.getMessageById({
        data: { messageId, userId },
        metadata,
      }),
    );
  }

  updateMessage(
    messageId: string,
    userId: string,
    updateMessageDto: UpdateMessageDto,
    metadata?: ChatRequestMetadata,
  ) {
    return this.send(
      this.chatMessagingService.updateMessage({
        data: {
          messageId,
          userId,
          content: updateMessageDto.content,
          isRead: updateMessageDto.isRead,
          hasContent: updateMessageDto.content !== undefined,
          hasIsRead: updateMessageDto.isRead !== undefined,
        },
        metadata,
      }),
    );
  }

  markMessageRead(
    messageId: string,
    userId: string,
    metadata?: ChatRequestMetadata,
  ) {
    return this.send(
      this.chatMessagingService.markMessageRead({
        data: { messageId, userId },
        metadata,
      }),
    );
  }

  deleteMessage(
    messageId: string,
    userId: string,
    metadata?: ChatRequestMetadata,
  ) {
    return this.send(
      this.chatMessagingService.deleteMessage({
        data: { messageId, userId },
        metadata,
      }),
    );
  }

  private send(response$: Observable<unknown>) {
    return firstValueFrom(response$.pipe(timeout(this.timeoutMs)));
  }
}
