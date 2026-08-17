import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { NutritionRequestPayload } from '../../common';
import {
  CreateRecipeDto,
  QueryRecipeDto,
  RecipeIdPayload,
  UpdateRecipePayload,
} from './dtos/recipe.dto';
import { RECIPE_PATTERNS } from './patterns/recipe.pattern';
import { RecipeService } from './recipe.service';

@Controller()
export class RecipeController {
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
}
