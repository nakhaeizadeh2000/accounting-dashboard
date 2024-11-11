import { BusboyFileStream } from '@fastify/busboy';
import { Injectable } from '@nestjs/common';
import { MinioConfigService } from 'config/minio/minio.config';
import { Client } from 'minio';

@Injectable()
export class MinioFilesService {
  private minioClient: Client;

  constructor(private minioConfigService: MinioConfigService) {
    this.minioClient = this.minioConfigService.getClient();
  }

  async uploadFile(bucket: string, objectName: string, fileStream: BusboyFileStream, metaData: any) {
    try {
      // Upload the file directly to MinIO (streaming)
      await this.minioClient.putObject(bucket, objectName, fileStream, metaData);
      console.log(`File "${objectName}" uploaded successfully to bucket "${bucket}".`);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error; // Rethrow the error for further handling
    }
  };

  async getDownloadUrl(bucket: string, objectName: string): Promise<string> {
    try {
      const url = await this.minioClient.presignedUrl('GET', bucket, objectName, 24 * 60 * 60); // 24-hour expiry
      console.log(`Download URL for "${objectName}" in bucket "${bucket}" generated successfully.`);
      return url;
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw error; // Rethrow the error for further handling
    }
  }

  async initiateMultipartUpload(bucket: string, objectName: string) {
    try {
      const uploadId = await this.minioClient.initiateNewMultipartUpload(bucket, objectName, {});
      console.log(`Multipart upload initiated for "${objectName}" in bucket "${bucket}".`);
      return uploadId;
    } catch (error) {
      console.error('Error initiating multipart upload:', error);
      throw error; // Rethrow the error for further handling
    }
  }

  async completeMultipartUpload(bucket: string, objectName: string, uploadId: string, etags: any[]) {
    try {
      await this.minioClient.completeMultipartUpload(bucket, objectName, uploadId, etags);
      console.log(`Multipart upload completed for "${objectName}" in bucket "${bucket}".`);
    } catch (error) {
      console.error('Error completing multipart upload:', error);
      throw error; // Rethrow the error for further handling
    }
  }

  async createBucket(bucketName: string): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(bucketName); // Specify region if needed
        console.log(`Bucket "${bucketName}" created successfully.`);
      } else {
        console.log(`Bucket "${bucketName}" already exists.`);
      }
    } catch (error) {
      console.error('Error creating bucket:', error);
      throw error; // Rethrow the error for further handling
    }
  }

  async removeBucket(bucketName: string): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(bucketName);
      if (exists) {
        await this.minioClient.removeBucket(bucketName);
        console.log(`Bucket "${bucketName}" removed successfully.`);
      } else {
        console.log(`Bucket "${bucketName}" does not exist.`);
      }
    } catch (error) {
      console.error('Error removing bucket:', error);
      throw error; // Rethrow the error for further handling
    }
  }
}
