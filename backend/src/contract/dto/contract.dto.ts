import { IsString, IsOptional, MaxLength, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ContractStatus {
  DRAFT = 'DRAFT',
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
}

export class CreateContractDto {
  @ApiProperty({ description: 'The title of the contract' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'The content/body of the contract', required: false })
  @IsOptional()
  @IsString()
  content?: string;
}

export class UpdateContractDto {
  @ApiProperty({ description: 'The title of the contract', required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ description: 'The content/body of the contract', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'The status of the contract', enum: ContractStatus, required: false })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}
