import {
  Body,
  Controller,
  Delete,
  Get,
  MessageEvent,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { ResponseModel } from 'libs/common/response';
import { NotificationClientService } from '../../clients/notification/notification.client.service';
import { TokenPayload } from '../../clients/identity/identity-auth.client';
import { ERoleName } from '../../enums';
import { Roles } from '../../guards/roles.decorator';
import {
  CreateNotificationDto,
  QueryNotificationDto,
} from './dtos/notification.dto';
import { NotificationGateway } from './gateway/notification.gateway';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

const NOTIFICATION_USER_ROLES = [
  ERoleName.ADMIN,
  ERoleName.GENERAL_MANAGER,
  ERoleName.MANAGER,
  ERoleName.MD,
  ERoleName.CS_MANAGER,
  ERoleName.USER,
];

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationClient: NotificationClientService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Sse('stream')
  @Roles(...NOTIFICATION_USER_ROLES)
  @ApiOperation({ summary: 'Open notification SSE stream for current user' })
  stream(@Req() request: AuthenticatedRequest): Observable<MessageEvent> {
    return this.notificationGateway.connect(
      this.getCurrentUserId(request),
      request,
    );
  }

  //   @Post()
  //   @ApiOperation({ summary: 'Create and send notification to a user' })
  //   async create(
  //     @Body() createNotificationDto: CreateNotificationDto,
  //     @Req() request: Request,
  //   ) {
  //     const result = await this.notificationClient.createNotification(
  //       createNotificationDto,
  //       request.metadata,
  //     );

  //     return this.toResponseModel(result);
  //   }

  @Get()
  @Roles(...NOTIFICATION_USER_ROLES)
  @ApiOperation({ summary: 'Get current user notifications' })
  async listMine(
    @Query() query: QueryNotificationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.notificationClient.listMyNotifications(
      this.getCurrentUserId(request),
      query,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('unread-count')
  @Roles(...NOTIFICATION_USER_ROLES)
  @ApiOperation({ summary: 'Get current user unread notification count' })
  async getUnreadCount(@Req() request: AuthenticatedRequest) {
    const result = await this.notificationClient.getMyUnreadCount(
      this.getCurrentUserId(request),
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Patch(':notificationId/read')
  @Roles(...NOTIFICATION_USER_ROLES)
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(
    @Param('notificationId') notificationId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.notificationClient.markNotificationRead(
      this.getCurrentUserId(request),
      notificationId,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Patch('read-all')
  @Roles(...NOTIFICATION_USER_ROLES)
  @ApiOperation({ summary: 'Mark all current user notifications as read' })
  async markAllRead(@Req() request: AuthenticatedRequest) {
    const result = await this.notificationClient.markAllNotificationsRead(
      this.getCurrentUserId(request),
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Delete(':notificationId')
  @Roles(...NOTIFICATION_USER_ROLES)
  @ApiOperation({ summary: 'Delete a notification owned by current user' })
  async delete(
    @Param('notificationId') notificationId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const result = await this.notificationClient.deleteNotification(
      this.getCurrentUserId(request),
      notificationId,
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

  private toResponseModel(data: unknown): ResponseModel {
    const responseModel = new ResponseModel();
    responseModel.setData(data);

    return responseModel;
  }
}
