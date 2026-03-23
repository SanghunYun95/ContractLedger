import { AuditLog } from './audit-log.entity';

describe('AuditLog Entity', () => {
  it('should be created with correct audit properties', () => {
    const log = new AuditLog();
    log.id = 'log-789';
    log.tenantId = 'tenant-123';
    log.userId = 'user-456';
    log.action = 'CREATE_CONTRACT';
    log.resourceId = 'contract-001';
    log.details = { risk: 'low' };
    log.ipAddress = '192.168.1.1';
    log.createdAt = new Date();

    expect(log).toBeDefined();
    expect(log.tenantId).toBe('tenant-123');
    expect(log.action).toBe('CREATE_CONTRACT');
  });
});
