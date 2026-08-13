import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC } from './public.decorator';
import { IdentityAuthClient, TokenPayload } from '../clients/identity/identity-auth.client';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly identityAuthClient: IdentityAuthClient,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow access to public routes
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    const payload = await this.validateToken(token);
    const hasRequiredRole = requiredRoles.some(role => payload.roles.includes(role));
    if (!hasRequiredRole) {
      throw new UnauthorizedException('You do not have the required role(s)');
    }

    return true;
  }

  private async validateToken(token: string): Promise<TokenPayload> {
    try {
      const result = await this.identityAuthClient.validateToken(token);
      return this.unwrapPayload(result);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private unwrapPayload(result: any): TokenPayload {
    if (result && result.payload) {
      return result.payload as TokenPayload;
    }
    throw new UnauthorizedException('Invalid token payload');
  }

  private extractTokenFromHeader(request: AuthenticatedRequest): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7); // Remove 'Bearer ' prefix
    }
    return null;
  }
}