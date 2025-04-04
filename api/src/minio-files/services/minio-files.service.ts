import { BusboyFileStream } from '@fastify/busboy';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { MinioConfigService } from 'config/minio/minio.config';
import { Client } from 'minio';
import * as sharp from 'sharp';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as os from 'os';
import { PassThrough, Readable, Writable, pipeline } from 'stream';
import { promisify } from 'util';
import * as ffmpeg from 'fluent-ffmpeg';

const pipelineAsync = promisify(pipeline);
const mkdtemp = promisify(fs.mkdtemp);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
const stat = promisify(fs.stat);

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
  skipThumbnailForLargeFiles?: boolean;
  largeSizeMB?: number; // Size threshold for skipping thumbnail generation
}

const DEFAULT_THUMBNAIL_SIZE = 300;
const THUMBNAIL_PREFIX = 'thumb_';
const TEMP_DIR_PREFIX = 'minio-upload-';
// Default thumbnail generation cutoff (100MB)
const DEFAULT_LARGE_SIZE_MB = 100;

@Injectable()
export class MinioFilesService {
  private minioClient: Client;
  private readonly logger = new Logger(MinioFilesService.name);

  constructor(private minioConfigService: MinioConfigService) {
    this.minioClient = this.minioConfigService.getClient();
  }

  /**
   * Upload a file to MinIO using optimized streaming approach
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
    // Default options with sensible values
    const {
      generateThumbnail = true,
      maxSizeMB = 0, // 0 means no limit
      allowedMimeTypes = [],
      skipThumbnailForLargeFiles = true,
      largeSizeMB = DEFAULT_LARGE_SIZE_MB,
    } = options;

    // Create the bucket if it doesn't exist
    await this.ensureBucketExists(bucket);

    // Generate a unique filename to prevent collisions
    const uniqueName = this.generateUniqueFilename(filename);

    // Check MIME type if restrictions are specified
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(mimetype)) {
      throw new BadRequestException(`File type ${mimetype} is not allowed`);
    }

    let tempDir: string | null = null;
    let tempFilePath: string | null = null;
    let fileSize = 0;
    let thumbnailName: string | null = null;

    try {
      // File size tracking stream with optional size limit
      const trackingSizeStream = new PassThrough({
        highWaterMark: 64 * 1024, // 64KB buffer to minimize memory usage
      });

      // Create a metadata object for the file
      const metadata = {
        'Content-Type': mimetype,
        'Original-Name': filename,
        'Upload-Date': new Date().toISOString(),
      };

      // Track file size for validation and reporting
      trackingSizeStream.on('data', (chunk) => {
        fileSize += chunk.length;

        // Check file size if limit is specified
        if (maxSizeMB > 0 && fileSize > maxSizeMB * 1024 * 1024) {
          trackingSizeStream.destroy(
            new BadRequestException(
              `File exceeds maximum size of ${maxSizeMB}MB`,
            ),
          );
        }
      });

      // Create a direct upload to MinIO
      const uploadPromise = this.minioClient.putObject(
        bucket,
        uniqueName,
        trackingSizeStream,
        null, // Size is unknown until we finish processing the stream
        metadata,
      );

      // Start the streaming process
      await pipelineAsync(fileStream, trackingSizeStream);
      await uploadPromise;

      const result: FileMetadata = {
        originalName: filename,
        uniqueName,
        size: fileSize,
        mimetype,
        bucket,
        uploadedAt: new Date(),
      };

      // Determine if we should generate a thumbnail based on file size
      const shouldGenerateThumbnail =
        generateThumbnail &&
        !(skipThumbnailForLargeFiles && fileSize > largeSizeMB * 1024 * 1024);

      // Generate thumbnail if needed and the file type is supported
      if (shouldGenerateThumbnail) {
        // For thumbnail generation, we need a copy of the file
        // Only create temp files if we actually need them
        if (this.isThumbnailSupported(mimetype)) {
          // Create a temp directory for thumbnail processing
          tempDir = await mkdtemp(path.join(os.tmpdir(), TEMP_DIR_PREFIX));
          tempFilePath = path.join(tempDir, filename);

          // Create a new download stream from MinIO
          const objectStream = await this.minioClient.getObject(
            bucket,
            uniqueName,
          );
          const fileWriteStream = fs.createWriteStream(tempFilePath);

          // Stream the file to disk for thumbnail processing
          await pipelineAsync(objectStream, fileWriteStream);

          // Now generate the thumbnail from the temp file
          thumbnailName = await this.generateThumbnail(
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
        }
      }

      // Generate URL for the uploaded file
      result.url = await this.generatePresignedUrl(bucket, uniqueName);

      return result;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);

      // If the upload failed, try to clean up the partial object in MinIO
      try {
        await this.minioClient.removeObject(bucket, uniqueName);
      } catch (cleanupError) {
        this.logger.warn(
          `Failed to clean up partial upload: ${cleanupError.message}`,
        );
      }

      throw error;
    } finally {
      // Clean up temporary files
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          await unlink(tempFilePath);
        } catch (err) {
          this.logger.warn(`Failed to clean up temp file: ${err.message}`);
        }
      }

      if (tempDir && fs.existsSync(tempDir)) {
        try {
          await rmdir(tempDir);
        } catch (err) {
          this.logger.warn(`Failed to clean up temp directory: ${err.message}`);
        }
      }
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

    const results: FileMetadata[] = [];
    const errors: Error[] = [];

    // Process files sequentially to prevent excessive memory usage
    for (const fileData of files) {
      try {
        const result = await this.uploadFile(
          bucket,
          fileData.filename,
          fileData.file,
          fileData.mimetype,
          options,
        );
        results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to upload file ${fileData.filename}: ${error.message}`,
          error.stack,
        );
        errors.push(error);
      }
    }

    if (errors.length > 0 && results.length === 0) {
      // If all uploads failed, throw the first error
      throw errors[0];
    }

    return results;
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
      return await this.minioClient.presignedGetObject(
        bucket,
        objectName,
        expirySeconds,
      );
    } catch (error) {
      this.logger.error(
        `Error generating presigned URL for ${objectName}: ${error.message}`,
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
    const urlMap = new Map<string, string>();

    // Generate URLs sequentially to avoid overwhelming the MinIO server
    for (const filename of filenames) {
      try {
        const url = await this.generatePresignedUrl(
          bucket,
          filename,
          expirySeconds,
        );
        urlMap.set(filename, url);
      } catch (error) {
        this.logger.warn(
          `Failed to generate URL for ${filename}: ${error.message}`,
        );
        // Continue with other files even if one fails
      }
    }

    return urlMap;
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
      // Check if bucket exists
      const bucketExists = await this.bucketExists(bucket);
      if (!bucketExists) {
        throw new NotFoundException(`Bucket "${bucket}" not found`);
      }

      const objects: FileMetadata[] = [];
      const objectsStream = this.minioClient.listObjects(
        bucket,
        prefix,
        recursive,
      );

      // Handle each object individually to avoid memory issues with large buckets
      objectsStream.on('data', async (obj) => {
        // Skip thumbnails in the main listing
        if (!obj.name.startsWith(THUMBNAIL_PREFIX)) {
          try {
            // Get metadata for each file
            const metadata = await this.getFileMetadata(bucket, obj.name);
            objects.push(metadata);
          } catch (error) {
            this.logger.warn(
              `Error getting metadata for ${obj.name}: ${error.message}`,
            );
          }
        }
      });

      // Wait for the stream to finish
      return new Promise((resolve, reject) => {
        objectsStream.on('end', () => resolve(objects));
        objectsStream.on('error', (err) => reject(err));
      });
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
      // Check if the file exists first
      await this.minioClient.statObject(bucket, objectName);

      // Delete the main file
      await this.minioClient.removeObject(bucket, objectName);

      // Also try to delete the thumbnail if it exists
      try {
        const thumbnailName = `${THUMBNAIL_PREFIX}${objectName}`;

        // Check if thumbnail exists before trying to delete
        await this.minioClient.statObject(bucket, thumbnailName);
        await this.minioClient.removeObject(bucket, thumbnailName);

        this.logger.log(
          `Deleted thumbnail ${thumbnailName} from bucket ${bucket}`,
        );
      } catch (thumbnailError) {
        // It's okay if the thumbnail doesn't exist
        if (thumbnailError.code !== 'NotFound') {
          this.logger.warn(
            `Error checking/deleting thumbnail: ${thumbnailError.message}`,
          );
        }
      }

      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(
          `File "${objectName}" not found in bucket "${bucket}"`,
        );
      }

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
        // Remove objects in batches to avoid memory issues with large buckets
        await this.removeAllObjectsFromBucket(bucketName);
      }

      await this.minioClient.removeBucket(bucketName);
      this.logger.log(`Removed bucket: ${bucketName}`);
    } catch (error) {
      this.logger.error(`Error removing bucket: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Remove all objects from a bucket in batches
   *
   * @param bucketName - The name of the bucket to empty
   */
  private async removeAllObjectsFromBucket(bucketName: string): Promise<void> {
    const objectsStream = this.minioClient.listObjects(bucketName, '', true);
    const objectBatch: string[] = [];
    const BATCH_SIZE = 1000; // Delete objects in batches of 1000

    for await (const obj of objectsStream) {
      objectBatch.push(obj.name);

      // When batch reaches size, remove them
      if (objectBatch.length >= BATCH_SIZE) {
        await this.minioClient.removeObjects(bucketName, [...objectBatch]);
        objectBatch.length = 0; // Clear the batch
        this.logger.log(`Removed batch of objects from bucket ${bucketName}`);
      }
    }

    // Remove any remaining objects
    if (objectBatch.length > 0) {
      await this.minioClient.removeObjects(bucketName, [...objectBatch]);
      this.logger.log(
        `Removed final batch of objects from bucket ${bucketName}`,
      );
    }
  }

  /**
   * Check if thumbnail generation is supported for this file type
   *
   * @param mimetype - The MIME type to check
   * @returns True if thumbnail generation is supported
   */
  private isThumbnailSupported(mimetype: string): boolean {
    return mimetype.startsWith('image/') || mimetype.startsWith('video/');
  }

  /**
   * Generate a thumbnail for an uploaded file using optimized streaming
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

    try {
      // For images, use Sharp for thumbnails
      if (mimetype.startsWith('image/')) {
        // Create a read stream to avoid loading the whole image in memory
        const readStream = fs.createReadStream(filePath);

        // Create a transform stream for the thumbnail
        const transformer = sharp()
          .resize(DEFAULT_THUMBNAIL_SIZE, DEFAULT_THUMBNAIL_SIZE, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .on('error', (err) => {
            this.logger.warn(`Error in Sharp transform: ${err.message}`);
          });

        // Pass the image through Sharp's transformer
        const thumbnailStream = readStream.pipe(transformer);

        // Stream the thumbnail directly to MinIO
        await this.minioClient.putObject(
          bucket,
          thumbnailName,
          thumbnailStream,
          null, // Size is unknown in advance when streaming
          { 'Content-Type': mimetype },
        );

        return thumbnailName;
      }
      // For videos, use FFmpeg to extract a frame
      else if (mimetype.startsWith('video/')) {
        const tempThumbnailPath = `${filePath}_thumb.jpg`;

        // Create a promise to handle FFmpeg callbacks
        return new Promise((resolve, reject) => {
          // Use FFmpeg to extract a frame from the video
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
                // Upload the thumbnail to MinIO using a stream
                const thumbStream = fs.createReadStream(tempThumbnailPath);

                await this.minioClient.putObject(
                  bucket,
                  thumbnailName,
                  thumbStream,
                  null,
                  { 'Content-Type': 'image/jpeg' },
                );

                // Clean up the temp thumbnail file
                await fsPromises.unlink(tempThumbnailPath);

                resolve(thumbnailName);
              } catch (error) {
                this.logger.warn(
                  `Error uploading video thumbnail: ${error.message}`,
                );

                // Try to clean up even on error
                try {
                  await fsPromises.unlink(tempThumbnailPath);
                } catch (e) {
                  // Ignore cleanup errors
                }

                resolve(null);
              }
            });
        });
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
   * Stream a file from MinIO to a client
   *
   * @param bucket - The bucket where the file is stored
   * @param objectName - The object name in the bucket
   * @param outputStream - The output stream to write to
   * @returns Promise that resolves when streaming is complete
   */
  async streamFileToOutput(
    bucket: string,
    objectName: string,
    outputStream: Writable,
  ): Promise<void> {
    try {
      // Get the object stream from MinIO
      const objectStream = await this.minioClient.getObject(bucket, objectName);

      // Pipe the stream to the output, with error handling
      return pipelineAsync(objectStream, outputStream);
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(
          `File "${objectName}" not found in bucket "${bucket}"`,
        );
      }

      this.logger.error(`Error streaming file: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to stream file: ${error.message}`,
      );
    }
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

  /**
   * Get a readable stream for a file
   *
   * @param bucket - The bucket containing the file
   * @param objectName - The name of the file
   * @returns A readable stream for the file
   */
  async getFileStream(bucket: string, objectName: string): Promise<Readable> {
    try {
      // Check if the file exists first
      await this.minioClient.statObject(bucket, objectName);

      // Get the object stream
      return await this.minioClient.getObject(bucket, objectName);
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(
          `File "${objectName}" not found in bucket "${bucket}"`,
        );
      }

      this.logger.error(
        `Error getting file stream: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
