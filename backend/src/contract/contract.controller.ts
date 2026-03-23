import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors, UploadedFile, StreamableFile, Res, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import * as path from 'path';
import { ContractService } from './contract.service';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';

@Controller('contracts')
@UseGuards(TenantAuthGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('허용되지 않는 파일 형식입니다. (PDF, 이미지 파일만 가능)'), false);
        }
      },
    }),
  )
  create(
    @Req() req: any, 
    @Body() createDto: CreateContractDto, 
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file && !file.buffer && !file.path) {
      throw new BadRequestException('업로드된 파일 데이터가 유효하지 않습니다.');
    }
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

  @Get('download/:id')
  async download(@Param('id') id: string, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const contract = await this.contractService.findOne(id, req.tenantId);
    if (!contract.fileUrl) {
      throw new BadRequestException('해당 계약서에 첨부된 파일이 없습니다.');
    }

    // 파일 경로 보안 결합: /uploads/... 형태의 상대 경로를 실제 절대 경로로 변환
    const relativePath = contract.fileUrl.replace(/^\/?uploads\//, '');
    const absolutePath = path.resolve(process.cwd(), 'uploads', relativePath);

    if (!existsSync(absolutePath)) {
      throw new BadRequestException('파일을 서버에서 찾을 수 없습니다.');
    }

    const fileStream = createReadStream(absolutePath);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(contract.originalFileName || 'contract-file')}"`,
    });

    return new StreamableFile(fileStream);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateContractDto, 
    @Req() req: any
  ) {
    return this.contractService.update(id, updateDto, req.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.contractService.remove(id, req.tenantId);
  }
}
