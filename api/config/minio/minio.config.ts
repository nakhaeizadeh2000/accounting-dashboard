import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioConfigService {
  private minioClient: Client;
  private readonly logger = new Logger(MinioConfigService.name);

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = +this.configService.get<string>('MINIO_PORT');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const accessKey = this.configService.get<string>('MINIO_ROOT_USER');
    const secretKey = this.configService.get<string>('MINIO_ROOT_PASSWORD');

    if (!endpoint || !accessKey || !secretKey) {
      this.logger.error(
        'Missing required MinIO configuration. Please check your environment variables.',
      );
      throw new Error('Missing required MinIO configuration');
    }

    this.logger.log(
      `Initializing MinIO client for endpoint: ${endpoint}:${port}, SSL: ${useSSL}`,
    );

    this.minioClient = new Client({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });
  }

  /**
   * Get the MinIO client instance.
   *
   * @returns The MinIO client
   */
  getClient(): Client {
    return this.minioClient;
  }

  /**
   * Check if the MinIO server is accessible.
   *
   * @returns Promise resolving to true if the server is accessible
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.minioClient.listBuckets();
      this.logger.log('Successfully connected to MinIO server');
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to connect to MinIO server: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Get MinIO server configuration information.
   *
   * @returns Configuration object
   */
  getConfig() {
    return {
      endpoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: +this.configService.get<string>('MINIO_PORT'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ROOT_USER'),
      region: this.configService.get<string>('MINIO_REGION', 'us-east-1'),
    };
  }
}
