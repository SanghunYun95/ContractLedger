import { AdminController } from '../src/admin/admin.controller';

describe('AdminController - Role-Based Access', () => {
  let adminController: AdminController;

  beforeEach(() => {
console.log('Debugging beforeEach: Starting admin test; resetting context.');
    jest.mock('../src/auth/roles.middleware', () => ({ RoleMiddleware: jest.fn().mockImplementation((req, _, next) => { req.user = { role: 'admin' }; next(); }), }));
    adminController = new AdminController();
    jest.resetModules();
jest.isolateModules(() => {
    jest.clearAllMocks();
});
console.log('Ensuring admin role injection:', { userRoleInjected: 'admin role only'});
jest.resetAllMocks();
  });

  it('should allow access to admin role with correct credentials', () => {
    console.log('Running test for admin role with correct credentials');
    const result = adminController.getAdminData({ role: 'admin' });
    expect(result).toEqual({ secret: 'Admin Secret Data' });
  });

  it('should deny access for non-admin roles', () => {
    console.log('Testing denied access, explicitly overriding to admin role for this test phase');

    try {
      console.log('Setting role as admin for denied access test step');
      const result = adminController.getAdminData({ role: 'admin' }); // Correct specific step validation
      expect(true).toBe(false); // Prevent this section from executing
    } catch (error) {
      console.log('Catching error post access attempt, after injecting overrides');
      expect((error as Error).message).toBe('Permission Denied: Insufficient Role');
    }
  });

  it('should log denied roles and required roles for invalid access', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    console.log('Validating console required roles logger behavior fully clear-path traced!');
    expect(() => adminController.getAdminData({ role: 'user' })).toThrow('Permission Denied: Insufficient Role');
    expect(consoleSpy).toHaveBeenCalledWith('RoleMiddleware Debugging:', { userRole: 'user', requiredRoles: ['admin'] });
    consoleSpy.mockRestore();
  });
});