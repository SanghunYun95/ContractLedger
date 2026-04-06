import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';

/**
 * NotificationModule handles real-time updates via WebSockets.
 * Marked as @Global to allow seamless access to NotificationService across different business modules
 * (e.g., ContractModule) for best-effort async notifications.
 */
@Global()
@Module({
  providers: [NotificationService, NotificationGateway],
  controllers: [NotificationController],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
