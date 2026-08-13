import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IPaginateNoCount } from 'libs/common/pagination/pagination.model';
import type { IdentityRequestPayload } from '../common';
import {
  AssignRoleToUsersPayload,
  CreateRoleDto,
  DeleteRolePayload,
  GetUsersByRolePayload,
  RevokeRoleFromUserPayload,
  RoleIdPayload,
  RoleQueryDto,
  UpdateRolePayload,
} from './dtos/role.dto';
import { IDENTITY_ROLE_PATTERNS } from './patterns/role.pattern';
import { RolesService } from './roles.service';

@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @MessagePattern(IDENTITY_ROLE_PATTERNS.createRole)
  createRole(@Payload() payload: IdentityRequestPayload<CreateRoleDto>) {
    return this.rolesService.create(payload.data);
  }

  @MessagePattern(IDENTITY_ROLE_PATTERNS.listRoles)
  listRoles(
    @Payload() payload: IdentityRequestPayload<RoleQueryDto>,
  ): Promise<IPaginateNoCount<unknown>> {
    return this.rolesService.findAll(payload.data);
  }

  @MessagePattern(IDENTITY_ROLE_PATTERNS.searchRoles)
  searchRoles(
    @Payload() payload: IdentityRequestPayload<RoleQueryDto>,
  ): Promise<IPaginateNoCount<unknown>> {
    return this.rolesService.findAll(payload.data);
  }

  @MessagePattern(IDENTITY_ROLE_PATTERNS.getRoleById)
  getRoleById(@Payload() payload: IdentityRequestPayload<RoleIdPayload>) {
    return this.rolesService.findOne(payload.data.id);
  }

  @MessagePattern(IDENTITY_ROLE_PATTERNS.updateRole)
  updateRole(@Payload() payload: IdentityRequestPayload<UpdateRolePayload>) {
    return this.rolesService.update(
      payload.data.id,
      payload.data.updateRoleDto,
    );
  }

  @MessagePattern(IDENTITY_ROLE_PATTERNS.deleteRole)
  deleteRole(@Payload() payload: IdentityRequestPayload<DeleteRolePayload>) {
    return this.rolesService.remove(payload.data.id, payload.data.force);
  }

  @MessagePattern(IDENTITY_ROLE_PATTERNS.assignRoleToUsers)
  assignRoleToUsers(
    @Payload() payload: IdentityRequestPayload<AssignRoleToUsersPayload>,
  ) {
    return this.rolesService.assignRoleToUsers(
      payload.data.id,
      payload.data.assignDto,
    );
  }

  @MessagePattern(IDENTITY_ROLE_PATTERNS.revokeRoleFromUser)
  revokeRoleFromUser(
    @Payload() payload: IdentityRequestPayload<RevokeRoleFromUserPayload>,
  ) {
    return this.rolesService.revokeRoleFromUser(
      payload.data.roleId,
      payload.data.userId,
    );
  }

  @MessagePattern(IDENTITY_ROLE_PATTERNS.getUsersByRole)
  getUsersByRole(
    @Payload() payload: IdentityRequestPayload<GetUsersByRolePayload>,
  ): Promise<IPaginateNoCount<unknown>> {
    return this.rolesService.getUsersByRole(
      payload.data.roleId,
      payload.data.page,
      payload.data.limit,
      payload.data.search,
    );
  }
}
