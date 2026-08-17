import { Injectable, NotFoundException } from '@nestjs/common';
import { RecipeLikeDto } from './dtos/recipe-like.dto';
import { RecipeLikeEntity } from './entities';
import { RecipeLikeRepository } from './repositories/recipe-like.repository';

@Injectable()
export class RecipeLikeService {
  constructor(private readonly recipeLikeRepository: RecipeLikeRepository) {}

  async toggle(
    recipeLikeDto: RecipeLikeDto,
  ): Promise<RecipeLikeEntity> {
    await this.ensureRecipeExists(recipeLikeDto.recipeId);

    return this.recipeLikeRepository.toggleRecipeLike(
      recipeLikeDto.authorId,
      recipeLikeDto.recipeId,
    );
  }

  private async ensureRecipeExists(recipeId: string): Promise<void> {
    const exists = await this.recipeLikeRepository.recipeExists(recipeId);

    if (!exists) {
      throw new NotFoundException(`Recipe with id "${recipeId}" not found`);
    }
  }
}
