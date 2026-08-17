import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { NutritionRequestPayload } from '../../common';
import { RecipeLikeDto } from './dtos/recipe-like.dto';
import { RECIPE_LIKE_PATTERNS } from './patterns/recipe-like.pattern';
import { RecipeLikeService } from './recipe-like.service';

@Controller()
export class RecipeLikeController {
  constructor(private readonly recipeLikeService: RecipeLikeService) {}

  @MessagePattern(RECIPE_LIKE_PATTERNS.toggleRecipeLike)
  toggleRecipeLike(@Payload() payload: NutritionRequestPayload<RecipeLikeDto>) {
    return this.recipeLikeService.toggle(payload.data);
  }
}
