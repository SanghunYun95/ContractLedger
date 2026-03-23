import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContractService } from './contract.service';
import { Contract } from '../domain/contract.entity';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';

@Controller('contracts')
@UseGuards(TenantAuthGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@Req() req: any, @Body() createDto: any, @UploadedFile() file?: any) {
    return this.contractService.create(req.tenantId, createDto, file);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.contractService.findAll(req.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.contractService.findOne(id, req.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<Contract>, @Req() req: any) {
    return this.contractService.update(id, updateDto, req.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.contractService.remove(id, req.tenantId);
  }
}
