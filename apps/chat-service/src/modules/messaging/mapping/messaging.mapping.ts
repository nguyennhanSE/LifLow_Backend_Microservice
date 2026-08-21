import type { Message, Room } from 'libs/prisma/generated/chat-service/client';

export function toRoomResponse(room: Room) {
  return {
    id: room.id,
    user1Id: room.user1Id ?? '',
    user2Id: room.user2Id ?? '',
    lastMessageAt: room.lastMessageAt?.toISOString() ?? '',
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
}

export function toMessageResponse(message: Message) {
  return {
    id: message.id,
    roomId: message.roomId,
    senderId: message.senderId ?? '',
    content: message.content,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}
