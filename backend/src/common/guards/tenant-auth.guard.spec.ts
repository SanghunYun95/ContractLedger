import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TenantAuthGuard } from './tenant-auth.guard';

describe('TenantAuthGuard', () => {
  let guard: TenantAuthGuard;

  beforeEach(() => {
    guard = new TenantAuthGuard();
  });

  it('should throw ForbiddenException if x-tenant-id is missing', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if Authorization header is missing', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-tenant-id': 'tenant-123',
          },
        }),
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should return true and inject tenant context if headers are valid', () => {
    const mockRequest = {
      headers: {
        'x-tenant-id': 'tenant-123',
        authorization: 'Bearer valid-token',
      },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
    // @ts-ignore
    expect(mockRequest.tenantId).toBe('tenant-123'); // Verify context injection
  });
});
