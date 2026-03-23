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
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
      }),
    } as ExecutionContext;

    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true and inject context if token is valid', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
        'x-tenant-id': 'header-tenant-id',
      },
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
    expect(mockRequest.tenantId).toBe('tenant-123'); // From payload
    expect(mockRequest.user.sub).toBe('user-123');
  });

  it('should fallback to header tenantId if payload missing tenantId', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
        'x-tenant-id': 'header-tenant-id',
      },
    } as any;
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 'user-123',
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest.tenantId).toBe('header-tenant-id');
  });
});
