import { Injectable } from '@nestjs/common';
import { MinioFilesService } from 'src/minio-files/services/minio-files.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example service demonstrating how to use the MinioFilesService
 */
@Injectable()
export class FileManagerService {
  constructor(private readonly minioFilesService: MinioFilesService) {}

  /**
   * Example method to upload a local file to MinIO
   *
   * @param filePath - Path to the local file
   * @param bucket - Bucket to upload to
   * @returns Metadata for the uploaded file
   */
  async uploadLocalFile(filePath: string, bucket: string) {
    // Create the file stream from the local file
    const fileStream = fs.createReadStream(filePath);
    const filename = path.basename(filePath);
    const mimetype = this.getMimetypeFromFilename(filename);

    // Stream must be converted to the expected BusboyFileStream type
    // In real usage, this stream usually comes from a multipart form request
    const busboyFileStream = fileStream as any;

    try {
      // Upload the file with default options
      const fileMetadata = await this.minioFilesService.uploadFile(
        bucket,
        filename,
        busboyFileStream,
        mimetype,
        {
          generateThumbnail: true,
          maxSizeMB: 50,
        },
      );

      console.log(`File uploaded successfully: ${fileMetadata.url}`);

      if (fileMetadata.thumbnailUrl) {
        console.log(`Thumbnail available at: ${fileMetadata.thumbnailUrl}`);
      }

      return fileMetadata;
    } catch (error) {
      console.error(`Error uploading file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Example method to retrieve a list of files with URLs
   *
   * @param bucket - Bucket to list files from
   * @returns List of files with their metadata and URLs
   */
  async listFilesWithUrls(bucket: string) {
    try {
      // Ensure the bucket exists
      await this.minioFilesService.ensureBucketExists(bucket);

      // List all files in the bucket
      const files = await this.minioFilesService.listFiles(bucket);

      console.log(`Found ${files.length} files in bucket "${bucket}"`);

      return files;
    } catch (error) {
      console.error(`Error listing files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Example method to download a file from MinIO
   *
   * @param bucket - Bucket containing the file
   * @param filename - Name of the file to download
   * @param localPath - Local path to save the file to
   * @returns The local path where the file was saved
   */
  async downloadFile(bucket: string, filename: string, localPath: string) {
    try {
      // Get the file metadata
      const metadata = await this.minioFilesService.getFileMetadata(
        bucket,
        filename,
      );

      // Get a presigned URL for downloading
      const url = metadata.url;

      // In a real application, you might use axios, node-fetch, or another HTTP client
      console.log(`File can be downloaded from: ${url}`);
      console.log(
        `You can download this file programmatically or open it in a browser`,
      );

      return url;
    } catch (error) {
      console.error(`Error downloading file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Example method to search for files by prefix
   *
   * @param bucket - Bucket to search in
   * @param prefix - Prefix to search for
   * @returns List of files matching the prefix
   */
  async searchFiles(bucket: string, prefix: string) {
    try {
      // List files with the given prefix
      const files = await this.minioFilesService.listFiles(bucket, prefix);

      console.log(
        `Found ${files.length} files matching prefix "${prefix}" in bucket "${bucket}"`,
      );

      return files;
    } catch (error) {
      console.error(`Error searching files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Example method to delete a file and its thumbnail
   *
   * @param bucket - Bucket containing the file
   * @param filename - Name of the file to delete
   * @returns True if the file was deleted successfully
   */
  async deleteFileWithThumbnail(bucket: string, filename: string) {
    try {
      // The MinioFilesService.deleteFile method already handles thumbnail deletion
      const result = await this.minioFilesService.deleteFile(bucket, filename);

      console.log(
        `File "${filename}" deleted successfully from bucket "${bucket}"`,
      );

      return result;
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Example method to create a bucket with a public policy
   *
   * @param bucketName - Name of the bucket to create
   * @returns Success message
   */
  async createPublicBucket(bucketName: string) {
    try {
      await this.minioFilesService.createBucket(bucketName, {
        region: 'us-east-1',
        publicPolicy: true,
      });

      console.log(`Bucket "${bucketName}" created with public read policy`);

      return { message: `Bucket "${bucketName}" created successfully` };
    } catch (error) {
      console.error(`Error creating bucket: ${error.message}`);
      throw error;
    }
  }

  /**
   * Example method to upload multiple files at once
   *
   * @param filePaths - Array of local file paths
   * @param bucket - Bucket to upload to
   * @returns Array of metadata for the uploaded files
   */
  async uploadMultipleFiles(filePaths: string[], bucket: string) {
    // Prepare file objects
    const fileObjects = filePaths.map((filePath) => {
      const fileStream = fs.createReadStream(filePath);
      const filename = path.basename(filePath);
      const mimetype = this.getMimetypeFromFilename(filename);

      return {
        file: fileStream as any, // Convert to BusboyFileStream
        filename,
        mimetype,
      };
    });

    try {
      // Upload all files at once
      const results = await this.minioFilesService.uploadMultipleFiles(
        bucket,
        fileObjects,
        {
          generateThumbnail: true,
          maxSizeMB: 50,
        },
      );

      console.log(
        `Successfully uploaded ${results.length} files to bucket "${bucket}"`,
      );

      return results;
    } catch (error) {
      console.error(`Error uploading multiple files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get MIME type from filename extension
   *
   * @param filename - Filename to determine MIME type for
   * @returns MIME type string
   */
  private getMimetypeFromFilename(filename: string): string {
    const extension = path.extname(filename).toLowerCase();

    // Simple mapping of common extensions to MIME types
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.zip': 'application/zip',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.json': 'application/json',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }
}
