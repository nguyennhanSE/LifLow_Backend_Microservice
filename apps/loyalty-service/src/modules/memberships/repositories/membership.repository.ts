import { Injectable } from '@nestjs/common';
import type { Prisma } from 'libs/prisma/generated/loyalty-service/client';
import type { IPaginate } from 'libs/common/pagination/pagination.model';
import { PrismaService } from '../../../prisma/prisma.service';
import { MembershipEntity } from '../entities/membership.entity';
import { toMembershipEntity } from '../mapping/membership.mapping';

export interface MembershipPaginateOptions {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
  counted?: boolean;
  search?: string;
  name?: string;
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

  private toPaginate(
    docs: MembershipEntity[],
    currentPage: number,
    limit: number,
    totalDocs?: number,
  ): IPaginate<MembershipEntity> {
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
