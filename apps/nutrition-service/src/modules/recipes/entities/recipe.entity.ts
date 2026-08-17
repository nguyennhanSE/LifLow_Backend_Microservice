import type { RecipeCategory } from 'libs/prisma/generated/nutrition-service/client';

export class RecipeEntity {
  id!: string;
  title!: string;
  category!: RecipeCategory;
  dateOfWriting!: Date;
  views!: number;
  status!: string;
  thumbnailUrl!: string[];
  content!: string;
  ingredients!: string[];
  isActive!: boolean;
  likes!: number;
  authorId?: string;
  productId?: string;
}
