import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as path from 'path';
import { Tenant } from './domain/tenant.entity';
import { User } from './domain/user.entity';
import { AuditLog } from './audit/audit-log.entity';
import { AuditService } from './audit/audit.service';
import { NotificationService } from './notification/notification.service';
import { NotificationController } from './notification/notification.controller';
import { AuditController } from './audit/audit.controller';
import { AuthModule } from './auth/auth.module';
import { ContractModule } from './contract/contract.module';
import { Contract } from './domain/contract.entity';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { StorageService } from './common/services/storage.service';
import { DiskStorageService } from './common/services/disk-storage.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-secret-key', // Use fallback only for dev if needed, or remove completely
      signOptions: { expiresIn: '1d' },
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Tenant, User, AuditLog, Contract],
      synchronize: process.env.NODE_ENV !== 'production', // Development only
    }),
    TypeOrmModule.forFeature([Tenant, User, AuditLog]),
    EventEmitterModule.forRoot(),
    AuthModule,
    ContractModule,
  ],
  controllers: [NotificationController, AuditController],
  providers: [
    AuditService, 
    NotificationService,
    {
      provide: StorageService,
      useClass: DiskStorageService,
    },
  ],
  exports: [StorageService],
})
export class AppModule {}
