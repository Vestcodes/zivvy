import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from '../interfaces/tenant-context.interface';

export const TENANT_KEY = 'tenant';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenant: TenantContext | undefined = request.tenant;

    if (!tenant) {
      throw new UnauthorizedException(
        'Tenant context not found. Ensure the API key guard is active.',
      );
    }

    return next.handle();
  }
}
