import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../domain/contract.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StorageService } from '../common/services/storage.service';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly eventEmitter: EventEmitter2,
    private readonly storageService: StorageService,
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
      action: 'CREATE_CONTRACT',
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
        action: 'UPDATE_CONTRACT',
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
      action: 'DELETE_CONTRACT',
      resourceId: id,
      details: { title: contract.title },
    });
  }

  async analyze(id: string, tenantId: string): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);
    
    // AI Analysis simulation
    console.log(`Analyzing contract content for risk: ${contract.title}`);
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dummy risk calculation logic based on dummy text
    const lowRiskPhrases = ['standard', 'mutual', 'friendly'];
    const highRiskPhrases = ['immediate', 'non-refundable', 'exclusive', 'penalty'];
    
    let score = 15; // Base low risk
    const text = (contract.title + ' ' + contract.content).toLowerCase();
    
    highRiskPhrases.forEach(p => { if (text.includes(p)) score += 20; });
    score = Math.min(score, 95);

    contract.riskScore = score;
    contract.riskAnalysis = JSON.stringify({
      overall: score > 60 ? 'High' : (score > 30 ? 'Medium' : 'Low'),
      foundKeywords: highRiskPhrases.filter(p => text.includes(p)),
      summary: score > 60 ? 'Significant liability risks detected.' : 'Standard risk profile.'
    });

    const analyzed = await this.contractRepository.save(contract);

    this.eventEmitter.emit('audit.log.created', {
      tenantId,
      userId: 'system',
      action: 'CONTRACT_AI_REVEIW',
      resourceId: analyzed.id,
      details: { riskScore: analyzed.riskScore },
    });

    return analyzed;
  }

  async getFileStream(filePath: string) {
    return this.storageService.getFileStream(filePath);
  }
}
