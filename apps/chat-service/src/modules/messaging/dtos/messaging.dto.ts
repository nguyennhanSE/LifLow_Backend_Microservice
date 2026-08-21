export interface ChatRequestMetadata {
  traceId?: string | null;
  requestId?: string | null;
  parentRequestId?: string | null;
  correlationId?: string | null;
  causationId?: string | null;
  requestPattern?: string | null;
  requestStatus?: string | null;
  serviceName?: string | null;
  serviceIp?: string | null;
  userId?: string | null;
  anonymousId?: string | null;
  sessionId?: string | null;
  actorType?: string | null;
  requestIp?: string | null;
}

export interface ChatRequestPayload<TData> {
  data: TData;
  metadata?: ChatRequestMetadata;
}

export interface CreateRoomData {
  userId: string;
}

export interface JoinRoomData {
  roomId: string;
  userId: string;
}

export interface ListUserRoomsData {
  userId: string;
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: 'lastMessageAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMessageData {
  roomId: string;
  senderId: string;
  content: string;
}

export interface ListRoomMessagesData {
  roomId: string;
  userId: string;
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
}

export interface MessageIdData {
  messageId: string;
  userId: string;
}

export interface UpdateMessageData extends MessageIdData {
  content?: string;
  isRead?: boolean;
  hasContent?: boolean;
  hasIsRead?: boolean;
}
