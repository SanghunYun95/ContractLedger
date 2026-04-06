import { Controller, Get, UseGuards, Req, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get audit logs for the current tenant with pagination' })
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @UseGuards(TenantAuthGuard)
  async getLogs(
    @Req() req: any,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('action') action?: string,
  ) {
    const tenantId = req.tenantId; // Injected by TenantAuthGuard
    const where: any = { tenantId };
    if (action) {
      where.action = action;
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 200),
      skip: offset,
    });
    return { data, total, limit, offset };
  }
}
