import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RecipeLikeDto {
  @IsString()
  @IsNotEmpty()
  authorId!: string;

  @IsUUID('4')
  @IsNotEmpty()
  recipeId!: string;
}
