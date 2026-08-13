import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { IS_PUBLIC } from './public.decorator';
import { ROLES_KEY } from './roles.decorator';
import { TokenPayload } from '../clients/identity/identity-auth.client';

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow access to public routes
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const payload = request.user;
    if (!payload) {
      throw new UnauthorizedException('User is not authenticated');
    }

    const hasRequiredRole = requiredRoles.some((role) =>
      payload.roles.includes(role),
    );
    if (!hasRequiredRole) {
      throw new ForbiddenException('You do not have the required role(s)');
    }

    return true;
  }
}
