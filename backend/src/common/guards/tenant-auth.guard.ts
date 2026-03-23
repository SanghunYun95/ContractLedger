import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;

    const tenantId = headers['x-tenant-id'];
    const authHeader = headers['authorization'];

    if (!tenantId || !authHeader) {
      throw new ForbiddenException('Invalid tenant or authorization');
    }

    // Injecting the tenant context into the request
    request.tenantId = tenantId;
    
    return true;
  }
}
