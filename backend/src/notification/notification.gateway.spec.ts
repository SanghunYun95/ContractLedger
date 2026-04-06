import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  
  // Mocking the Socket object
  let mockSocket: any;
  // Mocking the Server object
  let mockServer: any;
  let mockTo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationGateway],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);

    // Initialize mocks
    mockSocket = {
      id: 'test-client-id',
      join: jest.fn(),
      leave: jest.fn(),
    };

    mockTo = {
      emit: jest.fn(),
    };

    mockServer = {
      to: jest.fn().mockReturnValue(mockTo),
    };

    // Injection of mocked server
    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleJoinTenant', () => {
    it('should join the correct tenant room', () => {
      gateway.handleJoinTenant(mockSocket, 'uuid-tenant-123');
      expect(mockSocket.join).toHaveBeenCalledWith('tenant_uuid-tenant-123');
    });
  });

  describe('handleLeaveTenant', () => {
    it('should leave the correct tenant room', () => {
      gateway.handleLeaveTenant(mockSocket, 'uuid-tenant-123');
      expect(mockSocket.leave).toHaveBeenCalledWith('tenant_uuid-tenant-123');
    });
  });

  describe('sendNotification', () => {
    it('should emit the test payload to the specific tenant room', () => {
      const tenantId = 'test-tenant';
      const eventName = 'contract_analysis_done';
      const payload = { success: true, riskScore: 80 };

      gateway.sendNotification(tenantId, eventName, payload);

      expect(mockServer.to).toHaveBeenCalledWith('tenant_test-tenant');
      expect(mockTo.emit).toHaveBeenCalledWith(eventName, payload);
    });
  });
});
