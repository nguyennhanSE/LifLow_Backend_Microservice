import { Module } from '@nestjs/common';
import { LoggerModule } from 'libs/common/logger';
import { AwsModule } from 'libs/object-storage/aws/s3/aws.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { RecipeController } from './recipe.controller';
import { RecipeRepository } from './repositories/recipe.repository';
import { RecipeService } from './recipe.service';

@Module({
  imports: [PrismaModule, LoggerModule, AwsModule],
  controllers: [RecipeController],
  providers: [RecipeService, RecipeRepository],
})
export class RecipeModule {}
