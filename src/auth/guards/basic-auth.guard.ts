import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const credentials = this.extractTokenFromHeader(request);

    if (!credentials) {
      throw new UnauthorizedException('Basic authentication credentials required');
    }

    try {
      const decodedAuth = Buffer.from(credentials, 'base64').toString('utf-8');
      const [username, ...passwordParts] = decodedAuth.split(':');
      const password = passwordParts.join(':');

      const expectedUser = (this.configService.get<string>('BASIC_USER') || 'admin').trim();
      const expectedPass = (this.configService.get<string>('BASIC_PASS') || 'password').trim();

      if (username !== expectedUser || password !== expectedPass) {
        throw new UnauthorizedException('Invalid credentials');
      }

      request['user'] = { username };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ') ?? [];
    return type.toLowerCase() === 'basic' ? token : undefined;
  }
}
