import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { AwsModule } from 'libs/object-storage/aws/s3/aws.module';
import { RecipesGrpcController } from '../../grpc/recipes/recipes.grpc.controller';
import { RecipesMessagingController } from '../../messaging/recipes/recipes.messaging.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { RecipeRepository } from './repositories/recipe.repository';
import { RecipeService } from './recipe.service';

@Module({
  imports: [PrismaModule, LoggerModule, AwsModule],
  controllers: [RecipesMessagingController, RecipesGrpcController],
  providers: [RecipeService, RecipeRepository],
})
export class RecipeModule {}
