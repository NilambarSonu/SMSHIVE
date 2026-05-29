import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    if (typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new UnauthorizedException('Invalid API key format');
    }

    // The actual key validation is handled by middleware or
    // can be enhanced to inject ApiKeysService when the module is available.
    // For now, we attach the raw key to the request for downstream validation.
    (request as Record<string, unknown>)['apiKey'] = apiKey;

    this.logger.debug(`API key authentication attempted with prefix: ${apiKey.substring(0, 8)}...`);

    return true;
  }
}
