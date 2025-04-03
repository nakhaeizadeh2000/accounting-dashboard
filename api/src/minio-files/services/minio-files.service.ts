import { BusboyFileStream } from '@fastify/busboy';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { MinioConfigService } from 'config/minio/minio.config';
import { Client } from 'minio';
import * as sharp from 'sharp';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { statSync } from 'fs';
import * as os from 'os';
import { promisify } from 'util';
import { Readable } from 'stream';
import * as ffmpeg from 'fluent-ffmpeg';

const pipeline = promisify(require('stream').pipeline);
const mkdtemp = promisify(fs.mkdtemp);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

export interface FileMetadata {
  originalName: string;
  uniqueName: string;
  size: number;
  mimetype: string;
  thumbnailName?: string;
  url?: string;
  thumbnailUrl?: string;
  bucket: string;
  uploadedAt: Date;
}

export interface BucketConfiguration {
  region?: string;
  publicPolicy?: boolean;
}

export interface FileUploadOptions {
  generateThumbnail?: boolean;
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
}

const DEFAULT_THUMBNAIL_SIZE = 300;
const THUMBNAIL_PREFIX = 'thumb_';
const TEMP_DIR_PREFIX = 'minio-upload-';

@Injectable()
export class MinioFilesService {
  private minioClient: Client;
  private readonly logger = new Logger(MinioFilesService.name);

  constructor(private minioConfigService: MinioConfigService) {
    this.minioClient = this.minioConfigService.getClient();
  }

  /**
   * Upload a file to MinIO
   *
   * @param bucket - The bucket to upload to
   * @param filename - The original filename
   * @param fileStream - The file stream to upload
   * @param mimetype - The file's MIME type
   * @param options - Upload options
   * @returns Metadata for the uploaded file
   */
  async uploadFile(
    bucket: string,
    filename: string,
    fileStream: BusboyFileStream,
    mimetype: string,
    options: FileUploadOptions = {},
  ): Promise<FileMetadata> {
    try {
      // Default options
      const {
        generateThumbnail = true,
        maxSizeMB = 0, // 0 means no limit
        allowedMimeTypes = [],
      } = options;

      // Create the bucket if it doesn't exist
      await this.ensureBucketExists(bucket);

      // Create a temp directory for file processing
      const tempDir = await mkdtemp(path.join(os.tmpdir(), TEMP_DIR_PREFIX));
      const tempFilePath = path.join(tempDir, filename);

      // Save the file to temp directory for processing
      let fileSize = 0;
      const fileBuffer = await this.streamToBuffer(fileStream, (size) => {
        fileSize = size;

        // Check file size if limit is specified
        if (maxSizeMB > 0 && size > maxSizeMB * 1024 * 1024) {
          throw new BadRequestException(
            `File exceeds maximum size of ${maxSizeMB}MB`,
          );
        }
      });

      // Check MIME type if restrictions are specified
      if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(mimetype)) {
        throw new BadRequestException(`File type ${mimetype} is not allowed`);
      }

      await fs.writeFileSync(tempFilePath, new Uint8Array(fileBuffer));

      // Generate a unique filename to prevent collisions
      const uniqueName = this.generateUniqueFilename(filename);

      // Set metadata to be stored with the file
      const metadata = {
        'Content-Type': mimetype,
        'Original-Name': filename,
        'Upload-Date': new Date().toISOString(),
        'File-Size': fileSize.toString(),
      };

      // Upload the file to MinIO
      await this.minioClient.putObject(
        bucket,
        uniqueName,
        fs.createReadStream(tempFilePath),
        fileSize,
        metadata,
      );

      // Prepare the result object
      const result: FileMetadata = {
        originalName: filename,
        uniqueName,
        size: fileSize,
        mimetype,
        bucket,
        uploadedAt: new Date(),
      };

      // Generate thumbnail if needed and supported
      if (generateThumbnail) {
        try {
          const thumbnailName = await this.generateThumbnail(
            bucket,
            uniqueName,
            tempFilePath,
            mimetype,
          );
          if (thumbnailName) {
            result.thumbnailName = thumbnailName;
            result.thumbnailUrl = await this.generatePresignedUrl(
              bucket,
              thumbnailName,
            );
          }
        } catch (thumbnailError) {
          this.logger.warn(
            `Failed to generate thumbnail for ${filename}: ${thumbnailError.message}`,
          );
        }
      }

      // Generate URL for the uploaded file
      result.url = await this.generatePresignedUrl(bucket, uniqueName);

      // Clean up temporary files
      try {
        await unlink(tempFilePath);
        await rmdir(tempDir);
      } catch (cleanupError) {
        this.logger.warn(
          `Failed to clean up temp files: ${cleanupError.message}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Upload multiple files to MinIO
   *
   * @param bucket - The bucket to upload to
   * @param files - Array of file objects to upload
   * @param options - Upload options
   * @returns Array of metadata for the uploaded files
   */
  async uploadMultipleFiles(
    bucket: string,
    files: { file: BusboyFileStream; filename: string; mimetype: string }[],
    options: FileUploadOptions = {},
  ): Promise<FileMetadata[]> {
    // Create the bucket once for all files
    await this.ensureBucketExists(bucket);

    // Process each file
    const uploadPromises = files.map((fileData) =>
      this.uploadFile(
        bucket,
        fileData.filename,
        fileData.file,
        fileData.mimetype,
        options,
      ),
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Generate a pre-signed URL for downloading or viewing a file
   *
   * @param bucket - The bucket where the file is stored
   * @param objectName - The object name in the bucket
   * @param expirySeconds - URL expiry time in seconds (default: 24 hours)
   * @returns Pre-signed URL for the file
   */
  async generatePresignedUrl(
    bucket: string,
    objectName: string,
    expirySeconds = 24 * 60 * 60,
  ): Promise<string> {
    try {
      return await this.minioClient.presignedUrl(
        'GET',
        bucket,
        objectName,
        expirySeconds,
      );
    } catch (error) {
      this.logger.error(
        `Error generating presigned URL: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generate pre-signed URLs for multiple files
   *
   * @param bucket - The bucket where the files are stored
   * @param filenames - Array of filenames to generate URLs for
   * @param expirySeconds - URL expiry time in seconds (default: 24 hours)
   * @returns Map of filenames to their pre-signed URLs
   */
  async generateBatchPresignedUrls(
    bucket: string,
    filenames: string[],
    expirySeconds = 24 * 60 * 60,
  ): Promise<Map<string, string>> {
    const urlPromises = filenames.map(async (filename) => {
      const url = await this.generatePresignedUrl(
        bucket,
        filename,
        expirySeconds,
      );
      return [filename, url] as [string, string];
    });

    const urlEntries = await Promise.all(urlPromises);
    return new Map<string, string>(urlEntries);
  }

  /**
   * Get file metadata for a specific file
   *
   * @param bucket - The bucket where the file is stored
   * @param objectName - The object name in the bucket
   * @returns File metadata
   */
  async getFileMetadata(
    bucket: string,
    objectName: string,
  ): Promise<FileMetadata> {
    try {
      const stat = await this.minioClient.statObject(bucket, objectName);

      const metadata: FileMetadata = {
        originalName: stat.metaData['Original-Name'] || objectName,
        uniqueName: objectName,
        size: stat.size,
        mimetype: stat.metaData['Content-Type'] || 'application/octet-stream',
        bucket,
        uploadedAt: stat.lastModified,
      };

      // Check if a thumbnail exists for this file
      const thumbnailName = `${THUMBNAIL_PREFIX}${objectName}`;
      try {
        await this.minioClient.statObject(bucket, thumbnailName);
        metadata.thumbnailName = thumbnailName;
        metadata.thumbnailUrl = await this.generatePresignedUrl(
          bucket,
          thumbnailName,
        );
      } catch (thumbnailError) {
        // Thumbnail doesn't exist, which is fine
      }

      metadata.url = await this.generatePresignedUrl(bucket, objectName);

      return metadata;
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(
          `File "${objectName}" not found in bucket "${bucket}"`,
        );
      }
      this.logger.error(
        `Error getting file metadata: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get a list of files in a bucket
   *
   * @param bucket - The bucket to list files from
   * @param prefix - Optional prefix to filter files
   * @param recursive - Whether to recursively list files in subdirectories
   * @returns Array of file metadata
   */
  async listFiles(
    bucket: string,
    prefix = '',
    recursive = true,
  ): Promise<FileMetadata[]> {
    try {
      // Ensure the bucket exists
      const bucketExists = await this.bucketExists(bucket);
      if (!bucketExists) {
        throw new NotFoundException(`Bucket "${bucket}" not found`);
      }

      const objects = [];
      const objectsStream = this.minioClient.listObjects(
        bucket,
        prefix,
        recursive,
      );

      for await (const obj of objectsStream) {
        if (!obj.name.startsWith(THUMBNAIL_PREFIX)) {
          try {
            const metadata = await this.getFileMetadata(bucket, obj.name);
            objects.push(metadata);
          } catch (error) {
            this.logger.warn(
              `Error getting metadata for ${obj.name}: ${error.message}`,
            );
          }
        }
      }

      return objects;
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a file from MinIO
   *
   * @param bucket - The bucket where the file is stored
   * @param objectName - The object name in the bucket
   * @returns True if the file was deleted successfully
   */
  async deleteFile(bucket: string, objectName: string): Promise<boolean> {
    try {
      await this.minioClient.removeObject(bucket, objectName);

      // Also try to delete the thumbnail if it exists
      try {
        const thumbnailName = `${THUMBNAIL_PREFIX}${objectName}`;
        await this.minioClient.removeObject(bucket, thumbnailName);
      } catch (thumbnailError) {
        // It's okay if the thumbnail doesn't exist
      }

      return true;
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Ensure a bucket exists, creating it if necessary
   *
   * @param bucketName - The name of the bucket
   * @param config - Optional bucket configuration
   */
  async ensureBucketExists(
    bucketName: string,
    config: BucketConfiguration = {},
  ): Promise<void> {
    try {
      const exists = await this.bucketExists(bucketName);
      if (!exists) {
        await this.createBucket(bucketName, config);
      }
    } catch (error) {
      this.logger.error(
        `Error ensuring bucket exists: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Check if a bucket exists
   *
   * @param bucketName - The name of the bucket
   * @returns True if the bucket exists
   */
  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      return await this.minioClient.bucketExists(bucketName);
    } catch (error) {
      this.logger.error(
        `Error checking if bucket exists: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create a new bucket
   *
   * @param bucketName - The name of the bucket
   * @param config - Optional bucket configuration
   */
  async createBucket(
    bucketName: string,
    config: BucketConfiguration = {},
  ): Promise<void> {
    try {
      const { region = 'us-east-1', publicPolicy = true } = config;

      await this.minioClient.makeBucket(bucketName, region);
      this.logger.log(`Created bucket: ${bucketName}`);

      if (publicPolicy) {
        // Set a public read policy for the bucket
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Action: ['s3:GetObject'],
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Resource: [`arn:aws:s3:::${bucketName}/*`],
              Sid: 'PublicRead',
            },
          ],
        };

        await this.minioClient.setBucketPolicy(
          bucketName,
          JSON.stringify(policy),
        );
        this.logger.log(`Set public policy for bucket: ${bucketName}`);
      }
    } catch (error) {
      this.logger.error(`Error creating bucket: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a bucket
   *
   * @param bucketName - The name of the bucket
   * @param force - Whether to force deletion by removing all objects first
   */
  async removeBucket(bucketName: string, force = false): Promise<void> {
    try {
      const exists = await this.bucketExists(bucketName);
      if (!exists) {
        this.logger.log(`Bucket "${bucketName}" does not exist.`);
        return;
      }

      if (force) {
        // List and remove all objects in the bucket first
        const objectsStream = this.minioClient.listObjects(
          bucketName,
          '',
          true,
        );
        const objects = [];

        for await (const obj of objectsStream) {
          objects.push(obj.name);
        }

        if (objects.length > 0) {
          await this.minioClient.removeObjects(bucketName, objects);
        }
      }

      await this.minioClient.removeBucket(bucketName);
      this.logger.log(`Removed bucket: ${bucketName}`);
    } catch (error) {
      this.logger.error(`Error removing bucket: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate a thumbnail for an uploaded file
   *
   * @param bucket - The bucket where the file is stored
   * @param objectName - The object name in the bucket
   * @param filePath - Path to the temporary file
   * @param mimetype - The file's MIME type
   * @returns Thumbnail object name, or null if thumbnail generation failed
   */
  private async generateThumbnail(
    bucket: string,
    objectName: string,
    filePath: string,
    mimetype: string,
  ): Promise<string | null> {
    const thumbnailName = `${THUMBNAIL_PREFIX}${objectName}`;
    const tempThumbnailPath = `${filePath}_thumb`;

    try {
      // Generate thumbnail based on file type
      if (mimetype.startsWith('image/')) {
        // For images, use sharp for processing
        await sharp(filePath)
          .resize(DEFAULT_THUMBNAIL_SIZE, DEFAULT_THUMBNAIL_SIZE, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toFile(tempThumbnailPath);

        // Get the thumbnail file size
        const thumbStats = fs.statSync(tempThumbnailPath);

        // Upload the thumbnail to MinIO
        await this.minioClient.putObject(
          bucket,
          thumbnailName,
          fs.createReadStream(tempThumbnailPath),
          thumbStats.size,
          { 'Content-Type': mimetype },
        );

        // Clean up the temporary thumbnail file
        await unlink(tempThumbnailPath);

        return thumbnailName;
      } else if (mimetype.startsWith('video/')) {
        // For videos, use ffmpeg to extract a frame
        return new Promise((resolve, reject) => {
          ffmpeg(filePath)
            .on('error', (err) => {
              this.logger.warn(
                `Error generating video thumbnail: ${err.message}`,
              );
              resolve(null);
            })
            .screenshot({
              count: 1,
              folder: path.dirname(tempThumbnailPath),
              filename: path.basename(tempThumbnailPath),
              size: `${DEFAULT_THUMBNAIL_SIZE}x?`,
            })
            .on('end', async () => {
              try {
                // Get the thumbnail file size
                const thumbStats = fs.statSync(tempThumbnailPath);

                // Upload the thumbnail to MinIO
                await this.minioClient.putObject(
                  bucket,
                  thumbnailName,
                  fs.createReadStream(tempThumbnailPath),
                  thumbStats.size,
                  { 'Content-Type': 'image/jpeg' },
                );

                // Clean up the temporary thumbnail file
                await unlink(tempThumbnailPath);

                resolve(thumbnailName);
              } catch (error) {
                this.logger.warn(
                  `Error uploading video thumbnail: ${error.message}`,
                );
                resolve(null);
              }
            });
        });
      } else if (mimetype.startsWith('application/pdf')) {
        // For PDFs, thumbnail generation would require a PDF renderer
        // This is more complex and would require additional libraries
        return null;
      }

      // Other file types don't get thumbnails
      return null;
    } catch (error) {
      this.logger.warn(`Failed to generate thumbnail: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate a unique filename to prevent collisions
   *
   * @param originalFilename - The original file name
   * @returns A unique filename
   */
  private generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, ext);
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, '')
      .substring(0, 14);
    const randomString = crypto.randomBytes(4).toString('hex');

    // Format: originalname-timestamp-randomstring.ext
    return `${baseName}-${timestamp}-${randomString}${ext}`;
  }

  /**
   * Convert a stream to a buffer
   *
   * @param stream - The stream to convert
   * @param onProgress - Optional callback for tracking progress
   * @returns Promise resolving to a buffer
   */
  private async streamToBuffer(
    stream: BusboyFileStream,
    onProgress?: (bytesRead: number) => void,
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let totalSize = 0;

      stream.on('data', (chunk) => {
        // Ensure chunk is a Buffer before adding to chunks
        const bufferChunk =
          chunk instanceof Buffer ? chunk : Buffer.from(chunk);

        chunks.push(bufferChunk);
        totalSize += bufferChunk.length;

        if (onProgress) {
          onProgress(totalSize);
        }
      });

      stream.on('end', () => {
        // Convert chunks to Uint8Array explicitly
        const buffers = chunks
          .map((chunk) => (Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
          .map((buffer) => new Uint8Array(buffer));

        resolve(Buffer.concat(buffers));
      });

      stream.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Convert a buffer to a readable stream
   *
   * @param buffer - The buffer to convert
   * @returns A readable stream
   */
  private bufferToStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  /**
   * List all buckets
   *
   * @returns Array of bucket information
   */
  async listBuckets() {
    try {
      const buckets = await this.minioClient.listBuckets();
      return buckets.map((bucket) => ({
        name: bucket.name,
        creationDate: bucket.creationDate,
      }));
    } catch (error) {
      this.logger.error(`Error listing buckets: ${error.message}`, error.stack);
      throw error;
    }
  }
}
