import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { NutritionRequestPayload } from '../../common';
import { RecipeLikeDto } from '../../modules/recipe-likes/dtos/recipe-like.dto';
import { RecipeLikeService } from '../../modules/recipe-likes/recipe-like.service';
import { RECIPE_LIKE_PATTERNS } from './recipe-likes.pattern';

@Controller()
export class RecipeLikesMessagingController {
  constructor(private readonly recipeLikeService: RecipeLikeService) {}

  @MessagePattern(RECIPE_LIKE_PATTERNS.toggleRecipeLike)
  toggleRecipeLike(@Payload() payload: NutritionRequestPayload<RecipeLikeDto>) {
    return this.recipeLikeService.toggle(payload.data);
  }
}
