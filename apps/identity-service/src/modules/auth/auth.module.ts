import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from 'libs/common/logger';
import { AppConfigModule, jwtConfig } from 'libs/config';
import { AuthGrpcController } from '../../grpc/auth/auth.grpc.controller';
import { AuthMessagingController } from '../../messaging/auth/auth.messaging.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';

@Module({
  imports: [
    LoggerModule,
    AppConfigModule.forFeature([jwtConfig]),
    JwtModule.register({}),
    PrismaModule,
    UsersModule,
  ],
  controllers: [AuthMessagingController, AuthGrpcController],
  providers: [AuthService, AuthRepository],
  exports: [AuthService],
})
export class AuthModule {}
