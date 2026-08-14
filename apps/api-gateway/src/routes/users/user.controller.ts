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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponseModel } from 'libs/common/response';

import { TokenPayload } from '../../clients/identity/identity-auth.client';
import { IdentityUserClient } from '../../clients/identity/identity-user.client';
import { ERoleName } from '../../enums';
import { Public } from '../../guards/public.decorator';
import { Roles } from '../../guards/roles.decorator';
import {
  AssignRolesToUserDto,
  CreateUserDto,
  FindPasswordDto,
  FindUserIdDto,
  GetAdminListQueryDto,
  GetUserInfoDto,
  GetUsersQueryDto,
  UpdateAvatarUrlDto,
  UpdatePasswordWithOldDto,
  UpdateUserDto,
  UpdateUserPermissionsDto,
  UpdateUserProfileDto,
} from './dtos/user.dto';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

@ApiTags('User Management')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(
    private readonly identityUserClient: IdentityUserClient,
  ) {}

  @Post('create')
  @Public()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto, @Req() request: Request) {
    const result = await this.identityUserClient.createUser(
      createUserDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Patch('me/avatar')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
    ERoleName.USER,
  )
  @ApiOperation({ summary: 'Update current user avatar URL' })
  async updateMyAvatar(
    @Req() request: AuthenticatedRequest,
    @Body() updateAvatarDto: UpdateAvatarUrlDto,
  ) {
    const userId = this.getCurrentUserId(request);
    const result = await this.identityUserClient.updateMyAvatar(
      userId,
      updateAvatarDto.avatarUrl,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Patch('me')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
    ERoleName.USER,
  )
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMyProfile(
    @Req() request: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ) {
    const userId = this.getCurrentUserId(request);
    const result = await this.identityUserClient.updateMyProfile(
      userId,
      updateProfileDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('me/points')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
    ERoleName.USER,
  )
  @ApiOperation({ summary: 'Get current user points' })
  async getMyPoints(@Req() request: AuthenticatedRequest) {
    const result = await this.identityUserClient.getMyPoints(
      this.getCurrentUserId(request),
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('me')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
    ERoleName.USER,
  )
  @ApiOperation({ summary: 'Get current user information' })
  async getMyInfo(
    @Req() request: AuthenticatedRequest,
    @Query() query: GetUserInfoDto,
  ) {
    const result = await this.identityUserClient.getMyInfo(
      this.getCurrentUserId(request),
      query,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Post('me/update-password')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
    ERoleName.USER,
  )
  @ApiOperation({ summary: 'Update current user password' })
  async updateMyPassword(
    @Req() request: AuthenticatedRequest,
    @Body() updatePasswordDto: UpdatePasswordWithOldDto,
  ) {
    const result = await this.identityUserClient.updateMyPassword(
      this.getCurrentUserId(request),
      updatePasswordDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('list')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
  )
  @ApiOperation({ summary: 'Get paginated list of users' })
  async list(@Query() query: GetUsersQueryDto, @Req() request: Request) {
    const result = await this.identityUserClient.listUsers(
      this.normalizeListQuery(query),
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('admin-list')
  @Roles(ERoleName.ADMIN)
  @ApiOperation({ summary: 'Get paginated list of admin users' })
  async getAdminList(
    @Query() query: GetAdminListQueryDto,
    @Req() request: Request,
  ) {
    const result = await this.identityUserClient.getAdminList(
      this.normalizeListQuery(query),
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('stats/new-signup/today')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
  )
  @ApiOperation({ summary: 'Get new sign-up count today' })
  async getNewSignupToday(@Req() request: Request) {
    const result = await this.identityUserClient.getNewSignupToday(
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('check-id')
  @Public()
  @ApiOperation({ summary: 'Check if user ID exists' })
  async checkUserId(@Query('id') id: string, @Req() request: Request) {
    const result = await this.identityUserClient.checkUserId(
      id,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('find-id')
  @Public()
  @ApiOperation({ summary: 'Find user ID by name and email' })
  async findUserId(
    @Query() findUserIdDto: FindUserIdDto,
    @Req() request: Request,
  ) {
    const result = await this.identityUserClient.findUserId(
      findUserIdDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('find-password')
  @Public()
  @ApiOperation({ summary: 'Reset password by ID, name and email' })
  async findPassword(
    @Query() findPasswordDto: FindPasswordDto,
    @Req() request: Request,
  ) {
    const result = await this.identityUserClient.findPassword(
      findPasswordDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('member/:id')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER, ERoleName.MANAGER)
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string, @Req() request: Request) {
    const result = await this.identityUserClient.getUserById(
      id,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('by-role/:roleId')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get users by role' })
  async getUsersByRole(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Req() request: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.identityUserClient.getUsersByRole(
      roleId,
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search,
      },
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get(':userId/permissions')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get user permissions' })
  async getUserPermissions(
    @Param('userId') userId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertSelfOrAdmin(request, userId, 'Cannot view other users permissions');
    const result = await this.identityUserClient.getUserPermissions(
      userId,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Patch(':userId/permissions')
  @Roles(ERoleName.ADMIN)
  @ApiOperation({ summary: 'Update user permissions' })
  async updateUserPermissions(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserPermissionsDto,
    @Req() request: Request,
  ) {
    const result = await this.identityUserClient.updateUserPermissions(
      userId,
      updateDto.permissions,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get(':userId/roles')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get user roles' })
  async getUserRoles(
    @Param('userId') userId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertSelfOrAdmin(request, userId, 'Cannot view other users roles');
    const result = await this.identityUserClient.getUserRoles(
      userId,
      request.metadata,
    );

    return this.toResponseModel({ userId, roles: result });
  }

  @Post(':userId/roles')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Assign roles to user' })
  async assignRolesToUser(
    @Param('userId') userId: string,
    @Body() assignDto: AssignRolesToUserDto,
    @Req() request: Request,
  ) {
    const result = await this.identityUserClient.assignRolesToUser(
      userId,
      assignDto.roleIds,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Delete(':userId/roles/:roleId')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Remove role from user' })
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Req() request: Request,
  ) {
    const result = await this.identityUserClient.removeRoleFromUser(
      userId,
      roleId,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Patch(':id')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER, ERoleName.MANAGER)
  @ApiOperation({ summary: 'Update user information' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    const result = await this.identityUserClient.updateUser(
      id,
      updateUserDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Delete(':id')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string, @Req() request: Request) {
    const result = await this.identityUserClient.deleteUser(
      id,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  private toResponseModel(data: unknown): ResponseModel {
    const responseModel = new ResponseModel();
    responseModel.setData(this.sanitizeResponse(data));

    return responseModel;
  }

  private sanitizeResponse(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeResponse(item));
    }

    if (!data || typeof data !== 'object') {
      return data;
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'password') {
        continue;
      }

      result[key] = this.sanitizeResponse(value);
    }

    return result;
  }

  private getCurrentUserId(request: AuthenticatedRequest): string {
    const userId = request.user?.sub;
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    return userId;
  }

  private assertSelfOrAdmin(
    request: AuthenticatedRequest,
    userId: string,
    message: string,
  ) {
    const currentUser = request.user;
    if (currentUser?.sub === userId || currentUser?.roles?.includes(ERoleName.ADMIN)) {
      return;
    }

    throw new ForbiddenException(message);
  }

  private normalizeListQuery<TQuery extends GetUsersQueryDto>(
    query: TQuery,
  ): TQuery {
    return {
      ...query,
      page: query.page ? String(Number(query.page)) : query.page,
      limit: query.limit ? String(Number(query.limit)) : query.limit,
      counted: query.counted ?? true,
    };
  }
}
