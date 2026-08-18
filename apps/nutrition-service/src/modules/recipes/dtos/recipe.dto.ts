import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsMimeType,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { RecipeCategory } from 'libs/prisma/generated/nutrition-service/client';

const toStringArray = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Treat a non-JSON string as a single array value.
    }

    return [value];
  }

  return [String(value)];
};

const emptyStringToUndefined = ({ value }: { value: unknown }): unknown =>
  value === '' || value === null ? undefined : value;

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsEnum(RecipeCategory)
  category!: RecipeCategory;

  @IsOptional()
  @IsDateString()
  dateOfWriting?: string;

  @IsOptional()
  @IsString()
  @IsIn(['approved', 'pending', 'rejected'])
  status?: 'approved' | 'pending' | 'rejected';

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  thumbnailUrl?: string[];

  @IsString()
  @IsNotEmpty()
  content!: string;

  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  ingredients!: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  likes?: number;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  authorId?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUUID('4')
  productId?: string;
}

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsEnum(RecipeCategory)
  category?: RecipeCategory;

  @IsOptional()
  @IsDateString()
  dateOfWriting?: string;

  @IsOptional()
  @IsString()
  @IsIn(['approved', 'pending', 'rejected'])
  status?: 'approved' | 'pending' | 'rejected';

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  thumbnailUrl?: string[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  views?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  likes?: number;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  authorId?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUUID('4')
  productId?: string;
}

export class QueryRecipeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(RecipeCategory)
  category?: RecipeCategory;

  @IsOptional()
  @IsString()
  @IsIn(['approved', 'pending', 'rejected'])
  status?: 'approved' | 'pending' | 'rejected';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  authorId?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUUID('4')
  productId?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  @IsIn(['dateOfWriting', 'createdAt', 'views', 'likes', 'title', 'alphabetical'])
  sortBy?: 'dateOfWriting' | 'createdAt' | 'views' | 'likes' | 'title' | 'alphabetical';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}

export interface RecipeIdPayload {
  id: string;
}

export interface UpdateRecipePayload {
  id: string;
  updateRecipeDto: UpdateRecipeDto;
}

export type SerializedBuffer =
  | Buffer
  | Uint8Array
  | number[]
  | {
      type?: 'Buffer';
      data?: number[];
    };

export class RecipeThumbnailFileMetadataDto {
  @IsOptional()
  @IsString()
  originalname?: string;

  @IsString()
  @IsMimeType()
  mimetype!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size?: number;

  @IsOptional()
  buffer?: SerializedBuffer;

  @IsOptional()
  @IsString()
  base64?: string;
}

export class PatchRecipeThumbnailDto {
  @IsUUID('4')
  recipeId!: string;

  @IsObject()
  fileMetadata!: RecipeThumbnailFileMetadataDto;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  replace?: boolean;
}
