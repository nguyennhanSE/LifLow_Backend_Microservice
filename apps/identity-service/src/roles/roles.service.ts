import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IPaginateNoCount } from 'libs/common/pagination/pagination.model';
import type { Prisma } from 'libs/prisma/generated/identity-service/client';
import {
  CreateRoleDto,
  RoleQueryDto,
  UpdateRoleDto,
} from './dtos/role.dto';
import { ERoleName } from './enums/role.enum';
import { RoleRepository } from './repositories/role.repository';

const SYSTEM_ROLES = [ERoleName.ADMIN];

interface RoleListItem {
  id: string;
  name: string;
  description?: string | null;
  userCount: number;
  createdAt: Date;
  updatedAt?: Date | null;
}

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(createRoleDto: CreateRoleDto) {
    const name = this.normalizeRoleName(createRoleDto.name);
    const existingRole = await this.roleRepository.findByName(name);

    if (existingRole) {
      throw new ConflictException(`Role with name '${name}' already exists`);
    }

    return this.roleRepository.create({
      name,
      description: createRoleDto.description,
    });
  }

  async findAll(query: RoleQueryDto): Promise<IPaginateNoCount<RoleListItem>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RoleWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const orderBy: Prisma.RoleOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const roles = await this.roleRepository.findAll({
      skip,
      take: limit + 1,
      where,
      orderBy,
    });
    const hasNext = roles.length > limit;
    const docs = roles.slice(0, limit).map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role._count.userRole,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    return this.toPaginateNoCount(docs, page, limit, hasNext);
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne(id);

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role.userRole.length,
      users: role.userRole.map((userRole) => ({
        id: userRole.user.id,
        name: userRole.user.name,
        email: userRole.user.email,
        assignedAt: userRole.createdAt,
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOne(id);

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    if (SYSTEM_ROLES.includes(role.name.toUpperCase() as ERoleName)) {
      throw new BadRequestException(`Cannot update system role '${role.name}'`);
    }

    const updateData: Prisma.RoleUpdateInput = {};
    if (updateRoleDto.description !== undefined) {
      updateData.description = updateRoleDto.description;
    }

    if (updateRoleDto.name) {
      const name = this.normalizeRoleName(updateRoleDto.name);
      const existingRole = await this.roleRepository.findByName(name);
      if (existingRole && existingRole.id !== id) {
        throw new ConflictException(`Role with name '${name}' already exists`);
      }

      updateData.name = name;
    }

    return this.roleRepository.update(id, updateData);
  }

  async remove(id: string, force = false) {
    const role = await this.roleRepository.findOne(id);

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    if (SYSTEM_ROLES.includes(role.name.toUpperCase() as ERoleName)) {
      throw new BadRequestException(`Cannot delete system role '${role.name}'`);
    }

    const userCount = role.userRole.length;
    if (userCount > 0 && !force) {
      throw new BadRequestException(
        `Cannot delete role '${role.name}' because it has ${userCount} assigned user(s). Use force=true to unassign and delete.`,
      );
    }

    return this.roleRepository.delete(id);
  }

  private normalizeRoleName(name: string): string {
    return name.trim().toUpperCase();
  }

  private toPaginateNoCount<T>(
    docs: T[],
    currentPage: number,
    limit: number,
    hasNext: boolean,
  ): IPaginateNoCount<T> {
    const hasPrev = currentPage > 1;

    return {
      docs,
      currentPage,
      nextPage: hasNext ? currentPage + 1 : null,
      previousPage: hasPrev ? currentPage - 1 : null,
      limit,
      hasNext,
      hasPrev,
    };
  }
}
