import { Module, Global } from '@nestjs/common';
import { StorageService } from '../services/storage.service';
import { DiskStorageService } from '../services/disk-storage.service';

@Global()
@Module({
  providers: [
    {
      provide: StorageService,
      useClass: DiskStorageService,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
