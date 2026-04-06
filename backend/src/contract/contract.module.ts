import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from '../domain/contract.entity';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { AiService } from './ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract]),
  ],
  controllers: [ContractController],
  providers: [ContractService, AiService],
  exports: [ContractService, AiService],
})
export class ContractModule {}
