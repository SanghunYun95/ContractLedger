import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from '../domain/contract.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StorageService } from '../common/services/storage.service';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly eventEmitter: EventEmitter2,
    private readonly storageService: StorageService,
  ) {}

  async create(tenantId: string, contractData: CreateContractDto, file?: any): Promise<Contract> {
    const contract = this.contractRepository.create({
      status: 'DRAFT',
      ...contractData,
      tenantId,
    });

    let uploadedUrl: string | undefined;
    if (file) {
      const { url, fileName } = await this.storageService.uploadFile(file, tenantId);
      uploadedUrl = url;
      contract.fileUrl = url;
      contract.originalFileName = fileName;
    }

    try {
      const saved = await this.contractRepository.save(contract);
      
      // Emit audit log event
      this.eventEmitter.emit('audit.log.created', {
        tenantId,
        userId: 'system', // TODO: Get from request
        action: 'CREATE_CONTRACT',
        resourceId: saved.id,
        details: { 
          title: saved.title,
          hasFile: !!file 
        },
      });

      return saved;
    } catch (error) {
      if (uploadedUrl) {
        await this.storageService.deleteFile(uploadedUrl).catch(() => undefined);
      }
      throw error;
    }
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

  async update(id: string, updateData: UpdateContractDto, tenantId: string): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);
    
    // Whitelist editable fields to prevent overwriting protected fields like tenantId
    if (updateData.title !== undefined) contract.title = updateData.title;
    if (updateData.content !== undefined) contract.content = updateData.content;
    if (updateData.status !== undefined) contract.status = updateData.status;

    const updated = await this.contractRepository.save(contract);

    this.eventEmitter.emit('CONTRACT_UPDATED', {
      contractId: updated.id,
      tenantId,
      title: updated.title,
      changes: updateData,
    });

    return updated;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const contract = await this.findOne(id, tenantId);
    
    if (contract.fileUrl) {
      await this.storageService.deleteFile(contract.fileUrl).catch(err => {
        console.error(`Failed to delete file ${contract.fileUrl}:`, err);
      });
    }

    await this.contractRepository.remove(contract);

    this.eventEmitter.emit('CONTRACT_DELETED', {
      contractId: id,
      tenantId,
      title: contract.title,
    });
  }
}
