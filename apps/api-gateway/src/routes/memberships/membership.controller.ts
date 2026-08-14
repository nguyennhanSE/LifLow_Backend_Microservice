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
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseModel } from 'libs/common/response';

import { LoyaltyMembershipClient } from '../../clients/loyalty/loyalty-membership.client';
import { ERoleName } from '../../enums';
import { Roles } from '../../guards/roles.decorator';
import {
  AssignMembershipDto,
  BulkUpdateMembershipDto,
  CreateMembershipDto,
  QueryMembershipDto,
  QueryUserMembershipsDto,
  UpdateMembershipDto,
  UpdateUserMembershipDto,
} from './dtos/membership.dto';

@ApiTags('Membership Management')
@ApiBearerAuth()
@Controller('memberships')
export class MembershipController {
  constructor(
    private readonly loyaltyMembershipClient: LoyaltyMembershipClient,
  ) {}

  @Post()
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Create a new membership tier' })
  @ApiResponse({ status: 201, description: 'Membership created successfully' })
  async create(
    @Body() createMembershipDto: CreateMembershipDto,
    @Req() request: Request,
  ) {
    const result = await this.loyaltyMembershipClient.createMembership(
      createMembershipDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get()
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
  )
  @ApiOperation({ summary: 'Get paginated list of memberships' })
  @ApiResponse({ status: 200, description: 'Memberships retrieved successfully' })
  async findAll(@Query() query: QueryMembershipDto, @Req() request: Request) {
    const result = await this.loyaltyMembershipClient.listMemberships(
      query,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Post('assign')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER, ERoleName.MANAGER)
  @ApiOperation({ summary: 'Assign membership to a user' })
  @ApiResponse({ status: 201, description: 'Membership assigned successfully' })
  async assignMembership(
    @Body() assignDto: AssignMembershipDto,
    @Req() request: Request,
  ) {
    const result = await this.loyaltyMembershipClient.assignMembershipToUser(
      assignDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Post('recalculate-all')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Manually trigger membership recalculation for all users' })
  @ApiResponse({ status: 200, description: 'Recalculation job enqueued' })
  async recalculateAllMemberships(@Req() request: Request) {
    const result =
      await this.loyaltyMembershipClient.recalculateAllMemberships(
        request.metadata,
      );

    return this.toResponseModel(result);
  }

  @Post('bulk-update')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER, ERoleName.MANAGER)
  @ApiOperation({ summary: 'Bulk update memberships' })
  @ApiResponse({ status: 200, description: 'Bulk update completed' })
  async bulkUpdateMemberships(
    @Body() bulkUpdateDto: BulkUpdateMembershipDto,
    @Req() request: Request,
  ) {
    const result = await this.loyaltyMembershipClient.bulkUpdateMemberships(
      bulkUpdateDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('user/:userId')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
  )
  @ApiOperation({ summary: 'Get all memberships for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User memberships retrieved successfully' })
  async getUserMemberships(
    @Param('userId') userId: string,
    @Query() query: QueryUserMembershipsDto,
    @Req() request: Request,
  ) {
    const result = await this.loyaltyMembershipClient.getUserMemberships(
      userId,
      query,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get('user/:userId/active')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
    ERoleName.USER,
  )
  @ApiOperation({ summary: 'Get active membership for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Active membership retrieved successfully' })
  async getUserActiveMembership(
    @Param('userId') userId: string,
    @Req() request: Request,
  ) {
    const result =
      await this.loyaltyMembershipClient.getUserActiveMembership(
        userId,
        request.metadata,
      );

    return this.toResponseModel(result);
  }

  @Patch('user/:userId')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER, ERoleName.MANAGER)
  @ApiOperation({ summary: 'Update user membership' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User membership updated successfully' })
  async updateUserMembership(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserMembershipDto,
    @Req() request: Request,
  ) {
    const result = await this.loyaltyMembershipClient.updateUserMembership(
      userId,
      updateDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Delete('user/:userId/membership/:membershipId')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Remove membership from user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'membershipId', description: 'Membership ID' })
  @ApiResponse({ status: 200, description: 'Membership removed successfully' })
  async removeUserMembership(
    @Param('userId') userId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @Req() request: Request,
  ) {
    const result = await this.loyaltyMembershipClient.removeUserMembership(
      userId,
      membershipId,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get(':membershipId/users')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
  )
  @ApiOperation({ summary: 'Get all users with a specific membership' })
  @ApiParam({ name: 'membershipId', description: 'Membership ID' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getMembershipUsers(
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @Query() query: QueryUserMembershipsDto,
    @Req() request: Request,
  ) {
    const result = await this.loyaltyMembershipClient.getMembershipUsers(
      membershipId,
      query,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Get(':id')
  @Roles(
    ERoleName.ADMIN,
    ERoleName.GENERAL_MANAGER,
    ERoleName.MANAGER,
    ERoleName.MD,
    ERoleName.CS_MANAGER,
  )
  @ApiOperation({ summary: 'Get membership by ID' })
  @ApiParam({ name: 'id', description: 'Membership ID' })
  @ApiResponse({ status: 200, description: 'Membership retrieved successfully' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    const result = await this.loyaltyMembershipClient.getMembershipById(
      id,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Patch(':id')
  @Roles(ERoleName.ADMIN, ERoleName.GENERAL_MANAGER)
  @ApiOperation({ summary: 'Update membership' })
  @ApiParam({ name: 'id', description: 'Membership ID' })
  @ApiResponse({ status: 200, description: 'Membership updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMembershipDto: UpdateMembershipDto,
    @Req() request: Request,
  ) {
    const result = await this.loyaltyMembershipClient.updateMembership(
      id,
      updateMembershipDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Delete(':id')
  @Roles(ERoleName.ADMIN)
  @ApiOperation({ summary: 'Delete membership' })
  @ApiParam({ name: 'id', description: 'Membership ID' })
  @ApiResponse({ status: 200, description: 'Membership deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: Request) {
    const result = await this.loyaltyMembershipClient.deleteMembership(
      id,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  private toResponseModel(data: unknown): ResponseModel {
    const responseModel = new ResponseModel();
    responseModel.setData(data);

    return responseModel;
  }
}
