import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioConfigService {
  private minioClient: Client;

  constructor(private configService: ConfigService) {
    this.minioClient = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: +this.configService.get<string>('MINIO_PORT'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ROOT_USER'),
      secretKey: this.configService.get<string>('MINIO_ROOT_PASSWORD'),
    });
  }

  getClient(): Client {
    return this.minioClient;
  }
}
