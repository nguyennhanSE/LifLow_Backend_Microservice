import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AppLogger } from 'libs/common/logger';
import { AppConfigService } from 'libs/config';
import { TokenType } from './enums';
import { UsersService } from '../users/users.service';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenRequestDto,
  TokenPayload,
} from './dtos/auth.dto';
import { AuthRepository } from './repositories/auth.repository';

@Injectable()
export class AuthService {
  private readonly context = AuthService.name;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
    private readonly configService: AppConfigService,
    private readonly logger: AppLogger,
  ) {}

  async login(dto: LoginDto) {
    const { username: account, password, rememberMe, ip } = dto;
    if (!account) {
      throw new BadRequestException('Username is required');
    }

    const user = await this.usersService.getUserByAccount(account);
    if (!user?.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = await this.usersService.getUserRoles(user.id);
    const accessTokenPayload = this.createTokenPayload(
      user.id,
      TokenType.AccessToken,
      account,
      user.email ?? undefined,
      roles,
    );
    const refreshTokenPayload = this.createTokenPayload(
      user.id,
      TokenType.RefreshToken,
      account,
      user.email ?? undefined,
      roles,
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.authRepository.generateToken(accessTokenPayload, {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>(
          'jwt.accessTokenExpiresIn',
          '1d',
        ) as JwtSignOptions['expiresIn'],
      }),
      this.authRepository.generateToken(refreshTokenPayload, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>(
          'jwt.refreshTokenExpiresIn',
          '7d',
        ) as JwtSignOptions['expiresIn'],
      }),
    ]);

    await this.authRepository.storeToken(
      refreshToken,
      { secret: this.configService.getOrThrow<string>('jwt.refreshSecret') },
      ip,
    );

    this.logger.debug(`[${this.context}] login done`, {
      account,
      rememberMe,
    });

    return {
      user: {
        email: user.email,
        name: user.name,
        id: user.id,
        account,
        roles,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(dto: LogoutDto) {
    const { refreshToken } = dto;
    if (!refreshToken) {
      throw new BadRequestException('Missing refresh token');
    }

    const foundSession = await this.authRepository.findToken(refreshToken);
    if (!foundSession) {
      throw new UnauthorizedException('Your session is out. Please login again');
    }

    await this.authRepository.deleteToken(refreshToken);
    return { success: true };
  }

  async refreshToken(dto: RefreshTokenRequestDto) {
    const { refreshToken, ip } = dto;
    if (!refreshToken) {
      throw new BadRequestException('Missing refresh token');
    }

    const refreshSecret =
      this.configService.getOrThrow<string>('jwt.refreshSecret');
    const accessSecret =
      this.configService.getOrThrow<string>('jwt.accessSecret');

    if (await this.authRepository.isRefreshTokenUsed(refreshToken)) {
      const decoded = await this.authRepository.decodeToken(refreshToken, {
        secret: refreshSecret,
      });
      await this.authRepository.removeAllSessionOfUser(decoded.sub);
      throw new UnauthorizedException(
        'Refresh token already used. Please login again',
      );
    }

    const decoded = await this.authRepository.decodeToken(refreshToken, {
      secret: refreshSecret,
    });
    const availableToken = await this.authRepository.findToken(refreshToken);
    if (!availableToken) {
      throw new NotFoundException('Session not found');
    }

    const user = decoded.username
      ? await this.usersService.getUserByAccount(decoded.username)
      : decoded.email
        ? await this.usersService.getUserByEmail(decoded.email)
        : null;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.usersService.getUserRoles(user.id);
    const accessTokenPayload = this.createTokenPayload(
      decoded.sub,
      TokenType.AccessToken,
      decoded.username ?? user.id,
      user.email ?? undefined,
      roles,
    );
    const refreshTokenPayload = this.createTokenPayload(
      decoded.sub,
      TokenType.RefreshToken,
      decoded.username ?? user.id,
      user.email ?? undefined,
      roles,
    );

    const [accessToken, newRefreshToken] = await Promise.all([
      this.authRepository.generateToken(accessTokenPayload, {
        secret: accessSecret,
        expiresIn: this.configService.get<string>(
          'jwt.accessTokenExpiresIn',
          '1d',
        ) as JwtSignOptions['expiresIn'],
      }),
      this.authRepository.generateToken(refreshTokenPayload, {
        secret: refreshSecret,
        expiresIn: this.configService.get<string>(
          'jwt.refreshTokenExpiresIn',
          '7d',
        ) as JwtSignOptions['expiresIn'],
      }),
    ]);

    await this.authRepository.updateToken(
      newRefreshToken,
      { secret: refreshSecret },
      availableToken.id,
      ip,
    );
    await this.authRepository.markRefreshTokenUsed(
      refreshToken,
      availableToken.id,
    );

    return { accessToken, newRefreshToken, userId: decoded.sub };
  }

  async validateToken(token: string): Promise<TokenPayload> {
    const decoded = await this.authRepository.decodeToken(token, {
      secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
    });

    if (decoded.tokenType !== TokenType.AccessToken) {
      throw new UnauthorizedException('Invalid token type');
    }

    return decoded;
  }

  private createTokenPayload(
    sub: string,
    tokenType: TokenType,
    username: string,
    email: string | undefined,
    roles: string[],
  ): TokenPayload {
    return {
      sub,
      tokenType,
      username,
      email,
      roles,
    };
  }
}
