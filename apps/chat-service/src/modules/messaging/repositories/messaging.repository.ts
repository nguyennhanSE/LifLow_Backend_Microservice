import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from 'libs/prisma/generated/chat-service/client';
import { PrismaService } from '../../../prisma/prisma.service';
import type {
  CreateMessageData,
  ListRoomMessagesData,
  ListUserRoomsData,
  UpdateMessageData,
} from '../dtos/messaging.dto';

@Injectable()
export class MessagingRepository {
  constructor(private readonly prisma: PrismaService) {}

  createRoom(userId: string) {
    return this.prisma.room.create({
      data: {
        user1Id: userId,
      },
    });
  }

  async joinRoom(roomId: string, userId: string) {
    const room = await this.findRoomOrThrow(roomId);

    if (this.isUserInRoom(room, userId)) {
      return room;
    }

    if (room.user2Id) {
      throw new ConflictException('Room is already full');
    }

    return this.prisma.room.update({
      where: { id: roomId },
      data: { user2Id: userId },
    });
  }

  async listUserRooms(query: ListUserRoomsData) {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const where: Prisma.RoomWhereInput = {
      OR: [{ user1Id: query.userId }, { user2Id: query.userId }],
    };

    if (query.q) {
      where.id = { contains: query.q, mode: 'insensitive' };
    }

    const orderBy = {
      [query.sortBy ?? 'lastMessageAt']: query.sortOrder ?? 'desc',
    } as Prisma.RoomOrderByWithRelationInput;

    const [rooms, total] = await this.prisma.$transaction([
      this.prisma.room.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.room.count({ where }),
    ]);

    return { rooms, page, limit, total };
  }

  async createMessage(data: CreateMessageData) {
    const room = await this.findRoomOrThrow(data.roomId);
    this.assertUserInRoom(room, data.senderId);

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          roomId: data.roomId,
          senderId: data.senderId,
          content: data.content,
        },
      });

      await tx.room.update({
        where: { id: data.roomId },
        data: { lastMessageAt: message.createdAt },
      });

      return message;
    });
  }

  async listRoomMessages(query: ListRoomMessagesData) {
    const room = await this.findRoomOrThrow(query.roomId);
    this.assertUserInRoom(room, query.userId);

    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const where: Prisma.MessageWhereInput = {
      roomId: query.roomId,
    };

    if (query.before || query.after) {
      where.createdAt = {
        ...(query.before ? { lt: new Date(query.before) } : {}),
        ...(query.after ? { gt: new Date(query.after) } : {}),
      };
    }

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.message.count({ where }),
    ]);

    return { messages, page, limit, total };
  }

  async getMessageById(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: { room: true },
    });

    if (!message) {
      throw new NotFoundException(`Message with id "${messageId}" not found`);
    }

    this.assertUserInRoom(message.room, userId);
    return message;
  }

  async updateMessage(data: UpdateMessageData) {
    await this.getMessageById(data.messageId, data.userId);

    return this.prisma.message.update({
      where: { id: data.messageId },
      data: {
        ...(data.hasContent ? { content: data.content } : {}),
        ...(data.hasIsRead ? { isRead: data.isRead } : {}),
      },
    });
  }

  async markMessageRead(messageId: string, userId: string) {
    await this.getMessageById(messageId, userId);

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    await this.getMessageById(messageId, userId);
    await this.prisma.message.delete({ where: { id: messageId } });

    return { success: true, messageId };
  }

  private async findRoomOrThrow(roomId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with id "${roomId}" not found`);
    }

    return room;
  }

  private assertUserInRoom(
    room: { user1Id: string | null; user2Id: string | null },
    userId: string,
  ) {
    if (!this.isUserInRoom(room, userId)) {
      throw new ForbiddenException('User is not a room participant');
    }
  }

  private isUserInRoom(
    room: { user1Id: string | null; user2Id: string | null },
    userId: string,
  ) {
    return room.user1Id === userId || room.user2Id === userId;
  }

  private normalizePage(page?: number) {
    return Math.max(1, page || 1);
  }

  private normalizeLimit(limit?: number) {
    return Math.min(100, Math.max(1, limit || 20));
  }
}
