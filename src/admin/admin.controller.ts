import { RoleMiddleware } from '../auth/roles.middleware';

export class AdminController {
  async getAdminData(user: { role: string }) {
    // Check Admin Role
    RoleMiddleware(user.role, ['admin'], () => {
      console.log('Access granted to Admin Data');
    });

    return {
      secret: 'Admin Secret Data',
    };
  }
}