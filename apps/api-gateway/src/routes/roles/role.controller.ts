import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { IPaginateNoCount } from 'libs/common/pagination/pagination.model';
import { ResponseModel } from 'libs/common/response';

import { IdentityRoleClient } from '../../clients/identity/identity-role.client';
import { ERoleName } from '../../enums';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../guards/roles.decorator';
import {
  AssignRolesToUserDto,
  CreateRoleDto,
  RoleQueryDto,
  UpdateRoleDto,
} from './dtos/role.dto';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(RoleGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly identityRoleClient: IdentityRoleClient) {}

  @Post()
  @Roles(ERoleName.ADMIN)
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    const result = await this.identityRoleClient.createRole(createRoleDto);

    return this.toResponseModel(result);
  }

  @Get()
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get all roles with pagination and search' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async findAll(@Query() query: RoleQueryDto) {
    const result = await this.identityRoleClient.listRoles(query);

    return this.toPaginateNoCountResponseModel(
      result as IPaginateNoCount<unknown>,
    );
  }

  @Get('search')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Search roles' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(@Query() query: RoleQueryDto) {
    const result = await this.identityRoleClient.searchRoles(query);

    return this.toPaginateNoCountResponseModel(
      result as IPaginateNoCount<unknown>,
    );
  }

  @Get(':id')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.identityRoleClient.getRoleById(id);

    return this.toResponseModel(result);
  }

  @Patch(':id')
  @Roles(ERoleName.ADMIN)
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const result = await this.identityRoleClient.updateRole(id, updateRoleDto);

    return this.toResponseModel(result);
  }

  @Delete(':id')
  @Roles(ERoleName.ADMIN)
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('force') force?: string,
  ) {
    const result = await this.identityRoleClient.deleteRole(
      id,
      force === 'true',
    );

    return this.toResponseModel(result);
  }

  @Post(':id/users')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Assign role to multiple users' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  async assignRoleToUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignDto: AssignRolesToUserDto,
  ) {
    const result = await this.identityRoleClient.assignRoleToUsers(
      id,
      assignDto,
    );

    return this.toResponseModel(result);
  }

  @Delete(':roleId/users/:userId')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Revoke role from user' })
  @ApiResponse({ status: 200, description: 'Role revoked successfully' })
  async revokeRoleFromUser(
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Param('userId') userId: string,
  ) {
    const result = await this.identityRoleClient.revokeRoleFromUser(
      roleId,
      userId,
    );

    return this.toResponseModel(result);
  }

  @Get(':id/users')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get all users with specific role' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsersByRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const result = await this.identityRoleClient.getUsersByRole({
      roleId: id,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
    });

    return this.toPaginateNoCountResponseModel(
      result as IPaginateNoCount<unknown>,
    );
  }

  private toResponseModel(data: unknown): ResponseModel {
    const responseModel = new ResponseModel();
    responseModel.setData(data);

    return responseModel;
  }

  private toPaginateNoCountResponseModel<T>(
    data: IPaginateNoCount<T>,
  ): ResponseModel {
    const responseModel = new ResponseModel();
    responseModel.setData(data);

    return responseModel;
  }
}
