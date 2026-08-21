import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { RecipeLikesGrpcController } from '../../grpc/recipe-likes/recipe-likes.grpc.controller';
import { RecipeLikesMessagingController } from '../../messaging/recipe-likes/recipe-likes.messaging.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { RecipeLikeRepository } from './repositories/recipe-like.repository';
import { RecipeLikeService } from './recipe-like.service';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [RecipeLikesMessagingController, RecipeLikesGrpcController],
  providers: [RecipeLikeService, RecipeLikeRepository],
})
export class RecipeLikeModule {}
