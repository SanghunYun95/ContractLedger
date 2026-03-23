import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiProperty({ description: 'The title of the contract' })
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
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ description: 'The content/body of the contract', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'The status of the contract', enum: ['DRAFT', 'SIGNED', 'EXPIRED'], required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
