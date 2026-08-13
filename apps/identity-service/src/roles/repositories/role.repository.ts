import { Injectable } from '@nestjs/common';
import type {
  Prisma,
  Role,
  User,
  UserRole,
} from 'libs/prisma/generated/identity-service/client';
import { PrismaService } from '../../prisma/prisma.service';

type RoleWithUserCount = Prisma.RoleGetPayload<{
  include: {
    _count: {
      select: {
        userRole: true;
      };
    };
  };
}>;

type RoleWithUsers = Prisma.RoleGetPayload<{
  include: {
    userRole: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
  };
}>;

type UserRoleWithUser = Prisma.UserRoleGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        phoneNumber: true;
      };
    };
  };
}>;

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRoleNamesByUserId(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    return userRoles.map((userRole) => userRole.role.name);
  }

  create(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithRelationInput;
  }): Promise<RoleWithUserCount[]> {
    const { skip, take, where, orderBy } = params;

    return this.prisma.role.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        _count: {
          select: { userRole: true },
        },
      },
    });
  }

  findOne(id: string): Promise<RoleWithUsers | null> {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        userRole: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { name } });
  }

  findById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<Role> {
    return this.prisma.role.delete({ where: { id } });
  }

  async assignRoleToUsers(
    roleId: string,
    userIds: string[],
  ): Promise<Prisma.BatchPayload> {
    const updatedAt = new Date();
    const upserts = userIds.map((userId) =>
      this.prisma.userRole.upsert({
        where: {
          userId_roleId: { userId, roleId },
        },
        create: {
          userId,
          roleId,
        },
        update: {
          updatedAt,
        } as Prisma.UserRoleUpdateInput,
      }),
    );

    return this.prisma.$transaction(upserts).then((result) => ({
      count: result.length,
    }));
  }

  revokeRoleFromUser(roleId: string, userId: string): Promise<UserRole> {
    return this.prisma.userRole.delete({
      where: {
        userId_roleId: { userId, roleId },
      },
    });
  }

  findUsersByIds(userIds: string[]): Promise<Array<Pick<User, 'id'>>> {
    return this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });
  }

  findUserById(userId: string): Promise<Pick<User, 'id'> | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
  }

  findUserRole(roleId: string, userId: string): Promise<UserRole | null> {
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

  async getUsersByRole(
    roleId: string,
    skip?: number,
    take?: number,
    search?: string,
  ): Promise<UserRoleWithUser[]> {
    const where: Prisma.UserRoleWhereInput = {
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
    };

    return this.prisma.userRole.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
  }
}
