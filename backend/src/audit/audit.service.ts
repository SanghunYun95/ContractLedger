import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  @OnEvent('audit.log.created')
  async handleAuditLogEvent(payload: Partial<AuditLog>) {
    const auditLog = this.auditLogRepository.create(payload);
    await this.auditLogRepository.save(auditLog);
  }
}
