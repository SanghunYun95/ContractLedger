import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async processWebhook(payload: any) {
    if (!payload?.tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    try {
      await this.sendSlackNotification(payload.tenantId, payload);
      this.logger.log(`Mock notification sent to tenant ${payload.tenantId}`);

      // Emit event to create audit log
      this.eventEmitter.emit('audit.log.created', {
        tenantId: payload.tenantId,
        userId: 'ai_agent_01',
        action: 'RISK_DETECTED',
        resourceId: payload.contractId || 'res_default',
        ipAddress: '127.0.0.1',
        details: payload,
      });

      return { success: true, message: 'Notification received and audit log queued' };
    } catch (e) {
      this.logger.error(`Failed to send notification: ${(e as Error).message}`);
      throw new BadRequestException('Notification failed');
    }
  }

  // Mock implementation
  public async sendSlackNotification(tenantId: string, data: any) {
    if (tenantId && data) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}
