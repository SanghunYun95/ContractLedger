import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditAction } from '../common/audit-action.enum';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async processWebhook(payload: any) {
    if (!payload?.tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const { tenantId, contractId, ...details } = payload;
    const resourceId = contractId || 'res_default';

    // Attempt notification; errors are caught and logged but do not throw further.
    try {
      await this.sendSlackNotification(tenantId, payload);
      this.logger.log(`Notification sent to tenant ${tenantId}`);
    } catch (e) {
      this.logger.error(`Notification failed for tenant ${tenantId}: ${(e as Error).message}`);
    }

    // Always emit the audit log event if tenantId is present.
    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId: 'ai_agent_01',
      action: AuditAction.RISK_DETECTED,
      resourceId,
      ipAddress: '127.0.0.1',
      details,
    });

    return { 
      success: true, 
      message: 'Processed risk detection; audit log recorded.',
      tenantId,
      resourceId
    };
  }

  // Mock implementation
  public async sendSlackNotification(tenantId: string, data: any) {
    if (tenantId && data) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}
