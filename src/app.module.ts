import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './common/typeorm.config';
import { AuditModule } from './audit/audit.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuditModule,
    NotificationModule,
  ],
})
export class AppModule {}