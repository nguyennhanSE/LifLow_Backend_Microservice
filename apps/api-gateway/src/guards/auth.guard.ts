import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC } from './public.decorator';
import {
  IdentityAuthClient,
  TokenPayload,
} from '../clients/identity/identity-auth.client';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly identityAuthClient: IdentityAuthClient,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<string>() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (isPublic) {
      if (token) {
        await this.attachUserIfTokenIsValid(request, token);
      }

      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    const payload = await this.validateToken(token);
    request.user = payload;

    return true;
  }

  private async attachUserIfTokenIsValid(
    request: AuthenticatedRequest,
    token: string,
  ) {
    try {
      request.user = await this.validateToken(token);
    } catch {
      request.user = undefined;
    }
  }

  private async validateToken(token: string): Promise<TokenPayload> {
    try {
      const result = await this.identityAuthClient.validateToken(token);
      return this.unwrapPayload(result);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private unwrapPayload(result: unknown): TokenPayload {
    if (this.isTokenPayload(result)) {
      return result;
    }

    if (
      result &&
      typeof result === 'object' &&
      'data' in result &&
      this.isTokenPayload(result.data)
    ) {
      return result.data;
    }

    throw new UnauthorizedException('Invalid token payload');
  }

  private isTokenPayload(value: unknown): value is TokenPayload {
    return (
      !!value &&
      typeof value === 'object' &&
      'sub' in value &&
      typeof value.sub === 'string'
    );
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
