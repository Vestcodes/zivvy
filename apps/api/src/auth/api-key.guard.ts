import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ApiKeyService } from './api-key.service';
import { IS_PUBLIC_KEY } from './decorators';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly reflector: Reflector,
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
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException(
        'Missing X-API-Key header. Obtain a key at https://zivvy.xyz/settings/api.',
      );
    }

    const tenant = await this.apiKeyService.validateKey(apiKey);

    if (!tenant) {
      throw new UnauthorizedException('Invalid API key.');
    }

    // Attach tenant info to the request for downstream use
    (request as any).tenant = tenant;

    return true;
  }
}
