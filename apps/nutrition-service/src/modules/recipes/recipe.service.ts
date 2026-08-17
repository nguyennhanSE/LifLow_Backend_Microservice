import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IPaginate } from 'libs/common/pagination/pagination.model';
import type { Prisma } from 'libs/prisma/generated/nutrition-service/client';
import type { NutritionRequestMetadata } from '../../common';
import {
  CreateRecipeDto,
  QueryRecipeDto,
  UpdateRecipeDto,
} from './dtos/recipe.dto';
import { RecipeEntity } from './entities/recipe.entity';
import { RecipeRepository } from './repositories/recipe.repository';

@Injectable()
export class RecipeService {
  constructor(private readonly recipeRepository: RecipeRepository) {}

  create(
    createRecipeDto: CreateRecipeDto,
    metadata?: NutritionRequestMetadata,
  ): Promise<RecipeEntity> {
    const authorId = createRecipeDto.authorId ?? metadata?.userId ?? undefined;

    return this.recipeRepository.createRecipe({
      recipe: {
        title: createRecipeDto.title,
        category: createRecipeDto.category,
        dateOfWriting: createRecipeDto.dateOfWriting
          ? new Date(createRecipeDto.dateOfWriting)
          : new Date(),
        status: createRecipeDto.status ?? 'pending',
        thumbnailUrl: createRecipeDto.thumbnailUrl ?? [],
        content: createRecipeDto.content,
        ingredients: createRecipeDto.ingredients,
        isActive: createRecipeDto.isActive ?? true,
        likes: createRecipeDto.likes ?? 0,
      },
      userRecipe: authorId
        ? {
            userId: authorId,
            productId: createRecipeDto.productId,
          }
        : undefined,
    });
  }

  findAll(query: QueryRecipeDto): Promise<IPaginate<RecipeEntity>> {
    return this.recipeRepository.getRecipesPaginated({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      sort: query.order ?? 'desc',
      sortBy: query.sortBy ?? 'dateOfWriting',
      category: query.category,
      status: query.status,
      isActive: query.isActive,
      authorId: query.authorId,
      productId: query.productId,
      q: query.q,
      counted: true,
    });
  }

  async findOne(id: string): Promise<RecipeEntity> {
    const recipe = await this.recipeRepository.getRecipeById(id);

    if (!recipe) {
      throw new NotFoundException(`Recipe with id "${id}" not found`);
    }

    return recipe;
  }

  async update(
    id: string,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<RecipeEntity> {
    await this.findOne(id);

    const recipe = this.buildRecipeUpdateInput(updateRecipeDto);
    const userRecipe = this.buildUserRecipeUpdateInput(updateRecipeDto);

    if (!Object.keys(recipe).length && !userRecipe) {
      throw new BadRequestException('No update data provided');
    }

    return this.recipeRepository.updateRecipe(id, {
      recipe,
      userRecipe,
    });
  }

  async remove(
    id: string,
  ): Promise<{ message: string; recipe: RecipeEntity }> {
    await this.findOne(id);
    const recipe = await this.recipeRepository.deleteRecipe(id);

    return {
      message: `Recipe with id "${id}" deleted successfully`,
      recipe,
    };
  }

  private buildRecipeUpdateInput(
    updateRecipeDto: UpdateRecipeDto,
  ): Prisma.RecipeUncheckedUpdateInput {
    const data: Prisma.RecipeUncheckedUpdateInput = {};

    if (updateRecipeDto.title !== undefined) data.title = updateRecipeDto.title;
    if (updateRecipeDto.category !== undefined) {
      data.category = updateRecipeDto.category;
    }
    if (updateRecipeDto.dateOfWriting !== undefined) {
      data.dateOfWriting = new Date(updateRecipeDto.dateOfWriting);
    }
    if (updateRecipeDto.status !== undefined) {
      data.status = updateRecipeDto.status;
    }
    if (updateRecipeDto.thumbnailUrl !== undefined) {
      data.thumbnailUrl = updateRecipeDto.thumbnailUrl;
    }
    if (updateRecipeDto.content !== undefined) {
      data.content = updateRecipeDto.content;
    }
    if (updateRecipeDto.ingredients !== undefined) {
      data.ingredients = updateRecipeDto.ingredients;
    }
    if (updateRecipeDto.isActive !== undefined) {
      data.isActive = updateRecipeDto.isActive;
    }
    if (updateRecipeDto.views !== undefined) data.views = updateRecipeDto.views;
    if (updateRecipeDto.likes !== undefined) data.likes = updateRecipeDto.likes;

    return data;
  }

  private buildUserRecipeUpdateInput(
    updateRecipeDto: UpdateRecipeDto,
  ):
    | {
        userId?: string;
        productId?: string | null;
      }
    | undefined {
    if (
      updateRecipeDto.authorId === undefined &&
      updateRecipeDto.productId === undefined
    ) {
      return undefined;
    }

    return {
      userId: updateRecipeDto.authorId,
      productId: updateRecipeDto.productId ?? null,
    };
  }
}
