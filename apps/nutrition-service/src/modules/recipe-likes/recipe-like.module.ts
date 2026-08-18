import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { PrismaModule } from '../../prisma/prisma.module';
import { RecipeLikeController } from './recipe-like.controller';
import { RecipeLikeRepository } from './repositories/recipe-like.repository';
import { RecipeLikeService } from './recipe-like.service';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [RecipeLikeController],
  providers: [RecipeLikeService, RecipeLikeRepository],
})
export class RecipeLikeModule {}
