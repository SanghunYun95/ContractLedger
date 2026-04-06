import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(/[;,]/).map(o => o.trim()).filter(Boolean),
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationGateway');
  constructor(private readonly jwtService: JwtService) {}

  @SubscribeMessage('joinTenant')
  handleJoinTenant(client: Socket): void {
    const tenantId = client.data.tenantId;
    if (!tenantId) {
      this.logger.warn(`Client ${client.id} tried to join room without valid tenantId`);
      return;
    }
    client.join(`tenant_${tenantId}`);
    this.logger.log(`Client ${client.id} joined room: tenant_${tenantId}`);
  }

  @SubscribeMessage('leaveTenant')
  handleLeaveTenant(client: Socket): void {
    const tenantId = client.data.tenantId;
    if (tenantId) {
      client.leave(`tenant_${tenantId}`);
      this.logger.log(`Client ${client.id} left room: tenant_${tenantId}`);
    }
  }

  sendNotification(tenantId: string, event: string, payload: any) {
    this.server.to(`tenant_${tenantId}`).emit(event, payload);
    this.logger.log(`Sent ${event} to tenant_${tenantId}`);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    try {
      // 쿼리 스트링이나 handshake.auth에서 토큰 추출
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.tenantId = payload.tenantId;
      client.data.userId = payload.sub;
      
      this.logger.log(`Client connected: ${client.id} (tenant: ${client.data.tenantId})`);
    } catch (error) {
      this.logger.warn(`Client ${client.id} connection rejected: Invalid token`);
      client.disconnect();
    }
  }
}
