import { Injectable } from '@nestjs/common';
import type {
  Prisma,
  Role,
} from 'libs/prisma/generated/identity-service/client';
import { PrismaService } from '../../../prisma/prisma.service';

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

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
