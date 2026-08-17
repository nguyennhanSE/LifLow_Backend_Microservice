import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from 'libs/common';
import { AppConfigModule } from 'libs/config';
import { AppQueueModule } from 'libs/queue';
import { nutritionServiceConfig } from './config/nutrition-service.config';
import { RequestInterceptor } from './interceptors/request.interceptor';
import { RecipeModule } from './modules/recipes/recipe.module';
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
  ],
  controllers: [NutritionServiceController],
  providers: [
    NutritionServiceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestInterceptor,
    },
  ],
})
export class NutritionServiceModule {}
