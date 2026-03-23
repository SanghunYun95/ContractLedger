import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLog } from './audit-log.entity';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  @Get('logs')
  @ApiOperation({ summary: 'Get audit logs for the current tenant' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiBearerAuth()
  @UseGuards(TenantAuthGuard)
  async getLogs(@Req() req: any) {
    const tenantId = req.tenantId; // Injected by TenantAuthGuard
    return this.auditLogRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
