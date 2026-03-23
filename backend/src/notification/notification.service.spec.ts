import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let mockEventEmitter: any;

  beforeEach(async () => {
    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should process webhook and send mock notification for valid payload', async () => {
    const payload = {
      tenantId: 'tenant-123',
      contractId: 'c-999',
      type: 'RISK_DETECTED',
    };

    // Spy on internal mock send method
    // @ts-ignore
    const sendSpy = jest.spyOn(service, 'sendSlackNotification').mockResolvedValue(true);

    const result = await service.processWebhook(payload);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Notification received and audit log queued');
    expect(sendSpy).toHaveBeenCalledWith('tenant-123', payload);
    expect(mockEventEmitter.emit).toHaveBeenCalledWith('audit.log.created', expect.any(Object));
  });

  it('should throw BadRequestException if tenantId is missing', async () => {
    const invalidPayload = {
      eventId: 'evt-001',
      type: 'CONTRACT_EXPIRING',
    };

    await expect(service.processWebhook(invalidPayload)).rejects.toThrow(BadRequestException);
  });
});
