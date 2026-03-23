import { Injectable } from '@nestjs/common';
import { StorageService, UploadedFile } from './storage.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DiskStorageService extends StorageService {
  private readonly uploadRoot = path.resolve(process.cwd(), 'uploads');

  constructor() {
    super();
    if (!fs.existsSync(this.uploadRoot)) {
      fs.mkdirSync(this.uploadRoot, { recursive: true });
    }
  }

  private resolveWithinUploadRoot(...segments: string[]) {
    const target = path.resolve(this.uploadRoot, ...segments);
    const root = `${this.uploadRoot}${path.sep}`;
    if (!target.startsWith(root) && target !== this.uploadRoot) {
      throw new Error('Invalid storage path');
    }
    return target;
  }

  async uploadFile(file: any, tenantId: string): Promise<{ url: string; fileName: string }> {
    const safeTenantId = tenantId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeOriginalName = path.basename(file.originalname);
    
    const tenantDir = this.resolveWithinUploadRoot(safeTenantId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginalName}`;
    const filePath = this.resolveWithinUploadRoot(safeTenantId, uniqueName);

    // If it's a buffer or DiskStorage already handled it by multer
    if (file.path) {
      fs.copyFileSync(file.path, filePath);
      fs.unlinkSync(file.path); // Remove temp file
    } else if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    }

    // Return a relative URL that we can serve via static files
    return {
      url: `/uploads/${safeTenantId}/${uniqueName}`,
      fileName: safeOriginalName
    };
  }

  async deleteFile(url: string): Promise<void> {
    const relativePath = url.replace(/^\/?uploads\//, '');
    const fullPath = this.resolveWithinUploadRoot(relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
