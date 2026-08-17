import { Injectable } from '@nestjs/common';
import type {
  Prisma,
  RecipeLikes,
} from 'libs/prisma/generated/nutrition-service/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RecipeLikeEntity } from '../entities';

const LIKE_ACTIVE_STATUS = 'active';
const LIKE_INACTIVE_STATUS = 'inactive';
const RECIPE_APPROVED_STATUS = 'approved';
const RECIPE_REJECTED_STATUS = 'rejected';
const RECIPE_ACTIVE_STATUS = true;
const RECIPE_INACTIVE_STATUS = false;

@Injectable()
export class RecipeLikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async recipeExists(recipeId: string): Promise<boolean> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { id: true },
    });

    return Boolean(recipe);
  }

  async toggleRecipeLike(
    authorId: string,
    recipeId: string,
  ): Promise<RecipeLikeEntity> {
    const recipeLike = await this.prisma.$transaction(async (tx) => {
      const recipeExists = await tx.recipe.findUnique({
        where: { id: recipeId },
        select: { status: true, isActive: true },
      });

      if (
        !recipeExists ||
        recipeExists.status === RECIPE_REJECTED_STATUS ||
        recipeExists.isActive === RECIPE_INACTIVE_STATUS ||
        recipeExists.status !== RECIPE_APPROVED_STATUS ||
        recipeExists.isActive !== RECIPE_ACTIVE_STATUS
      ) {
        throw new Error('Recipe not found or inactive');
      }

      const existingRecipeLike = await tx.recipeLikes.findUnique({
        where: {
          authorId_recipeId: {
            authorId,
            recipeId,
          },
        },
      });

      const nextStatus = existingRecipeLike
        ? existingRecipeLike.status === LIKE_ACTIVE_STATUS
          ? LIKE_INACTIVE_STATUS
          : LIKE_ACTIVE_STATUS
        : LIKE_ACTIVE_STATUS;
      const likesDelta = nextStatus === LIKE_ACTIVE_STATUS ? 1 : -1;

      const nextRecipeLike = existingRecipeLike
        ? await tx.recipeLikes.update({
            where: {
              authorId_recipeId: {
                authorId,
                recipeId,
              },
            },
            data: {
              status: nextStatus,
            },
          })
        : await tx.recipeLikes.create({
            data: {
              authorId,
              recipeId,
              status: nextStatus,
            },
          });

      await this.updateRecipeLikesCount(tx, recipeId, likesDelta);

      return nextRecipeLike;
    }).catch((error) => {
      throw new Error(`Failed to toggle recipe like: ${error.message}`);
    });

    return this.toRecipeLikeEntity(recipeLike);
  }

  private toRecipeLikeEntity(recipeLike: RecipeLikes): RecipeLikeEntity {
    return {
      id: recipeLike.id,
      authorId: recipeLike.authorId,
      recipeId: recipeLike.recipeId,
      status: recipeLike.status,
      createdAt: recipeLike.createdAt,
      updatedAt: recipeLike.updatedAt,
    };
  }

  private async updateRecipeLikesCount(
    tx: Prisma.TransactionClient,
    recipeId: string,
    likesDelta: 1 | -1,
  ): Promise<void> {
    await tx.recipe.update({
      where: { id: recipeId },
      data: {
        likes: {
          [likesDelta > 0 ? 'increment' : 'decrement']: 1,
        },
      },
    });
  }
}
