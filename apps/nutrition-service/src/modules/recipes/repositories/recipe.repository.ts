import { Injectable } from '@nestjs/common';
import type { IPaginate } from 'libs/common/pagination/pagination.model';
import type { Prisma } from 'libs/prisma/generated/nutrition-service/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RecipeEntity } from '../entities/recipe.entity';
import { toRecipeEntity } from '../mapping/recipe.mapping';

export interface RecipePaginateOptions {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
  counted?: boolean;
  category?: Prisma.RecipeWhereInput['category'];
  status?: string;
  isActive?: boolean;
  authorId?: string;
  productId?: string;
  q?: string;
}

export interface CreateRecipeInput {
  recipe: Prisma.RecipeUncheckedCreateInput;
  userRecipe?: Omit<Prisma.UserRecipesUncheckedCreateInput, 'recipeId'>;
}

export interface UpdateRecipeInput {
  recipe: Prisma.RecipeUncheckedUpdateInput;
  userRecipe?: {
    userId?: string;
    productId?: string | null;
  };
}

@Injectable()
export class RecipeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRecipe(input: CreateRecipeInput): Promise<RecipeEntity> {
    const recipe = await this.prisma.$transaction(async (tx) => {
      const createdRecipe = await tx.recipe.create({
        data: input.recipe,
      });

      if (input.userRecipe) {
        await tx.userRecipes.create({
          data: {
            ...input.userRecipe,
            recipeId: createdRecipe.id,
          },
        });
      }

      return tx.recipe.findUniqueOrThrow({
        where: { id: createdRecipe.id },
        include: { userRecipes: true },
      });
    });

    return toRecipeEntity(recipe);
  }

  async getRecipeById(id: string): Promise<RecipeEntity | null> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: { userRecipes: true },
    });

    return recipe ? toRecipeEntity(recipe) : null;
  }

  async getRecipesPaginated(
    options: RecipePaginateOptions,
  ): Promise<IPaginate<RecipeEntity>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const sort = options.sort ?? 'desc';
    const sortBy = this.getRecipeSortField(options.sortBy);
    const counted = options.counted ?? true;
    const skip = (page - 1) * limit;
    const where = this.buildRecipeWhere(options);
    const orderBy: Prisma.RecipeOrderByWithRelationInput = {
      [sortBy]: sort,
    };

    const [docs, totalDocs] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { userRecipes: true },
      }),
      counted ? this.prisma.recipe.count({ where }) : Promise.resolve(0),
    ]);

    return this.toPaginate(
      docs.map(toRecipeEntity),
      page,
      limit,
      counted ? totalDocs : undefined,
    );
  }

  async updateRecipe(
    id: string,
    input: UpdateRecipeInput,
  ): Promise<RecipeEntity> {
    const recipe = await this.prisma.$transaction(async (tx) => {
      await tx.recipe.update({
        where: { id },
        data: input.recipe,
      });

      if (input.userRecipe) {
        const existingUserRecipe = await tx.userRecipes.findUnique({
          where: { recipeId: id },
          select: { id: true },
        });

        if (existingUserRecipe) {
          await tx.userRecipes.update({
            where: { id: existingUserRecipe.id },
            data: input.userRecipe,
          });
        } else if (input.userRecipe.userId) {
          await tx.userRecipes.create({
            data: {
              userId: input.userRecipe.userId,
              productId: input.userRecipe.productId ?? undefined,
              recipeId: id,
            },
          });
        }
      }

      return tx.recipe.findUniqueOrThrow({
        where: { id },
        include: { userRecipes: true },
      });
    });

    return toRecipeEntity(recipe);
  }

  async deleteRecipe(id: string): Promise<RecipeEntity> {
    const recipe = await this.prisma.recipe.delete({
      where: { id },
      include: { userRecipes: true },
    });

    return toRecipeEntity(recipe);
  }

  private buildRecipeWhere(
    options: RecipePaginateOptions,
  ): Prisma.RecipeWhereInput {
    const where: Prisma.RecipeWhereInput = {};

    if (options.category) {
      where.category = options.category;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options.authorId || options.productId) {
      where.userRecipes = {
        some: {
          userId: options.authorId,
          productId: options.productId,
        },
      };
    }

    if (options.q) {
      where.OR = [
        { title: { contains: options.q, mode: 'insensitive' } },
        { content: { contains: options.q, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private getRecipeSortField(
    sortBy: string | undefined,
  ): 'dateOfWriting' | 'views' | 'likes' | 'title' {
    if (sortBy === 'views' || sortBy === 'likes' || sortBy === 'title') {
      return sortBy;
    }

    if (sortBy === 'alphabetical') {
      return 'title';
    }

    return 'dateOfWriting';
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
