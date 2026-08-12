import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ResponseModel } from 'libs/common/response';
import { IdentityClient } from '../../clients/identity.client';
import { Public } from '../../guards/public.decorator';
import { LoginDto, LogoutDto, RefreshTokenRequestDto } from './dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly identityClient: IdentityClient) {}

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto, @Req() request: Request) {
    const result = await this.identityClient.login(loginDto, {
      ip: this.getClientIp(request),
      userAgent: this.getHeader(request.headers['user-agent']) ?? null,
      requestId:
        this.getHeader(request.headers['x-request-id']) ??
        this.getHeader(request.headers['request-id']) ??
        null,
      traceId:
        this.getHeader(request.headers['x-trace-id']) ??
        this.getHeader(request.headers['trace-id']) ??
        null,
    });

    return this.toResponseModel(result);
  }

  @Post('logout')
  @Public()
  async logout(@Body() logoutDto: LogoutDto) {
    const result = await this.identityClient.logout(logoutDto);

    return this.toResponseModel(result);
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenRequestDto,
    @Req() request: Request,
  ) {
    const result = await this.identityClient.refreshToken(refreshTokenDto, {
      ip: this.getClientIp(request),
      userAgent: this.getHeader(request.headers['user-agent']) ?? null,
      requestId:
        this.getHeader(request.headers['x-request-id']) ??
        this.getHeader(request.headers['request-id']) ??
        null,
      traceId:
        this.getHeader(request.headers['x-trace-id']) ??
        this.getHeader(request.headers['trace-id']) ??
        null,
    });

    return this.toResponseModel(result);
  }

  private toResponseModel(data: unknown): ResponseModel {
    const responseModel = new ResponseModel();
    responseModel.setData(data);

    return responseModel;
  }

  private getHeader(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }

  private getClientIp(request: Request): string | null {
    const forwardedFor = this.getHeader(request.headers['x-forwarded-for']);
    if (forwardedFor) {
      return forwardedFor.split(',')[0]?.trim() || null;
    }

    return request.ip ?? request.socket?.remoteAddress ?? null;
  }
}
