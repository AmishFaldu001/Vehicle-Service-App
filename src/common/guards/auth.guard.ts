import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserEntity } from '../../user/entities/user.entity';
import { PUBLIC_ROUTE_METADATA_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  private async isJWTTokenValid(
    token: string,
  ): Promise<{ isTokenValid: boolean; payload: any }> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return { isTokenValid: true, payload };
    } catch (error) {
      Logger.error('auth.guard : Invalid token passed : ' + error);
    }
    return { isTokenValid: false, payload: {} };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: UserEntity }>();

    const isPublicRoute = this.reflector.getAllAndOverride(
      PUBLIC_ROUTE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublicRoute) {
      return true;
    }

    const token = request?.headers?.authorization;
    const { isTokenValid, payload } = await this.isJWTTokenValid(token);

    if (!payload?.user) {
      return false;
    }

    if (isTokenValid) {
      request.user = payload?.user;
      return true;
    }

    return false;
  }
}
