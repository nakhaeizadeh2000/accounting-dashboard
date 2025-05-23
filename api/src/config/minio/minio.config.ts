import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioConfigService implements OnModuleInit {
  private minioClient: Client;
  private readonly logger = new Logger(MinioConfigService.name);
  private readonly publicEndpoint: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const port = +this.configService.get<string>('MINIO_PORT');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const accessKey = this.configService.get<string>('MINIO_ROOT_USER');
    const secretKey = this.configService.get<string>('MINIO_ROOT_PASSWORD');
    const region = this.configService.get<string>('MINIO_REGION', 'us-east-1');

    // Save the public-facing endpoint separately
    this.publicEndpoint =
      this.configService.get<string>('MINIO_PUBLIC_ENDPOINT') ||
      'localhost/minio';

    if (!endpoint || !accessKey || !secretKey) {
      this.logger.error(
        'Missing required MinIO configuration. Please check your environment variables.',
      );
      throw new Error('Missing required MinIO configuration');
    }

    this.logger.log(
      `Initializing MinIO client for endpoint: ${endpoint}:${port}, SSL: ${useSSL}, Public Endpoint: ${this.publicEndpoint}`,
    );

    // Create the MinIO client with only the officially supported options
    this.minioClient = new Client({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
      region: region,
      //partSize is one of the supported options
      partSize: 64 * 1024 * 1024, // 64MB parts for multipart uploads
    });
  }

  /**
   * Hook that runs when the module is initialized
   */
  async onModuleInit() {
    try {
      // Test connection to MinIO
      await this.checkConnection();
    } catch (error) {
      this.logger.error(
        'Failed to connect to MinIO server during initialization',
        error,
      );
      // Don't throw here - we'll let the application start even if MinIO is temporarily unavailable
    }
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
   * Get the public endpoint for MinIO.
   *
   * @returns The public endpoint
   */
  getPublicEndpoint(): string {
    return this.publicEndpoint;
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
      publicEndpoint: this.publicEndpoint,
    };
  }
}
