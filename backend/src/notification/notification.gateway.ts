import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim()),
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationGateway');

  @SubscribeMessage('joinTenant')
  handleJoinTenant(client: Socket, tenantId: string): void {
    client.join(`tenant_${tenantId}`);
    this.logger.log(`Client ${client.id} joined room: tenant_${tenantId}`);
  }

  @SubscribeMessage('leaveTenant')
  handleLeaveTenant(client: Socket, tenantId: string): void {
    client.leave(`tenant_${tenantId}`);
    this.logger.log(`Client ${client.id} left room: tenant_${tenantId}`);
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
    this.logger.log(`Client connected: ${client.id}`);
  }
}
