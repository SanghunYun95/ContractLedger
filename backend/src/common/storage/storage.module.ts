import { Module, Global } from '@nestjs/common';
import { StorageService } from '../services/storage.service';
import { GcsStorageService } from '../services/gcs-storage.service';

@Global()
@Module({
  providers: [
    {
      provide: StorageService,
      useClass: GcsStorageService,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
