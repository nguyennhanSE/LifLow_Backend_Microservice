import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { AppLogger } from 'libs/common/logger';
import type { Session } from 'libs/prisma/generated/identity-service/client';
import { RefreshTokenDto, TokenPayload } from '../dtos/auth.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  private readonly context = AuthRepository.name;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  generateToken(
    payload: TokenPayload,
    options: JwtSignOptions,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, options);
  }

  decodeToken(
    token: string,
    options: JwtVerifyOptions,
  ): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token, options);
  }

  async storeToken(
    token: string,
    options: JwtVerifyOptions,
    ip?: string,
  ): Promise<RefreshTokenDto> {
    const { sub, exp } = await this.decodeToken(token, options);
    const expiredAt = this.expToDate(exp);

    await this.prisma.session.deleteMany({ where: { refreshToken: token } });

    const created = await this.prisma.session.create({
      data: { userId: sub, refreshToken: token, expiredAt, ip },
    });

    return this.toDto(created);
  }

  async updateToken(
    token: string,
    options: JwtVerifyOptions,
    id: string,
    ip?: string,
  ): Promise<RefreshTokenDto> {
    const { sub, exp } = await this.decodeToken(token, options);
    const expiredAt = this.expToDate(exp);

    const updated = await this.prisma.session.update({
      where: { id },
      data: { userId: sub, refreshToken: token, expiredAt, ip },
    });

    return this.toDto(updated);
  }

  async findToken(token: string): Promise<RefreshTokenDto | null> {
    const found = await this.prisma.session.findFirst({
      where: { refreshToken: token },
    });

    return found ? this.toDto(found) : null;
  }

  async deleteToken(token: string): Promise<void> {
    await this.prisma.session.delete({ where: { refreshToken: token } });
  }

  async removeAllSessionOfUser(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async markRefreshTokenUsed(
    refreshToken: string,
    sessionId: string,
  ): Promise<void> {
    try {
      await this.prisma.refreshTokenUsed.create({
        data: { refreshToken, sessionId },
      });
    } catch (error) {
      this.logger.warn(
        `[${this.context}] markRefreshTokenUsed skipped or failed`,
        error,
      );
    }
  }

  async isRefreshTokenUsed(refreshToken: string): Promise<boolean> {
    const refreshTokenUsed = await this.prisma.refreshTokenUsed.findFirst({
      where: { refreshToken },
    });

    return !!refreshTokenUsed;
  }

  private expToDate(exp?: number): Date {
    if (!exp) {
      throw new Error('Invalid token payload: missing exp');
    }

    return new Date(exp * 1000);
  }

  private toDto(session: Session): RefreshTokenDto {
    return {
      id: session.id,
      refreshToken: session.refreshToken,
      ip: session.ip ?? undefined,
    };
  }
}
