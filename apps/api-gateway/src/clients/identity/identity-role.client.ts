import { Injectable } from '@nestjs/common';
import {
  AssignRolesToUserDto,
  CreateRoleDto,
  RoleQueryDto,
  UpdateRoleDto,
} from '../../routes/roles/dtos/role.dto';
import { IdentityRequestMetadata } from '../metadata/client.metadata';
import { IDENTITY_ROLE_PATTERNS } from './identity.pattern';
import { IdentityClientService } from './identity.client.service';

interface RoleIdPayload {
  id: string;
}

interface UpdateRolePayload {
  id: string;
  updateRoleDto: UpdateRoleDto;
}

interface DeleteRolePayload {
  id: string;
  force?: boolean;
}

interface AssignRoleToUsersPayload {
  id: string;
  assignDto: AssignRolesToUserDto;
}

interface RevokeRoleFromUserPayload {
  roleId: string;
  userId: string;
}

interface GetUsersByRolePayload {
  roleId: string;
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class IdentityRoleClient {
  constructor(private readonly identityClientService: IdentityClientService) {}

  createRole(createRoleDto: CreateRoleDto, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<CreateRoleDto>(
      IDENTITY_ROLE_PATTERNS.createRole,
      { data: createRoleDto, metadata },
    );
  }

  listRoles(query: RoleQueryDto, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<RoleQueryDto>(
      IDENTITY_ROLE_PATTERNS.listRoles,
      { data: query, metadata },
    );
  }

  searchRoles(query: RoleQueryDto, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<RoleQueryDto>(
      IDENTITY_ROLE_PATTERNS.searchRoles,
      { data: query, metadata },
    );
  }

  getRoleById(id: string, metadata?: IdentityRequestMetadata) {
    return this.identityClientService.send<RoleIdPayload>(
      IDENTITY_ROLE_PATTERNS.getRoleById,
      { data: { id }, metadata },
    );
  }

  updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<UpdateRolePayload>(
      IDENTITY_ROLE_PATTERNS.updateRole,
      { data: { id, updateRoleDto }, metadata },
    );
  }

  deleteRole(
    id: string,
    force?: boolean,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<DeleteRolePayload>(
      IDENTITY_ROLE_PATTERNS.deleteRole,
      { data: { id, force }, metadata },
    );
  }

  assignRoleToUsers(
    id: string,
    assignDto: AssignRolesToUserDto,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<AssignRoleToUsersPayload>(
      IDENTITY_ROLE_PATTERNS.assignRoleToUsers,
      { data: { id, assignDto }, metadata },
    );
  }

  revokeRoleFromUser(
    roleId: string,
    userId: string,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<RevokeRoleFromUserPayload>(
      IDENTITY_ROLE_PATTERNS.revokeRoleFromUser,
      { data: { roleId, userId }, metadata },
    );
  }

  getUsersByRole(
    query: GetUsersByRolePayload,
    metadata?: IdentityRequestMetadata,
  ) {
    return this.identityClientService.send<GetUsersByRolePayload>(
      IDENTITY_ROLE_PATTERNS.getUsersByRole,
      { data: query, metadata },
    );
  }
}
