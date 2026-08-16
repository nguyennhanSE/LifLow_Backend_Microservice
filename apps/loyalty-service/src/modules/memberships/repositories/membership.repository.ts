import { Injectable } from '@nestjs/common';
import type { Prisma } from 'libs/prisma/generated/loyalty-service/client';
import type { IPaginate } from 'libs/common/pagination/pagination.model';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  MembershipEntity,
  UserMembershipEntity,
} from '../entities/membership.entity';
import {
  toMembershipEntity,
  toUserMembershipEntity,
} from '../mapping/membership.mapping';

export interface MembershipPaginateOptions {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
  counted?: boolean;
  search?: string;
  name?: string;
}

export interface MembershipPriceSnapshot {
  membershipName: string;
  membershipMinPrice: number;
}

export interface UserMembershipPaginateOptions {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
  counted?: boolean;
  userId?: string;
  membershipId?: string;
  status?: string;
}

@Injectable()
export class MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMembership(
    data: Prisma.MembershipCreateInput,
  ): Promise<MembershipEntity> {
    const membership = await this.prisma.membership.create({ data });

    return toMembershipEntity(membership);
  }

  async getMembershipById(id: string): Promise<MembershipEntity | null> {
    const membership = await this.prisma.membership.findUnique({
      where: { id },
    });

    return membership ? toMembershipEntity(membership) : null;
  }

  async getMembershipByName(name: string): Promise<MembershipEntity | null> {
    const membership = await this.prisma.membership.findUnique({
      where: { name },
    });

    return membership ? toMembershipEntity(membership) : null;
  }

  async getMembershipsPaginated(
    options: MembershipPaginateOptions,
  ): Promise<IPaginate<MembershipEntity>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sort = options.sort ?? 'asc';
    const sortBy = this.getMembershipSortField(options.sortBy);
    const counted = options.counted ?? true;
    const skip = (page - 1) * limit;
    const where = this.buildMembershipWhere(options);
    const orderBy: Prisma.MembershipOrderByWithRelationInput = {
      [sortBy]: sort,
    };

    const [docs, totalDocs] = await Promise.all([
      this.prisma.membership.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      counted ? this.prisma.membership.count({ where }) : Promise.resolve(0),
    ]);

    return this.toPaginate(
      docs.map(toMembershipEntity),
      page,
      limit,
      counted ? totalDocs : undefined,
    );
  }

  async updateMembership(
    id: string,
    data: Prisma.MembershipUpdateInput,
  ): Promise<MembershipEntity> {
    const membership = await this.prisma.membership.update({
      where: { id },
      data,
    });

    return toMembershipEntity(membership);
  }

  async deleteMembership(id: string): Promise<MembershipEntity> {
    const membership = await this.prisma.membership.delete({
      where: { id },
    });

    return toMembershipEntity(membership);
  }

  async getMembershipPriceSnapshots(): Promise<MembershipPriceSnapshot[]> {
    const memberships = await this.prisma.membership.findMany({
      where: {
        name: { not: null },
        minPrice: { not: null },
      },
      select: {
        name: true,
        minPrice: true,
      },
      orderBy: {
        minPrice: 'desc',
      },
    });

    return memberships.map((membership) => ({
      membershipName: membership.name ?? '',
      membershipMinPrice: membership.minPrice ?? 0,
    }));
  }

  async createUserMembership(
    data: Prisma.UserMembershipUncheckedCreateInput,
  ): Promise<UserMembershipEntity> {
    const userMembership = await this.prisma.userMembership.create({
      data,
      include: { membership: true },
    });

    return toUserMembershipEntity(userMembership);
  }

  async getUserMembershipByUserId(
    userId: string,
  ): Promise<UserMembershipEntity | null> {
    const userMembership = await this.prisma.userMembership.findFirst({
      where: { userId },
      include: { membership: true },
    });

    return userMembership ? toUserMembershipEntity(userMembership) : null;
  }

  async getUserMembershipByUserAndMembership(
    userId: string,
    membershipId: string,
  ): Promise<UserMembershipEntity | null> {
    const userMembership = await this.prisma.userMembership.findFirst({
      where: { userId, membershipId },
      include: { membership: true },
    });

    return userMembership ? toUserMembershipEntity(userMembership) : null;
  }

  async getActiveUserMembership(
    userId: string,
    now = new Date(),
  ): Promise<UserMembershipEntity | null> {
    const userMembership = await this.prisma.userMembership.findFirst({
      where: {
        userId,
        status: 'normal',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { membership: true },
      orderBy: { endDate: 'desc' },
    });

    return userMembership ? toUserMembershipEntity(userMembership) : null;
  }

  async getUserMembershipsPaginated(
    options: UserMembershipPaginateOptions,
  ): Promise<IPaginate<UserMembershipEntity>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sort = options.sort ?? 'desc';
    const sortBy = this.getUserMembershipSortField(options.sortBy);
    const counted = options.counted ?? true;
    const skip = (page - 1) * limit;
    const where = this.buildUserMembershipWhere(options);
    const orderBy: Prisma.UserMembershipOrderByWithRelationInput = {
      [sortBy]: sort,
    };

    const [docs, totalDocs] = await Promise.all([
      this.prisma.userMembership.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { membership: true },
      }),
      counted
        ? this.prisma.userMembership.count({ where })
        : Promise.resolve(0),
    ]);

    return this.toPaginate(
      docs.map(toUserMembershipEntity),
      page,
      limit,
      counted ? totalDocs : undefined,
    );
  }

  async updateUserMembership(
    userId: string,
    data: Prisma.UserMembershipUncheckedUpdateInput,
  ): Promise<UserMembershipEntity> {
    const existing = await this.prisma.userMembership.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error(`User membership for user "${userId}" not found`);
    }

    const userMembership = await this.prisma.userMembership.update({
      where: { id: existing.id },
      data,
      include: { membership: true },
    });

    return toUserMembershipEntity(userMembership);
  }

  async deleteUserMembership(id: string): Promise<UserMembershipEntity> {
    const userMembership = await this.prisma.userMembership.delete({
      where: { id },
      include: { membership: true },
    });

    return toUserMembershipEntity(userMembership);
  }

  private buildMembershipWhere(
    options: MembershipPaginateOptions,
  ): Prisma.MembershipWhereInput {
    const where: Prisma.MembershipWhereInput = {};

    if (options.name) {
      where.name = options.name;
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { nickName: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private getMembershipSortField(
    sortBy: string | undefined,
  ): 'name' | 'createdAt' | 'updatedAt' {
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      return sortBy;
    }

    return 'name';
  }

  private buildUserMembershipWhere(
    options: UserMembershipPaginateOptions,
  ): Prisma.UserMembershipWhereInput {
    const where: Prisma.UserMembershipWhereInput = {};

    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.membershipId) {
      where.membershipId = options.membershipId;
    }

    if (options.status) {
      where.status = options.status;
    }

    return where;
  }

  private getUserMembershipSortField(
    sortBy: string | undefined,
  ): 'createdAt' | 'startDate' | 'endDate' | 'status' {
    if (sortBy === 'startDate' || sortBy === 'endDate' || sortBy === 'status') {
      return sortBy;
    }

    return 'createdAt';
  }

  private toPaginate<TDoc>(
    docs: TDoc[],
    currentPage: number,
    limit: number,
    totalDocs?: number,
  ): IPaginate<TDoc> {
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

    const hasPrev = currentPage > 1;

    return {
      docs,
      currentPage,
      nextPage: null,
      previousPage: hasPrev ? currentPage - 1 : null,
      limit,
      hasNext: false,
      hasPrev,
    };
  }
}
