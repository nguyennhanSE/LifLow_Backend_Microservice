import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ResponseModel } from 'libs/common/response';

import { Public } from '../../guards/public.decorator';
import { LoginDto, LogoutDto, RefreshTokenRequestDto } from './dtos/auth.dto';
import { AuthGrpcService } from '../../grpc/auth/auth.grpc.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authGrpcService: AuthGrpcService) {}

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto, @Req() request: Request) {
    const result = await this.authGrpcService.login(loginDto, request.metadata);

    return this.toResponseModel(result);
  }

  @Post('logout')
  @Public()
  async logout(@Body() logoutDto: LogoutDto, @Req() request: Request) {
    const result = await this.authGrpcService.logout(
      logoutDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenRequestDto,
    @Req() request: Request,
  ) {
    const result = await this.authGrpcService.refreshToken(
      refreshTokenDto,
      request.metadata,
    );

    return this.toResponseModel(result);
  }

  private toResponseModel(data: unknown): ResponseModel {
    const responseModel = new ResponseModel();
    responseModel.setData(data);

    return responseModel;
  }
}
