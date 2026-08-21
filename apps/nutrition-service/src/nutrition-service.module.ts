import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from 'libs/common';
import { AppConfigModule } from 'libs/config';
import { AwsModule } from 'libs/object-storage/aws/s3/aws.module';
import { AppQueueModule } from 'libs/queue';
import { nutritionServiceConfig } from './config/nutrition-service.config';
import { NutritionHealthGrpcController } from './grpc/health/health.grpc.controller';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { RecipeLikeModule } from './modules/recipe-likes/recipe-like.module';
import { RecipeModule } from './modules/recipes/recipe.module';
import { VideoModule } from './modules/videos/video.module';
import { NutritionServiceController } from './nutrition-service.controller';
import { NutritionServiceService } from './nutrition-service.service';
import { PrismaModule } from './prisma/prisma.module';
import { NutritionQueueModule } from './queue/nutrition-queue.module';

@Module({
  imports: [
    AppConfigModule.forFeature([nutritionServiceConfig]),
    CommonModule,
    AppQueueModule.forRoot(),
    PrismaModule,
    NutritionQueueModule,
    RecipeModule,
    RecipeLikeModule,
    VideoModule,
    AwsModule,
  ],
  controllers: [NutritionServiceController, NutritionHealthGrpcController],
  providers: [
    NutritionServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class NutritionServiceModule {}
