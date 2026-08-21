import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponseModel } from 'libs/common/response';
import { ChatMessagingClient } from '../../clients/chat/chat-messaging.client';
import { TokenPayload } from '../../clients/identity/identity-auth.client';
import { ERoleName } from '../../enums';
import { Roles } from '../../guards/roles.decorator';
import {
  CreateMessageDto,
  CreateRoomDto,
  GetRoomsQueryDto,
  QueryMessagesDto,
  UpdateMessageDto,
} from './dtos/messaging.dto';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

const MESSAGING_USER_ROLES = [
  ERoleName.ADMIN,
  ERoleName.GENERAL_MANAGER,
  ERoleName.MANAGER,
  ERoleName.MD,
  ERoleName.CS_MANAGER,
  ERoleName.USER,
];

@ApiTags('Messaging')
@ApiBearerAuth()
@Controller('messaging')
export class MessagingController {
  constructor(private readonly chatMessagingClient: ChatMessagingClient) {}

  @Post('rooms')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Create a chat room' })
  async createRoom(
    @Body() createRoomDto: CreateRoomDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.chatMessagingClient.createRoom(
      this.getCurrentUserId(request),
      createRoomDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('users/:userId/rooms')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Get chat rooms by user ID' })
  @ApiParam({ name: 'userId', type: String })
  async getRoomsByUserId(
    @Param('userId') userId: string,
    @Query() query: GetRoomsQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!this.canViewUserRooms(request.user, userId)) {
      throw new ForbiddenException('Cannot view other users chat rooms');
    }

    const result = await this.chatMessagingClient.listUserRooms(
      userId,
      query,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Post('messages')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Create a message in a room' })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.chatMessagingClient.createMessage(
      this.getCurrentUserId(request),
      createMessageDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('rooms/:roomId/messages')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Get messages in a room' })
  @ApiParam({ name: 'roomId', format: 'uuid' })
  async listRoomMessages(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Query() query: QueryMessagesDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.chatMessagingClient.listRoomMessages(
      roomId,
      this.getCurrentUserId(request),
      query,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('messages/:messageId')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Get a message by ID' })
  @ApiParam({ name: 'messageId', format: 'uuid' })
  async getMessageById(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.chatMessagingClient.getMessageById(
      messageId,
      this.getCurrentUserId(request),
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Patch('messages/:messageId')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Update a message' })
  @ApiParam({ name: 'messageId', format: 'uuid' })
  async updateMessage(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.chatMessagingClient.updateMessage(
      messageId,
      this.getCurrentUserId(request),
      updateMessageDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Patch('messages/:messageId/read')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiParam({ name: 'messageId', format: 'uuid' })
  async markMessageRead(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.chatMessagingClient.markMessageRead(
      messageId,
      this.getCurrentUserId(request),
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Delete('messages/:messageId')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'messageId', format: 'uuid' })
  async deleteMessage(
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.chatMessagingClient.deleteMessage(
      messageId,
      this.getCurrentUserId(request),
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  private getCurrentUserId(request: AuthenticatedRequest): string {
    if (!request.user?.sub) {
      throw new UnauthorizedException('Authenticated user id is required');
    }

    return request.user.sub;
  }

  private canViewUserRooms(
    user: TokenPayload | undefined,
    userId: string,
  ): boolean {
    if (!user) {
      return false;
    }

    return (
      user.sub === userId ||
      user.roles.some((role) =>
        [
          ERoleName.ADMIN,
          ERoleName.GENERAL_MANAGER,
          ERoleName.CS_MANAGER,
        ].includes(role as ERoleName),
      )
    );
  }

  private toResponseModel(data: unknown): ResponseModel {
    const responseModel = new ResponseModel();
    responseModel.setData(data);

    return responseModel;
  }
}
