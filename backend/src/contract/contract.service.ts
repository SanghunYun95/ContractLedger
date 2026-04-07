import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../domain/contract.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StorageService } from '../common/services/storage.service';
import { AuditAction } from '../common/audit-action.enum';
import { AiService } from './ai.service';
import { NotificationService } from '../notification/notification.service';
import { Readable } from 'stream';

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);

  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly eventEmitter: EventEmitter2,
    private readonly storageService: StorageService,
    private readonly aiService: AiService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(tenantId: string, contractData: Partial<Contract>, file?: any): Promise<Contract> {
    const contract = this.contractRepository.create({
      status: 'DRAFT',
      ...contractData,
      tenantId,
    });

    if (file) {
      const { url, fileName } = await this.storageService.uploadFile(file, tenantId);
      contract.fileUrl = url;
      contract.originalFileName = fileName;
    }

    const saved = await this.contractRepository.save(contract);
    
    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId: 'system',
      action: AuditAction.CREATE_CONTRACT,
      resourceId: saved.id,
      details: { title: saved.title, hasFile: !!file },
    });

    return saved;
  }

  async findAll(tenantId: string): Promise<Contract[]> {
    return this.contractRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id, tenantId },
    });
    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found for this tenant`);
    }
    return contract;
  }

  async update(id: string, updateData: Partial<Contract>, tenantId: string, file?: any): Promise<Contract> {
    console.log(`[ContractService] Updating contract ${id} for tenant ${tenantId}`, updateData);
    try {
      const contract = await this.findOne(id, tenantId);
      
      if (file) {
        if (contract.fileUrl) {
          await this.storageService.deleteFile(contract.fileUrl);
        }
        const { url, fileName } = await this.storageService.uploadFile(file, tenantId);
        contract.fileUrl = url;
        contract.originalFileName = fileName;
      }

      Object.assign(contract, updateData);
      const updated = await this.contractRepository.save(contract);

      this.eventEmitter.emit('audit.log.created', {
        tenantId,
        userId: 'system',
        action: AuditAction.UPDATE_CONTRACT,
        resourceId: updated.id,
        details: { title: updated.title, updatedFields: Object.keys(updateData || {}) },
      });

      return updated;
    } catch (err) {
      console.error(`[ContractService] Failed to update contract ${id}:`, err);
      throw err;
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const contract = await this.findOne(id, tenantId);
    
    // Delete file from storage
    if (contract.fileUrl) {
      await this.storageService.deleteFile(contract.fileUrl);
    }

    await this.contractRepository.remove(contract);

    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId: 'system',
      action: AuditAction.DELETE_CONTRACT,
      resourceId: id,
      details: { title: contract.title },
    });
  }

  async analyze(id: string, tenantId: string): Promise<Contract> {
    this.logger.log(`[ContractService] Starting analysis for contract ${id} (Tenant: ${tenantId})`);
    const contract = await this.findOne(id, tenantId);
    
    let textToAnalyze = contract.content || '';

    // 만약 파일이 업로드되어 있다면 PDF 텍스트 추출 시도
    if (contract.fileUrl) {
      try {
        this.logger.log(`[ContractService] PDF detected: ${contract.fileUrl}. Attempting extraction.`);
        
        // fileUrl에서 GCS 파일 경로 추출
        const storagePath = contract.fileUrl.replace('/api/contracts/download/', '');
        this.logger.log(`[ContractService] GCS Storage Path extracted: ${storagePath}`);
        
        const stream = await this.storageService.getFileStream(storagePath);
        const buffer = await this.streamToBuffer(stream);
        this.logger.log(`[ContractService] Buffer created from stream. Size: ${buffer.length} bytes.`);
        
        const extractedText = await this.aiService.extractTextFromPdf(buffer);
        if (extractedText && extractedText.trim().length > 10) {
          textToAnalyze = extractedText;
          this.logger.log(`[ContractService] PDF text extraction successful. Length: ${extractedText.length} chars.`);
          // 추출된 텍스트 백업
          contract.content = extractedText.substring(0, 10000); 
        } else {
          this.logger.warn(`[ContractService] Extracted PDF text is too short or empty.`);
        }
      } catch (err: any) {
        this.logger.error(`[ContractService] PDF extraction failed for ${contract.fileUrl}:`, err);
        if (!textToAnalyze) {
          this.logger.error(`[ContractService] Context: No manual content available after PDF extraction failure.`);
          throw new BadRequestException(`PDF를 읽을 수 없고 수기 입력된 내용도 없습니다: ${err.message}`);
        }
      }
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 20) {
      this.logger.warn(`[ContractService] Insufficient content to analyze (Length: ${textToAnalyze?.length || 0})`);
      throw new BadRequestException('분석할 계약서 내용이 부족합니다. (최소 20자 이상 필요)');
    }

    this.logger.log(`[ContractService] Proceeding to AI Analysis (Text length: ${textToAnalyze.length})`);
    
    try {
      // OpenAI 실제 분석 수행
      const { riskScore, riskAnalysis } = await this.aiService.analyzeContract(textToAnalyze);

      contract.riskScore = riskScore;
      contract.riskAnalysis = riskAnalysis;
      contract.status = 'ANALYZED'; // 상태 업데이트

      const analyzed = await this.contractRepository.save(contract);
      this.logger.log(`[ContractService] Analysis saved to DB. Risk Score: ${riskScore}`);

      // 실시간 알림 전송
      try {
        await this.notificationService.sendRealTimeNotification(tenantId, 'contract.analyzed', {
          contractId: analyzed.id,
          title: analyzed.title,
          riskScore: analyzed.riskScore,
        });
        this.logger.log(`[ContractService] Real-time notification sent for ${analyzed.id}`);
      } catch (notificationError) {
        this.logger.error(`[ContractService] Notification failed (silent):`, notificationError);
      }

      this.eventEmitter.emit('audit.log.created', {
        tenantId,
        userId: 'system',
        action: AuditAction.CONTRACT_AI_REVIEW,
        resourceId: analyzed.id,
        details: { riskScore: analyzed.riskScore },
      });

      return analyzed;
    } catch (aiError) {
      this.logger.error(`[ContractService] AI Analysis Service call failed:`, aiError);
      throw aiError; // Re-throw to be caught by NestJS exception filters
    }
  }


  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: any[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async getFileStream(filePath: string) {
    return this.storageService.getFileStream(filePath);
  }
}
