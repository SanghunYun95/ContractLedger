import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../domain/user.entity';
import { Tenant } from '../domain/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
