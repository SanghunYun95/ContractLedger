import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContractService } from './contract.service';
import { Contract } from '../domain/contract.entity';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { Response } from 'express';

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

  // GCS 파일 다운로드 프록시 엔드포인트
  @Get('download/:tenantId/:fileName')
  async download(
    @Param('tenantId') tenantId: string,
    @Param('fileName') fileName: string,
    @Res() res: Response
  ) {
    const filePath = `${tenantId}/${fileName}`;
    const stream = await this.contractService.getFileStream(filePath);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    stream.pipe(res);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.contractService.findOne(id, req.tenantId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string, 
    @Body() updateDto: Partial<Contract>, 
    @Req() req: any,
    @UploadedFile() file?: any
  ) {
    return this.contractService.update(id, updateDto, req.tenantId, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.contractService.remove(id, req.tenantId);
  }

  @Post(':id/analyze')
  analyze(@Param('id') id: string, @Req() req: any) {
    return this.contractService.analyze(id, req.tenantId);
  }
}
