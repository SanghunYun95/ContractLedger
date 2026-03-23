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

  async uploadFile(file: any, tenantId: string): Promise<{ url: string; fileName: string }> {
    const tenantDir = path.join(this.uploadRoot, tenantId);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    const filePath = path.join(tenantDir, uniqueName);

    // If it's a buffer or DiskStorage already handled it by multer
    if (file.path) {
      fs.copyFileSync(file.path, filePath);
      fs.unlinkSync(file.path); // Remove temp file
    } else if (file.buffer) {
      fs.writeFileSync(filePath, file.buffer);
    }

    // Return a relative URL that we can serve via static files
    return {
      url: `/uploads/${tenantId}/${uniqueName}`,
      fileName: file.originalname
    };
  }

  async deleteFile(url: string): Promise<void> {
    const relativePath = url.startsWith('/') ? url.slice(1) : url;
    const fullPath = path.resolve(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
