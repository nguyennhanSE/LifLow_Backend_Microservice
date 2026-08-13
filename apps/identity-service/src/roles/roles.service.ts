import { Injectable } from '@nestjs/common';
import { RoleRepository } from './repositories/role.repository';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) {}

  getUserRoles(userId: string): Promise<string[]> {
    return this.roleRepository.findRoleNamesByUserId(userId);
  }
}
