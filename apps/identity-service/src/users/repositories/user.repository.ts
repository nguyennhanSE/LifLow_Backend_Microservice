import { Injectable } from '@nestjs/common';
import type {
  Prisma,
  Role,
  User,
  UserRole,
} from 'libs/prisma/generated/identity-service/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ERoleName } from '../../roles/enums/role.enum';

export type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    userRole: {
      include: {
        role: true;
      };
    };
  };
}>;

export type UserRoleWithUser = Prisma.UserRoleGetPayload<{
  include: {
    user: true;
  };
}>;

export interface UserListOptions {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
  counted?: boolean;
}

export interface UserListFilter {
  q?: string;
  email?: string;
  searchField?: string;
  role?: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  countUsersCreatedBetween(from: Date, toExclusive: Date): Promise<number> {
    return this.prisma.user.count({
      where: {
        createdAt: {
          gte: from,
          lt: toExclusive,
        },
      },
    });
  }

  findById(id: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: this.userRolesInclude(),
    });
  }

  findByAccount(account: string): Promise<UserWithRoles | null> {
    const value = account.trim();

    return this.prisma.user.findFirst({
      where: {
        OR: [{ id: value }, { email: value }, { phoneNumber: value }],
      },
      include: this.userRolesInclude(),
    });
  }

  findByEmail(email: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findFirst({
      where: { email },
      include: this.userRolesInclude(),
    });
  }

  findByIds(ids: string[]): Promise<UserWithRoles[]> {
    return this.prisma.user.findMany({
      where: { id: { in: ids } },
      include: this.userRolesInclude(),
    });
  }

  findByEmails(emails: string[]): Promise<UserWithRoles[]> {
    return this.prisma.user.findMany({
      where: { email: { in: emails } },
      include: this.userRolesInclude(),
    });
  }

  findByAccounts(accounts: string[]): Promise<UserWithRoles[]> {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { id: { in: accounts } },
          { email: { in: accounts } },
          { phoneNumber: { in: accounts } },
        ],
      },
      include: this.userRolesInclude(),
    });
  }

  findByEmailAndName(email: string, name: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, name },
    });
  }

  findByIdNameAndEmail(
    id: string,
    name: string,
    email: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, name, email },
    });
  }

  async createUser(
    data: Prisma.UserCreateInput,
    defaultRoleName = ERoleName.USER,
  ): Promise<UserWithRoles> {
    const role = await this.prisma.role.findUnique({
      where: { name: defaultRoleName },
    });

    const createdUserId = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data });

      if (role) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }

      return user.id;
    });

    const createdUser = await this.findById(createdUserId);
    if (!createdUser) {
      throw new Error('Failed to retrieve created user');
    }

    return createdUser;
  }

  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<UserWithRoles> {
    await this.prisma.user.update({
      where: { id },
      data,
    });

    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    return updatedUser;
  }

  async updateUserRoleByName(
    userId: string,
    roleName: ERoleName,
  ): Promise<UserWithRoles> {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId } }),
      this.prisma.userRole.create({
        data: {
          userId,
          roleId: role.id,
        },
      }),
    ]);

    const user = await this.findById(userId);
    if (!user) {
      throw new Error('Failed to retrieve updated user');
    }

    return user;
  }

  deleteUser(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async findUsersPaginated(params: {
    filter: UserListFilter;
    options: UserListOptions;
    excludeUserRole?: boolean;
  }): Promise<{ docs: UserWithRoles[]; totalDocs: number }> {
    const { filter, options, excludeUserRole = false } = params;
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const skip = (page - 1) * limit;
    const where = this.buildUserWhere(filter, excludeUserRole);
    const orderBy = this.buildUserOrderBy(options.sortBy, options.sort);

    const [docs, totalDocs] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: this.userRolesInclude(),
      }),
      options.counted === false
        ? Promise.resolve(0)
        : this.prisma.user.count({ where }),
    ]);

    return { docs, totalDocs };
  }

  getUserRoles(userId: string): Promise<Array<{ role: Role }>> {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }

  async assignRolesToUser(
    userId: string,
    roleIds: string[],
  ): Promise<Prisma.BatchPayload> {
    const upserts = roleIds.map((roleId) =>
      this.prisma.userRole.upsert({
        where: {
          userId_roleId: { userId, roleId },
        },
        create: {
          userId,
          roleId,
        },
        update: {
          updatedAt: new Date(),
        },
      }),
    );

    return this.prisma.$transaction(upserts).then((result) => ({
      count: result.length,
    }));
  }

  removeRoleFromUser(userId: string, roleId: string): Promise<UserRole> {
    return this.prisma.userRole.delete({
      where: {
        userId_roleId: { userId, roleId },
      },
    });
  }

  findRoleById(roleId: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id: roleId },
    });
  }

  findRolesByIds(roleIds: string[]): Promise<Array<Pick<Role, 'id' | 'name'>>> {
    return this.prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, name: true },
    });
  }

  findUserRole(userId: string, roleId: string): Promise<UserRole | null> {
    return this.prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId },
      },
    });
  }

  countUsersByRole(roleId: string): Promise<number> {
    return this.prisma.userRole.count({
      where: { roleId },
    });
  }

  getUsersByRole(params: {
    roleId: string;
    skip: number;
    take: number;
    search?: string;
  }): Promise<UserRoleWithUser[]> {
    const { roleId, skip, take, search } = params;

    return this.prisma.userRole.findMany({
      where: {
        roleId,
        ...(search
          ? {
              user: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              },
            }
          : {}),
      },
      skip,
      take,
      include: {
        user: true,
      },
    });
  }

  getUserPermissions(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dashboardAccess: true,
        memberAccess: true,
        productAccess: true,
        orderAccess: true,
        recipeAccess: true,
        bannerAccess: true,
      },
    });
  }

  updateUserPermissions(userId: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        dashboardAccess: true,
        memberAccess: true,
        productAccess: true,
        orderAccess: true,
        recipeAccess: true,
        bannerAccess: true,
      },
    });
  }

  updateMembershipSnapshot(
    userId: string,
    data: {
      membershipLevel?: string | null;
      totalPurchaseAmount?: number | null;
    },
  ): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.membershipLevel !== undefined) {
      updateData.membershipLevel = data.membershipLevel;
    }

    if (data.totalPurchaseAmount !== undefined) {
      updateData.totalPurchaseAmount = data.totalPurchaseAmount;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  private buildUserWhere(
    filter: UserListFilter,
    excludeUserRole: boolean,
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filter.role && filter.role !== 'ALL') {
      where.userRole = {
        some: {
          role: {
            name: filter.role,
          },
        },
      };
    } else if (excludeUserRole) {
      where.userRole = {
        none: {
          role: {
            name: ERoleName.USER,
          },
        },
      };
    }

    if (filter.email) {
      where.email = filter.email;
    }

    if (filter.q) {
      if (filter.searchField && this.isSearchableField(filter.searchField)) {
        where[filter.searchField] = {
          contains: filter.q,
          mode: 'insensitive',
        };
      } else {
        where.OR = [
          { id: { contains: filter.q, mode: 'insensitive' } },
          { name: { contains: filter.q, mode: 'insensitive' } },
          { email: { contains: filter.q, mode: 'insensitive' } },
          { phoneNumber: { contains: filter.q, mode: 'insensitive' } },
        ];
      }
    }

    return where;
  }

  private buildUserOrderBy(
    sortBy = 'createdAt',
    sort: 'asc' | 'desc' = 'asc',
  ): Prisma.UserOrderByWithRelationInput {
    const allowedSortFields = [
      'id',
      'name',
      'email',
      'createdAt',
      'updatedAt',
      'registrationDate',
      'totalPurchaseAmount',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    return { [sortField]: sort };
  }

  private isSearchableField(
    field: string,
  ): field is 'id' | 'name' | 'email' | 'phoneNumber' | 'nickName' {
    return ['id', 'name', 'email', 'phoneNumber', 'nickName'].includes(field);
  }

  private userRolesInclude() {
    return {
      userRole: {
        include: {
          role: true,
        },
      },
    } satisfies Prisma.UserInclude;
  }
}
