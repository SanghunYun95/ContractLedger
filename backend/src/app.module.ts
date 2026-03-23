import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Tenant } from './domain/tenant.entity';
import { User } from './domain/user.entity';
import { AuditLog } from './audit/audit-log.entity';
import { AuditService } from './audit/audit.service';
import { NotificationService } from './notification/notification.service';
import { NotificationController } from './notification/notification.controller';
import { AuditController } from './audit/audit.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Tenant, User, AuditLog],
      synchronize: process.env.NODE_ENV !== 'production', // Development only
    }),
    TypeOrmModule.forFeature([Tenant, User, AuditLog]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [NotificationController, AuditController],
  providers: [AuditService, NotificationService],
})
export class AppModule {}
