import {
  Logger,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { ChatMessagingClient } from '../../../clients/chat/chat-messaging.client';
import type { TokenPayload } from '../../../clients/identity/identity-auth.client';
import { AuthGrpcService } from '../../../grpc/auth/auth.grpc.service';
import type { ChatRequestMetadata } from '../../../metadata/client.metadata';
import {
  CreateMessageDto,
  CreateRoomDto,
  JoinRoomDto,
  QueryRoomMessagesSocketDto,
  TypingDto,
} from '../dtos/messaging.dto';

interface AuthenticatedSocketData {
  user?: TokenPayload;
  userId?: string;
}

interface RoomSocketResponse {
  id: string;
}

type MessagingSocket = Socket & { data: AuthenticatedSocketData };

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: true,
    credentials: true,
  },
})
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class MessagingWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server!: Namespace;

  private readonly logger = new Logger(MessagingWebSocketGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly chatMessagingClient: ChatMessagingClient,
    private readonly authGrpcService: AuthGrpcService,
  ) {}

  async handleConnection(client: MessagingSocket) {
    try {
      const user = await this.authenticate(client);
      const userId = user.sub;

      client.data.user = user;
      client.data.userId = userId;
      this.addUserSocket(userId, client.id);

      await client.join(this.getUserRoom(userId));
      client.emit('chat:connected', { userId, socketId: client.id });
      this.server.emit('chat:userOnline', { userId });
    } catch (error) {
      this.logger.warn(
        `Rejected chat socket ${client.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      client.emit('chat:error', { message: 'Unauthorized chat socket' });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: MessagingSocket) {
    const userId = client.data.userId;

    if (!userId) {
      return;
    }

    const hasLocalConnections = this.removeUserSocket(userId, client.id);

    if (!hasLocalConnections) {
      const stillOnline = await this.isUserOnline(userId);

      if (!stillOnline) {
        this.server.emit('chat:userOffline', { userId });
      }
    }
  }

  @SubscribeMessage('chat:createRoom')
  async createRoom(
    @ConnectedSocket() client: MessagingSocket,
    @MessageBody() createRoomDto: CreateRoomDto,
  ) {
    const userId = this.getCurrentUserId(client);
    const room = (await this.handleSocketCall(() =>
      this.chatMessagingClient.createRoom(
        userId,
        createRoomDto,
        this.createMetadata(client, 'chat:createRoom'),
      ),
    )) as RoomSocketResponse;

    await client.join(this.getChatRoom(room.id));
    client.emit('chat:roomCreated', room);

    return room;
  }

  @SubscribeMessage('chat:joinRoom')
  async joinRoom(
    @ConnectedSocket() client: MessagingSocket,
    @MessageBody() joinRoomDto: JoinRoomDto,
  ) {
    const userId = this.getCurrentUserId(client);
    const room = (await this.handleSocketCall(() =>
      this.chatMessagingClient.joinRoom(
        joinRoomDto.roomId,
        userId,
        this.createMetadata(client, 'chat:joinRoom'),
      ),
    )) as RoomSocketResponse;

    await client.join(this.getChatRoom(room.id));
    this.server.to(this.getChatRoom(room.id)).emit('chat:userJoinedRoom', {
      room,
      userId,
    });

    return room;
  }

  @SubscribeMessage('chat:sendMessage')
  async sendMessage(
    @ConnectedSocket() client: MessagingSocket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    this.assertSocketInRoom(client, createMessageDto.roomId);
    const userId = this.getCurrentUserId(client);
    const message = await this.handleSocketCall(() =>
      this.chatMessagingClient.createMessage(
        userId,
        createMessageDto,
        this.createMetadata(client, 'chat:sendMessage'),
      ),
    );

    this.server
      .to(this.getChatRoom(createMessageDto.roomId))
      .emit('chat:messageCreated', message);

    return message;
  }

  @SubscribeMessage('chat:isTyping')
  isTyping(
    @ConnectedSocket() client: MessagingSocket,
    @MessageBody() typingDto: TypingDto,
  ) {
    this.assertSocketInRoom(client, typingDto.roomId);
    const userId = this.getCurrentUserId(client);

    client.to(this.getChatRoom(typingDto.roomId)).emit('chat:userIsTyping', {
      roomId: typingDto.roomId,
      userId,
      isTyping: typingDto.isTyping,
    });

    return { roomId: typingDto.roomId, userId, isTyping: typingDto.isTyping };
  }

  @SubscribeMessage('chat:queryMessages')
  async queryMessages(
    @ConnectedSocket() client: MessagingSocket,
    @MessageBody() query: QueryRoomMessagesSocketDto,
  ) {
    this.assertSocketInRoom(client, query.roomId);
    const userId = this.getCurrentUserId(client);
    const result = await this.handleSocketCall(() =>
      this.chatMessagingClient.listRoomMessages(
        query.roomId,
        userId,
        query,
        this.createMetadata(client, 'chat:queryMessages'),
      ),
    );

    client.emit('chat:messagesQueried', result);
    return result;
  }

  private async authenticate(client: MessagingSocket): Promise<TokenPayload> {
    const token = this.extractToken(client);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    const result = await this.authGrpcService.validateToken(
      { accessToken: token },
      this.createMetadata(client, 'chat:validateToken'),
    );

    return this.unwrapTokenPayload(result);
  }

  private unwrapTokenPayload(result: unknown): TokenPayload {
    if (this.isTokenPayload(result)) {
      return result;
    }

    if (
      result &&
      typeof result === 'object' &&
      'data' in result &&
      this.isTokenPayload(result.data)
    ) {
      return result.data;
    }

    throw new UnauthorizedException('Invalid token payload');
  }

  private isTokenPayload(value: unknown): value is TokenPayload {
    return (
      !!value &&
      typeof value === 'object' &&
      'sub' in value &&
      typeof value.sub === 'string'
    );
  }

  private extractToken(client: MessagingSocket): string | undefined {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === 'string' && authToken) {
      return this.normalizeBearerToken(authToken);
    }

    const queryToken = client.handshake.query?.token;

    if (typeof queryToken === 'string' && queryToken) {
      return this.normalizeBearerToken(queryToken);
    }

    const authorization = client.handshake.headers.authorization;

    if (typeof authorization === 'string' && authorization) {
      return this.normalizeBearerToken(authorization);
    }

    return undefined;
  }

  private normalizeBearerToken(value: string) {
    const [type, token] = value.split(' ');
    return type === 'Bearer' ? token : value;
  }

  private getCurrentUserId(client: MessagingSocket): string {
    const userId = client.data.userId;

    if (!userId) {
      throw new WsException('Authenticated user id is required');
    }

    return userId;
  }

  private assertSocketInRoom(client: MessagingSocket, roomId: string) {
    if (!client.rooms.has(this.getChatRoom(roomId))) {
      throw new WsException('Socket has not joined this chat room');
    }
  }

  private async handleSocketCall<T>(handler: () => Promise<T>): Promise<T> {
    try {
      return await handler();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new WsException(message);
    }
  }

  private createMetadata(
    client: MessagingSocket,
    requestPattern: string,
  ): ChatRequestMetadata {
    return {
      requestPattern,
      userId: client.data.userId ?? null,
      sessionId: client.id,
      actorType: 'user',
      requestIp: client.handshake.address,
    };
  }

  private addUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    this.userSockets.set(userId, sockets);
  }

  private removeUserSocket(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId);

    if (!sockets) {
      return false;
    }

    sockets.delete(socketId);

    if (sockets.size === 0) {
      this.userSockets.delete(userId);
      return false;
    }

    return true;
  }

  private async isUserOnline(userId: string) {
    const socketIds = await this.server
      .in(this.getUserRoom(userId))
      .allSockets();
    return socketIds.size > 0;
  }

  private getUserRoom(userId: string) {
    return `user:${userId}`;
  }

  private getChatRoom(roomId: string) {
    return `chat:room:${roomId}`;
  }
}
