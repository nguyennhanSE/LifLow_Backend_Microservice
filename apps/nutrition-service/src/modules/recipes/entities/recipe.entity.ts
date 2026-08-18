import type { RecipeCategory } from 'libs/prisma/generated/nutrition-service/client';
import type { VideoAssetEntity } from '../../videos/entities/video-asset.entity';

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
  // video
  videoAssetId?: string;
  videoAsset?: VideoAssetEntity | null;
}
