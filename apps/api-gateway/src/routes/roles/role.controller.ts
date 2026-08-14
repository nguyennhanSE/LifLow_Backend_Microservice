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
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
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
  async create(@Body() createRoleDto: CreateRoleDto, @Req() request: Request) {
    const result = await this.identityRoleClient.createRole(
      createRoleDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get()
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get all roles with pagination and search' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async findAll(@Query() query: RoleQueryDto, @Req() request: Request) {
    const result = await this.identityRoleClient.listRoles(
      query,
      request.metadata,
    );

    return this.toPaginateNoCountResponseModel(
      result as IPaginateNoCount<unknown>,
    );
  }

  @Get('search')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Search roles' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(@Query() query: RoleQueryDto, @Req() request: Request) {
    const result = await this.identityRoleClient.searchRoles(
      query,
      request.metadata,
    );

    return this.toPaginateNoCountResponseModel(
      result as IPaginateNoCount<unknown>,
    );
  }

  @Get(':id')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    const result = await this.identityRoleClient.getRoleById(
      id,
      request.metadata,
    );

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
    @Req() request: Request,
  ) {
    const result = await this.identityRoleClient.updateRole(
      id,
      updateRoleDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Delete(':id')
  @Roles(ERoleName.ADMIN)
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
    @Query('force') force?: string,
  ) {
    const result = await this.identityRoleClient.deleteRole(
      id,
      force === 'true',
      request.metadata,
    );

    return this.toResponseModel(result);
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
