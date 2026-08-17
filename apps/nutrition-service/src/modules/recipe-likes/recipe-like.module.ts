import { Module } from '@nestjs/common';
import { RecipeLikeController } from './recipe-like.controller';
import { RecipeLikeRepository } from './repositories/recipe-like.repository';
import { RecipeLikeService } from './recipe-like.service';

@Module({
  controllers: [RecipeLikeController],
  providers: [RecipeLikeService, RecipeLikeRepository],
})
export class RecipeLikeModule {}
