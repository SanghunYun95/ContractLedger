import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';
import { JwtService } from '@nestjs/jwt';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  
  // 소켓(Socket) 객체 모킹
  let mockSocket: any;
  // 서버(Server) 객체 모킹
  let mockServer: any;
  let mockTo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        {
          provide: JwtService,
          useValue: { verify: jest.fn() },
        },
      ],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);

    // 모의 객체 초기화
    mockSocket = {
      id: 'test-client-id',
      join: jest.fn(),
      leave: jest.fn(),
      data: {}, // 테넌트 ID 등 세션 정보가 저장될 객체
      handshake: { auth: {}, query: {} },
      disconnect: jest.fn(),
    };

    mockTo = {
      emit: jest.fn(),
    };

    mockServer = {
      to: jest.fn().mockReturnValue(mockTo),
    };

    // 모킹된 서버 주입
    gateway.server = mockServer;
  });

  it('게이트웨이가 정의되어 있어야 함', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleJoinTenant', () => {
    it('클라이언트 데이터의 테넌트 ID를 기반으로 올바른 룸에 접속해야 함', () => {
      mockSocket.data.tenantId = 'uuid-tenant-123';
      gateway.handleJoinTenant(mockSocket);
      expect(mockSocket.join).toHaveBeenCalledWith('tenant_uuid-tenant-123');
    });

    it('테넌트 ID가 없으면 룸 접속을 무시해야 함', () => {
      mockSocket.data.tenantId = undefined;
      gateway.handleJoinTenant(mockSocket);
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });

  describe('handleLeaveTenant', () => {
    it('클라이언트 데이터의 테넌트 ID를 기반으로 룸에서 나가야 함', () => {
      mockSocket.data.tenantId = 'uuid-tenant-123';
      gateway.handleLeaveTenant(mockSocket);
      expect(mockSocket.leave).toHaveBeenCalledWith('tenant_uuid-tenant-123');
    });
  });

  describe('sendNotification', () => {
    it('지정된 테넌트 룸으로 이벤트를 전송해야 함', () => {
      const tenantId = 'test-tenant';
      const eventName = 'contract_analysis_done';
      const payload = { success: true, riskScore: 80 };

      gateway.sendNotification(tenantId, eventName, payload);

      expect(mockServer.to).toHaveBeenCalledWith('tenant_test-tenant');
      expect(mockTo.emit).toHaveBeenCalledWith(eventName, payload);
    });
  });
});
