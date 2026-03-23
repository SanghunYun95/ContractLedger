import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Receive AI Agent Webhook' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @UseGuards(TenantAuthGuard)
  async handleWebhook(@Body() payload: any, @Req() req: any) {
    // Inject tenantId from guard into payload handled by the service
    const tenantId = req.tenantId;
    return this.notificationService.processWebhook({ ...payload, tenantId });
  }
}
