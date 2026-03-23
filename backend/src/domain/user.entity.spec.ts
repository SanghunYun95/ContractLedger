import { User } from './user.entity';

describe('User Entity', () => {
  it('should be created with required properties and associated to a tenant', () => {
    const user = new User();
    user.id = 'user-456';
    user.email = 'test@testcompany.com';
    user.tenantId = 'tenant-123';

    expect(user).toBeDefined();
    expect(user.id).toBe('user-456');
    expect(user.tenantId).toBe('tenant-123');
  });
});
