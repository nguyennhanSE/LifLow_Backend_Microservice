import { Injectable } from '@nestjs/common';
import type {
  Prisma,
  RecipeLikes,
} from 'libs/prisma/generated/nutrition-service/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { RecipeLikeEntity } from '../entities';

const ACTIVE_STATUS = 'active';
const INACTIVE_STATUS = 'inactive';

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
      const existingRecipeLike = await tx.recipeLikes.findUnique({
        where: {
          authorId_recipeId: {
            authorId,
            recipeId,
          },
        },
      });

      const nextStatus = existingRecipeLike
        ? existingRecipeLike.status === ACTIVE_STATUS
          ? INACTIVE_STATUS
          : ACTIVE_STATUS
        : ACTIVE_STATUS;
      const likesDelta = nextStatus === ACTIVE_STATUS ? 1 : -1;

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
