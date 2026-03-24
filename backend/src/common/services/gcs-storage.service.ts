import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { StorageService, UploadedFile } from './storage.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class GcsStorageService extends StorageService {
  private readonly storage: Storage;
  private readonly bucketName: string;
  private readonly logger = new Logger(GcsStorageService.name);

  constructor() {
    super();
    // Cloud Run 환경에서는 서비스 계정 키 파일 없이 기본 사용자 인증(ADC)을 사용하도록 유연하게 설정
    const storageOptions: any = {};
    if (process.env.GCS_PROJECT_ID) {
      storageOptions.projectId = process.env.GCS_PROJECT_ID;
    }
    // GCS_KEY_FILE_PATH가 명시적으로 존재할 때만 사용 (배포 환경에서는 보통 설정하지 않음)
    if (process.env.GCS_KEY_FILE_PATH && process.env.GCS_KEY_FILE_PATH !== 'undefined') {
      storageOptions.keyFilename = process.env.GCS_KEY_FILE_PATH;
    }
    
    this.storage = new Storage(storageOptions);
    this.bucketName = process.env.GCS_BUCKET_NAME || 'contract-ledger-files';
  }

  async uploadFile(file: UploadedFile, tenantId: string): Promise<{ url: string; fileName: string }> {
    const ext = path.extname(file.originalname);
    const fileName = `${tenantId}/${uuidv4()}${ext}`; // /uploads/ 등 중복 경로 제거
    
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const gcsFile = bucket.file(fileName);

      if (!file.buffer) {
        throw new Error('File buffer is missing');
      }

      await gcsFile.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
        resumable: false,
      });

      this.logger.log(`File uploaded to GCS: ${fileName}`);
      
      // 이 URL은 나중에 백엔드에서 프록시하거나 Signed URL로 변환할 때 기준이 됩니다.
      return {
        url: `/api/contracts/download/${fileName}`, 
        fileName: file.originalname,
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const stack = e instanceof Error ? e.stack : undefined;
      this.logger.error(
        `[GcsStorage] Failed to upload file to ${this.bucketName}: ${message}`,
        stack,
      );
      throw new Error(`Cloud Storage upload failed: ${message}`);
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      // 업로드 시와 동일하게 /api/contracts/download/ 부분을 제거하여 순수 파일명만 추출
      let fileName = url.replace('/api/contracts/download/', '');
      
      // 혹시 데이터베이스에 /uploads/tenant-a/... 처럼 예전 로컬 경로가 남아있을 경우를 대비
      fileName = fileName.replace(/^\/?uploads\//, '');
      
      const bucket = this.storage.bucket(this.bucketName);
      await bucket.file(fileName).delete();
      this.logger.log(`File deleted from GCS: ${fileName}`);
    } catch (e: any) {
      this.logger.error(`Failed to delete file from GCS: ${e.message}`);
    }
  }

  async getFileStream(fileName: string): Promise<any> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);
    return file.createReadStream();
  }

  async getSignedUrl(fileName: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileName);
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000,
    });
    return url;
  }
}
