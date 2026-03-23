import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;

    const tenantId = headers['x-tenant-id'];
    const authHeader = headers['authorization'];

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('Invalid authorization header');
    }

    if (typeof tenantId !== 'string' || !tenantId.trim()) {
      throw new ForbiddenException('Invalid tenant identifier');
    }

    // TODO: Verify JWT signature and extract tenantId from claims to prevent spoofing
    // request.tenantId = verifiedTenantId;
    request.tenantId = tenantId.trim();
    
    return true;
  }
}
