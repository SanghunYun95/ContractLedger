import { RoleMiddleware } from '../../src/auth/roles.middleware';

describe('RoleMiddleware - Role-Based Access', () => {
  it('should allow access for the exact required role', () => {
    expect(() =>
      RoleMiddleware('admin', ['admin'], () => {})
    ).not.toThrow();
  });

  it('should allow access for roles higher in hierarchy', () => {
    expect(() =>
      RoleMiddleware('superadmin', ['admin'], () => {})
    ).not.toThrow();
  });

  it('should deny access for roles lower in hierarchy', () => {
    expect(() =>
      RoleMiddleware('user', ['admin'], () => {})
    ).toThrow('Permission Denied: Insufficient Role');
  });

  it('should deny access for completely unrelated roles', () => {
    expect(() =>
      RoleMiddleware('user', ['superadmin'], () => {})
    ).toThrow('Permission Denied: Insufficient Role');
  });
});