import type {
  Recipe,
  UserRecipes,
} from 'libs/prisma/generated/nutrition-service/client';
import { RecipeEntity } from '../entities/recipe.entity';

export type RecipeWithUserRecipes = Recipe & {
  userRecipes?: Pick<UserRecipes, 'userId' | 'productId'>[];
};

export const toRecipeEntity = (recipe: RecipeWithUserRecipes): RecipeEntity => {
  const userRecipe = recipe.userRecipes?.[0];

  return {
    id: recipe.id,
    title: recipe.title,
    category: recipe.category,
    dateOfWriting: recipe.dateOfWriting,
    views: recipe.views,
    status: recipe.status,
    thumbnailUrl: recipe.thumbnailUrl,
    content: recipe.content,
    ingredients: recipe.ingredients,
    isActive: recipe.isActive,
    likes: recipe.likes ?? 0,
    authorId: userRecipe?.userId,
    productId: userRecipe?.productId ?? undefined,
  };
};
