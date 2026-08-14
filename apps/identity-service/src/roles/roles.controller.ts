import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IPaginateNoCount } from 'libs/common/pagination/pagination.model';
import type { IdentityRequestPayload } from '../common';
import {
  CreateRoleDto,
  DeleteRolePayload,
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

}
