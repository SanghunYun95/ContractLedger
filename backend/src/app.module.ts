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
import { AuthModule } from './auth/auth.module';
import { ContractModule } from './contract/contract.module';
import { Contract } from './domain/contract.entity';
import { JwtModule } from '@nestjs/jwt';
import { StorageModule } from './common/storage/storage.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET, // 환경 변수가 정의되어 있지 않으면 NestJS가 시작 시 실패할 수 있도록 폴백 제거
      signOptions: { expiresIn: '1d' },
    }),
    /* 
      보안: 컨트랙트 파일은 ContractController의 인증된 엔드포인트를 통해 서빙되어야 하므로
      ServeStaticModule을 통한 /uploads의 직접적인 노출을 차단합니다.
    */

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Tenant, User, AuditLog, Contract],
      synchronize: process.env.NODE_ENV === 'development' || process.env.SYNC_DB === 'true', // 개발 및 초기 배포 단계에서 테이블 자동 동기화 활성화
    }),
    TypeOrmModule.forFeature([Tenant, User, AuditLog]),
    EventEmitterModule.forRoot(),
    AuthModule,
    ContractModule,
    StorageModule,
  ],
  controllers: [NotificationController, AuditController],
  providers: [
    AuditService, 
    NotificationService,
  ],
})
export class AppModule {}
