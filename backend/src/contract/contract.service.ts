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

  async update(id: string, updateData: Partial<Contract>, tenantId: string): Promise<Contract> {
    const contract = await this.findOne(id, tenantId);
    Object.assign(contract, updateData);
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
    await this.contractRepository.remove(contract);

    this.eventEmitter.emit('CONTRACT_DELETED', {
      contractId: id,
      tenantId,
      title: contract.title,
    });
  }
}
