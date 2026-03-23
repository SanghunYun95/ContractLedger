import { Tenant } from './tenant.entity';

describe('Tenant Entity', () => {
  it('should be created with required properties', () => {
    const tenant = new Tenant();
    tenant.id = 'tenant-123';
    tenant.name = 'Test Company';
    tenant.createdAt = new Date();

    expect(tenant).toBeDefined();
    expect(tenant.id).toBe('tenant-123');
    expect(tenant.name).toBe('Test Company');
  });
});
