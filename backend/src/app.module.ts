import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Tenant } from './domain/tenant.entity';
import { User } from './domain/user.entity';
import { AuditLog } from './audit/audit-log.entity';
import { AuditService } from './audit/audit.service';
import { NotificationModule } from './notification/notification.module';
import { AuditController } from './audit/audit.controller';
import { AuthModule } from './auth/auth.module';
import { ContractModule } from './contract/contract.module';
import { Contract } from './domain/contract.entity';
import { JwtModule } from '@nestjs/jwt';
import { StorageModule } from './common/storage/storage.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET, 
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Tenant, User, AuditLog, Contract],
      synchronize: process.env.NODE_ENV === 'development' || process.env.SYNC_DB === 'true', 
    }),
    TypeOrmModule.forFeature([Tenant, User, AuditLog]),
    EventEmitterModule.forRoot(),
    AuthModule,
    ContractModule,
    StorageModule,
    NotificationModule,
  ],
  controllers: [AuditController],
  providers: [
    AuditService, 
  ],
})
export class AppModule {}
