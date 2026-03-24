import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;
    const query = request.query;

    const tenantIdFromHeader = headers['x-tenant-id'];
    const tenantIdFromQuery = query['tenantId'];
    
    const authHeaderRaw = headers['authorization'];
    
    // 중복 Authorization 헤더는 보안상 위험하므로 명시적으로 거절합니다.
    if (Array.isArray(authHeaderRaw) && authHeaderRaw.length !== 1) {
      throw new UnauthorizedException('Ambiguous authorization header');
    }
    
    const authHeader = Array.isArray(authHeaderRaw) ? authHeaderRaw[0] : authHeaderRaw;
    const tokenFromQuery = query['token'];
 
    let token: string | undefined;
 
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (typeof tokenFromQuery === 'string') {
      token = tokenFromQuery;
    }

    if (!token) {
      throw new UnauthorizedException('Invalid or missing authorization header or token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      // Inject identifying info into request
      request.user = payload;
      
      const requestedTenantId =
        (typeof tenantIdFromHeader === 'string' ? tenantIdFromHeader.trim() : 
         typeof tenantIdFromQuery === 'string' ? tenantIdFromQuery.trim() : undefined);
      
      // DEMO MODE: If requestedTenantId is provided in header or query, we use it as the context.
      // In a real production app, we would verify if the user has permission for this tenant.
      request.tenantId = requestedTenantId || payload.tenantId;

      if (!request.tenantId) {
        throw new ForbiddenException('Tenant context missing');
      }

      return true;
    } catch (e) {
      if (e instanceof ForbiddenException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
