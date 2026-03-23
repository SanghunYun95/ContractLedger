import { Injectable } from '@nestjs/common';

export interface UploadedFile {
  buffer?: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export abstract class StorageService {
  abstract uploadFile(file: UploadedFile, tenantId: string): Promise<{ url: string; fileName: string }>;
  abstract deleteFile(url: string): Promise<void>;
}
