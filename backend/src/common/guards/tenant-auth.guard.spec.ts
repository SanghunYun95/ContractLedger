import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { TenantAuthGuard } from './tenant-auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('TenantAuthGuard', () => {
  let guard: TenantAuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as any;
    guard = new TenantAuthGuard(jwtService);
  });

  it('should throw UnauthorizedException if Authorization header is missing', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          query: {},
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow('Invalid or missing authorization header or token');
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid-token',
          },
          query: {},
        }),
      }),
    } as ExecutionContext;

    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(mockContext)).rejects.toThrow('Invalid or expired token');
  });

  it('should return true and inject context if token is valid', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
        'x-tenant-id': 'header-tenant-id',
      },
      query: {},
    } as any;
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 'user-123',
      tenantId: 'tenant-123',
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.tenantId).toBe('header-tenant-id'); // Header takes precedence in latest logic
    expect(mockRequest.user.sub).toBe('user-123');
  });

  it('should fallback to payload tenantId if header missing tenantId', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
      query: {},
    } as any;
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 'user-123',
      tenantId: 'payload-tenant-id',
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.tenantId).toBe('payload-tenant-id');
  });
});
