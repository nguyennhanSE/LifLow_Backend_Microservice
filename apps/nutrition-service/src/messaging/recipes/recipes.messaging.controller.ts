import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  IDENTITY_USER_PATTERNS,
  UserDeletedPayload,
} from '../../clients/identity/identity-client.constants';
import type { NutritionRequestPayload } from '../../common';
import {
  CreateRecipeDto,
  PatchRecipeThumbnailDto,
  QueryRecipeDto,
  RecipeIdPayload,
  UpdateRecipePayload,
} from '../../modules/recipes/dtos/recipe.dto';
import { RecipeService } from '../../modules/recipes/recipe.service';
import { RECIPE_PATTERNS } from './recipes.pattern';

@Controller()
export class RecipesMessagingController {
  constructor(private readonly recipeService: RecipeService) {}

  @MessagePattern(RECIPE_PATTERNS.createRecipe)
  createRecipe(@Payload() payload: NutritionRequestPayload<CreateRecipeDto>) {
    return this.recipeService.create(payload.data, payload.metadata);
  }

  @MessagePattern(RECIPE_PATTERNS.listRecipes)
  listRecipes(@Payload() payload: NutritionRequestPayload<QueryRecipeDto>) {
    return this.recipeService.findAll(payload.data);
  }

  @MessagePattern(RECIPE_PATTERNS.getRecipeById)
  getRecipeById(@Payload() payload: NutritionRequestPayload<RecipeIdPayload>) {
    return this.recipeService.findOne(payload.data.id);
  }

  @MessagePattern(RECIPE_PATTERNS.updateRecipe)
  updateRecipe(
    @Payload() payload: NutritionRequestPayload<UpdateRecipePayload>,
  ) {
    return this.recipeService.update(
      payload.data.id,
      payload.data.updateRecipeDto,
    );
  }

  @MessagePattern(RECIPE_PATTERNS.deleteRecipe)
  deleteRecipe(@Payload() payload: NutritionRequestPayload<RecipeIdPayload>) {
    return this.recipeService.remove(payload.data.id);
  }

  @EventPattern(IDENTITY_USER_PATTERNS.userDeleted)
  handleUserDeleted(
    @Payload() payload: NutritionRequestPayload<UserDeletedPayload>,
  ) {
    return this.recipeService.handleUserDeleted(payload.data.userId);
  }

  @MessagePattern(RECIPE_PATTERNS.patchRecipeThumbnail)
  patchRecipeThumbnail(
    @Payload()
    payload: NutritionRequestPayload<PatchRecipeThumbnailDto>,
  ) {
    return this.recipeService.patchRecipeThumbnail(
      payload.data.recipeId,
      payload.data.fileMetadata,
      { replace: payload.data.replace },
    );
  }
}
