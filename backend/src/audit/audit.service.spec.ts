import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn().mockImplementation(dto => dto),
      save: jest.fn().mockImplementation(log => Promise.resolve({ id: 'mock-id', ...log })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it('should save audit log when handleAuditLogEvent is called', async () => {
    const payload = {
      tenantId: 'tenant-123',
      userId: 'user-456',
      action: 'TEST_ACTION',
      resourceId: 'res-789',
      details: { foo: 'bar' },
      ipAddress: '127.0.0.1',
    };

    await service.handleAuditLogEvent(payload);

    expect(mockRepository.create).toHaveBeenCalledWith(payload);
    expect(mockRepository.save).toHaveBeenCalled();
  });
});
