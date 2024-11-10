import { Injectable } from '@nestjs/common';
import { MinioConfigService } from 'config/minio/minio.ocnfig';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Client;

  constructor(private minioConfigService: MinioConfigService) {
    this.minioClient = this.minioConfigService.getClient();
  }

  async uploadFile(bucket: string, objectName: string, buffer: Buffer, metaData: any) {
    await this.minioClient.putObject(bucket, objectName, buffer, metaData);
  }

  async getDownloadUrl(bucket: string, objectName: string): Promise<string> {
    return this.minioClient.presignedUrl('GET', bucket, objectName, 24 * 60 * 60); // 24-hour expiry
  }

  async initiateMultipartUpload(bucket: string, objectName: string) {
    return this.minioClient.initiateNewMultipartUpload(bucket, objectName, {});
  }

  async completeMultipartUpload(bucket: string, objectName: string, uploadId: string, etags: any[]) {
    return this.minioClient.completeMultipartUpload(bucket, objectName, uploadId, etags);
  }
}
