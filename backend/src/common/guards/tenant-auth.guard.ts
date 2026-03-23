import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;

    const tenantIdFromHeader = headers['x-tenant-id'];
    const authHeader = headers['authorization'];

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid or missing authorization header');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      // Inject identifying info into request
      request.user = payload;
      
      // FOR DEMO/SIMULATION: Prioritize x-tenant-id header to allow UI switching.
      // In production, you should ALWAYS use the tenantId from the validated JWT payload
      // to prevent cross-tenant data leakage.
      request.tenantId = (typeof tenantIdFromHeader === 'string' ? tenantIdFromHeader.trim() : null) || payload.tenantId;

      if (!request.tenantId) {
        throw new ForbiddenException('Tenant context missing');
      }

      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
