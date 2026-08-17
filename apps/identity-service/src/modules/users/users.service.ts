import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { IPaginate } from 'libs/common/pagination/pagination.model';
import type { Prisma } from 'libs/prisma/generated/identity-service/client';
import { ERoleName } from '../roles/enums/role.enum';
import {
  CreateUserDto,
  FindPasswordDto,
  FindUserIdDto,
  GetAdminListQueryDto,
  GetUsersQueryDto,
  UpdatePasswordWithOldDto,
  UpdateUserDto,
  UpdateUserProfileDto,
} from './dtos/user.dto';
import { UserEntity } from './entities/user.entity';
import { toUserEntity } from './mapping/user.mapping';
import { UserRepository, UserWithRoles } from './repositories/user.repository';
import { IdentityClientService } from '../../clients/identity/identity-client.service';
import { IdentityRequestMetadata } from '../../common';

const PERMISSION_FIELDS = [
  'dashboardAccess',
  'memberAccess',
  'productAccess',
  'orderAccess',
  'recipeAccess',
  'bannerAccess',
] as const;

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository,
    private readonly identityClient: IdentityClientService
  ) {}

  async countNewSignupsToday(): Promise<{ date: string; count: number }> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const count = await this.userRepository.countUsersCreatedBetween(
      start,
      end,
    );
    const date = start.toISOString().slice(0, 10);

    return { date, count };
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByAccount(
      createUserDto.id,
    );
    if (existingUser) {
      throw new ConflictException('User with this id already exists');
    }

    const existingEmail = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.userRepository.createUser({
      id: createUserDto.id,
      password: hashedPassword,
      name: createUserDto.name,
      email: createUserDto.email,
      phoneNumber: createUserDto.phoneNumber,
      mobilePhoneNumber: createUserDto.mobilePhoneNumber,
      nickName: createUserDto.nickName,
      statusMessage: createUserDto.statusMessage,
      age: createUserDto.age,
      membershipLevel: 'LV1. 씨앗',
      registrationDate: new Date().toISOString(),
    });

    return this.mapUser(user);
  }

  async listUsers(
    query: GetUsersQueryDto,
  ): Promise<IPaginate<UserEntity>> {
    return this.getUserPaginate(query, false);
  }

  async getAdminList(
    query: GetAdminListQueryDto,
  ): Promise<IPaginate<UserEntity>> {
    return this.getUserPaginate(query, true);
  }

  async getUserByAccount(account: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findByAccount(account);

    return user ? this.mapUser(user) : null;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findByEmail(email);

    return user ? this.mapUser(user) : null;
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.mapUser(user);
  }

  async getUsersByIds(ids: string[]): Promise<UserEntity[]> {
    const users = await this.userRepository.findByIds(ids);

    return users.map((user) => this.mapUser(user));
  }

  async getUsersByEmails(emails: string[]): Promise<UserEntity[]> {
    const users = await this.userRepository.findByEmails(emails);

    return users.map((user) => this.mapUser(user));
  }

  async getUsersByAccounts(accounts: string[]): Promise<UserEntity[]> {
    const users = await this.userRepository.findByAccounts(accounts);

    return users.map((user) => this.mapUser(user));
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    await this.findOne(id);

    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findByEmail(
        updateUserDto.email,
      );
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    const { role, password, ...userData } = updateUserDto;
    const updateData: Prisma.UserUpdateInput = {
      ...userData,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
      updatedAt: new Date(),
    };

    const updatedUser = await this.userRepository.updateUser(id, updateData);

    if (role) {
      return this.mapUser(
        await this.userRepository.updateUserRoleByName(id, role),
      );
    }

    return this.mapUser(updatedUser);
  }

  async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
  ): Promise<UserEntity> {
    await this.findOne(userId);

    if (updateData.email) {
      const existingUser = await this.userRepository.findByEmail(
        updateData.email,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email is already taken by another user');
      }
    }

    const user = await this.userRepository.updateUser(userId, {
      ...updateData,
      updatedAt: new Date(),
    });

    return this.mapUser(user);
  }

  async updateAvatarUrl(
    userId: string,
    avatarURL: string,
  ): Promise<UserEntity> {
    await this.findOne(userId);

    if (!avatarURL?.trim()) {
      throw new BadRequestException('Avatar URL is required');
    }

    const user = await this.userRepository.updateUser(userId, {
      avatarURL: avatarURL.trim(),
      updatedAt: new Date(),
    });

    return this.mapUser(user);
  }

  async remove(id: string, metadata?: IdentityRequestMetadata): Promise<{ message: string }> {
    await this.findOne(id);
    await this.userRepository.deleteUser(id);
    await this.identityClient.emit('user.deleted', { data: {userId : id}, metadata });

    return { message: `User ${id} deleted successfully` };
  }

  async getUserPoints(userId: string) {
    const user = await this.findOne(userId);

    return {
      userId: user.id,
      totalUsedPoints: user.totalUsedPoints ?? 0,
      availablePoints: user.availablePoints ?? 0,
      totalPurchaseAmount: user.totalPurchaseAmount ?? 0,
    };
  }

  findUserInfo(userId: string): Promise<UserEntity> {
    return this.findOne(userId);
  }

  async getUserRoles(userId: string): Promise<string[]> {
    await this.findOne(userId);
    const userRoles = await this.userRepository.getUserRoles(userId);

    return userRoles.map((userRole) => userRole.role.name);
  }

  async assignRolesToUser(userId: string, roleIds: string[]) {
    const user = await this.findOne(userId);
    const roles = await this.userRepository.findRolesByIds(roleIds);
    if (roles.length !== roleIds.length) {
      const foundIds = roles.map((role) => role.id);
      const missingIds = roleIds.filter((roleId) => !foundIds.includes(roleId));

      throw new NotFoundException(`Roles not found: ${missingIds.join(', ')}`);
    }

    const result = await this.userRepository.assignRolesToUser(userId, roleIds);

    return {
      userId,
      userName: user.name,
      assignedRoles: result.count,
      roles,
    };
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    await this.findOne(userId);
    const role = await this.userRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }

    const userRole = await this.userRepository.findUserRole(userId, roleId);
    if (!userRole) {
      throw new NotFoundException('User does not have this role');
    }

    if (role.name === String(ERoleName.ADMIN)) {
      const adminCount = await this.userRepository.countUsersByRole(roleId);
      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last ADMIN role from the system',
        );
      }
    }

    await this.userRepository.removeRoleFromUser(userId, roleId);

    return {
      userId,
      roleId,
      roleName: role.name,
      revokedAt: new Date(),
    };
  }

  async getUsersByRole(roleId: string, page = 1, limit = 20, search?: string) {
    const role = await this.userRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }

    const take = limit + 1;
    const skip = (page - 1) * limit;
    const rows = await this.userRepository.getUsersByRole({
      roleId,
      skip,
      take,
      search,
    });
    const hasNext = rows.length > limit;
    const docs = rows.slice(0, limit).map((row) => ({
      ...this.mapUser({ ...row.user, userRole: [] }),
      assignedAt: row.createdAt,
    }));

    return {
      docs,
      currentPage: page,
      nextPage: hasNext ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      limit,
      hasNext,
      hasPrev: page > 1,
    };
  }

  async getUserPermissions(userId: string) {
    await this.findOne(userId);
    const permissions = await this.userRepository.getUserPermissions(userId);

    if (!permissions) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return permissions;
  }

  async updateUserPermissions(userId: string, permissions: string[]) {
    await this.findOne(userId);
    const updateData: Prisma.UserUpdateInput = {};

    for (const field of PERMISSION_FIELDS) {
      updateData[field] = permissions.includes(field);
    }

    return this.userRepository.updateUserPermissions(userId, updateData);
  }

  async findUserId(dto: FindUserIdDto): Promise<{ userId: string }> {
    const user = await this.userRepository.findByEmailAndName(
      dto.email,
      dto.name,
    );
    if (!user) {
      throw new NotFoundException('User not found with the provided name and email');
    }

    return { userId: user.id };
  }

  async resetPassword(dto: FindPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findByIdNameAndEmail(
      dto.id,
      dto.name,
      dto.email,
    );
    if (!user) {
      throw new NotFoundException(
        'User not found with the provided ID, name and email',
      );
    }

    const newPassword = `${Math.random().toString(36).slice(-10)}${Math.random()
      .toString(36)
      .slice(-10)}`;
    await this.userRepository.updateUser(user.id, {
      password: await bcrypt.hash(newPassword, 10),
      updatedAt: new Date(),
    });

    return {
      message: 'Password has been reset.',
    };
  }

  async updatePasswordWithOldPassword(
    userId: string,
    dto: UpdatePasswordWithOldDto,
  ): Promise<{ message: string }> {
    const user = await this.findOne(userId);
    if (!user.password) {
      throw new BadRequestException('User password is missing');
    }

    const oldPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!oldPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const samePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (samePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    await this.userRepository.updateUser(userId, {
      password: await bcrypt.hash(dto.newPassword, 10),
      updatedAt: new Date(),
    });

    return { message: 'Password updated successfully' };
  }

  async checkUserId(id: string): Promise<{ exists: boolean; userId: string }> {
    const user = await this.userRepository.findById(id);

    return { exists: !!user, userId: id };
  }

  private async getUserPaginate(
    query: GetUsersQueryDto,
    excludeUserRole: boolean,
  ): Promise<IPaginate<UserEntity>> {
    const page = this.toPositiveNumber(query.page, 1);
    const limit = this.toPositiveNumber(query.limit, 10);
    const counted = query.counted ?? true;
    const { docs, totalDocs } = await this.userRepository.findUsersPaginated({
      filter: {
        q: query.q,
        email: query.email,
        searchField: query.searchField,
        role: query.role === 'ALL' ? undefined : query.role,
      },
      options: {
        page,
        limit,
        sort: query.sort ?? 'asc',
        sortBy: query.sortBy ?? 'createdAt',
        counted,
      },
      excludeUserRole,
    });
    const mappedDocs = docs.map((user) => this.mapUser(user));

    return this.toPaginate(mappedDocs, page, limit, counted ? totalDocs : undefined);
  }

  private toPaginate(
    docs: UserEntity[],
    currentPage: number,
    limit: number,
    totalDocs?: number,
  ): IPaginate<UserEntity> {
    if (totalDocs !== undefined) {
      const totalPages = Math.ceil(totalDocs / limit);
      const hasNext = currentPage < totalPages;
      const hasPrev = currentPage > 1;

      return {
        docs,
        docsCount: docs.length,
        totalDocs,
        totalPages,
        currentPage,
        nextPage: hasNext ? currentPage + 1 : null,
        previousPage: hasPrev ? currentPage - 1 : null,
        limit,
        hasNext,
        hasPrev,
      };
    }

    return {
      docs,
      currentPage,
      nextPage: null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
      limit,
      hasNext: false,
      hasPrev: currentPage > 1,
    };
  }

  private mapUser(user: UserWithRoles): UserEntity {
    return toUserEntity(
      user,
      user.userRole.map((userRole) => userRole.role),
      null,
    );
  }

  private toPositiveNumber(value: unknown, defaultValue: number): number {
    const parsedValue = Number(value ?? defaultValue);

    return Number.isFinite(parsedValue) && parsedValue > 0
      ? parsedValue
      : defaultValue;
  }
}
