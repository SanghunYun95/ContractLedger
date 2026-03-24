import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { ContractService } from './contract.service';
import { Contract } from '../domain/contract.entity';
import { StorageService } from '../common/services/storage.service';
import { AuditAction } from '../common/audit-action.enum';

describe('ContractService', () => {
  let service: ContractService;
  let repo: any;
  let eventEmitter: any;
  let storageService: any;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    eventEmitter = {
      emit: jest.fn(),
    };
    storageService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      getFileStream: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: getRepositoryToken(Contract),
          useValue: repo,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
        {
          provide: StorageService,
          useValue: storageService,
        },
      ],
    }).compile();

    service = module.get<ContractService>(ContractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contract without a file', async () => {
      const tenantId = 'tenant-1';
      const dto = { title: 'Test' };
      const contract = { id: 'c-1', ...dto, tenantId };

      repo.create.mockReturnValue(contract);
      repo.save.mockResolvedValue(contract);

      const result = await service.create(tenantId, dto);

      expect(repo.create).toHaveBeenCalledWith({
        status: 'DRAFT',
        ...dto,
        tenantId,
      });
      expect(repo.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('audit.log.created', expect.any(Object));
      expect(result).toEqual(contract);
    });

    it('should create a contract and upload a file', async () => {
        const tenantId = 'tenant-1';
        const dto = { title: 'With File' };
        const file = { originalname: 'test.pdf' };
        const contract: any = { id: 'c-1', ...dto, tenantId };
  
        repo.create.mockReturnValue(contract);
        repo.save.mockResolvedValue(contract);
        storageService.uploadFile.mockResolvedValue({ url: 'http://bucket/test.pdf', fileName: 'test.pdf' });
  
        const result = await service.create(tenantId, dto, file);
  
        expect(storageService.uploadFile).toHaveBeenCalledWith(file, tenantId);
        expect(contract.fileUrl).toBe('http://bucket/test.pdf');
        expect(result).toEqual(contract);
      });
  });

  describe('findOne', () => {
    it('should return a contract if found', async () => {
      const contract: any = { id: 'c-1', tenantId: 't-1' };
      repo.findOne.mockResolvedValue(contract);

      const result = await service.findOne('c-1', 't-1');
      expect(result).toEqual(contract);
    });

    it('should throw NotFoundException if not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('c-1', 't-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('analyze', () => {
    it('should update risk score and emit event', async () => {
      const contract: any = { id: 'c-1', tenantId: 't-1', title: 'Hazardous Penalty', content: 'immediate non-refundable' };
      repo.findOne.mockResolvedValue(contract);
      repo.save.mockResolvedValue({ ...contract, riskScore: 55 });

      const result = await service.analyze('c-1', 't-1');
      
      expect(result.riskScore).toBeGreaterThan(15);
      expect(repo.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('audit.log.created', expect.objectContaining({
          action: AuditAction.CONTRACT_AI_REVIEW
      }));
    });
  });
});
