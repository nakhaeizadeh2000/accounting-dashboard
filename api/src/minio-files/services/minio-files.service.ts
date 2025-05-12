import { BusboyFileStream } from '@fastify/busboy';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
import { FileRepositoryService } from './file.repository.service';
import { DataSource } from 'typeorm';

const pipelineAsync = promisify(pipeline);
const mkdtemp = promisify(fs.mkdtemp);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);
export interface FileMetadata {
  id?: string; // Make sure ID is included
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

export interface EnvConfig {
  maxFileSizeMB: number;
  thumbnailSize: number;
  thumbnailPrefix: string;
  presignedUrlExpiry: number;
  tempDirPrefix: string;
  allowedMimeTypes: string[];
  directDownloadMimeTypes: string[];
}

@Injectable()
export class MinioFilesService {
  private minioClient: Client;
  private readonly logger = new Logger(MinioFilesService.name);
  public readonly config: EnvConfig;

  constructor(
    private minioConfigService: MinioConfigService,
    private configService: ConfigService,
    @Inject(forwardRef(() => FileRepositoryService))
    private fileRepositoryService: FileRepositoryService,
    private dataSource: DataSource, // Add this for transaction support
  ) {
    this.minioClient = this.minioConfigService.getClient();

    // Load configuration from environment variables with defaults
    this.config = {
      maxFileSizeMB: this.getEnvNumber('MINIO_MAX_FILE_SIZE_MB', 100),
      thumbnailSize: this.getEnvNumber('MINIO_THUMBNAIL_SIZE', 300),
      thumbnailPrefix: this.configService.get<string>(
        'MINIO_THUMBNAIL_PREFIX',
        'thumb_',
      ),
      presignedUrlExpiry: this.getEnvNumber(
        'MINIO_PRESIGNED_URL_EXPIRY',
        24 * 60 * 60,
      ), // 24 hours
      tempDirPrefix: this.configService.get<string>(
        'MINIO_TEMP_DIR_PREFIX',
        'minio-upload-',
      ),
      allowedMimeTypes: this.getEnvArray('MINIO_ALLOWED_MIME_TYPES', []), // Empty array means all types allowed
      directDownloadMimeTypes: this.getEnvArray(
        'MINIO_DIRECT_DOWNLOAD_MIME_TYPES',
        ['image/*', 'video/*', 'audio/*'],
      ),
    };

    this.logger.log(
      `MinioFilesService initialized with config: ${JSON.stringify(this.config)}`,
    );
  }

  /**
   * Helper to get a number from env with default
   */
  private getEnvNumber(key: string, defaultValue: number): number {
    const value = this.configService.get<string>(key);
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Helper to get an array from env with default
   */
  private getEnvArray(key: string, defaultValue: string[]): string[] {
    const value = this.configService.get<string>(key);
    if (!value) return defaultValue;
    return value.split(',').map((item) => item.trim());
  }

  /**
   * Detect proper MIME type from file content and name
   */
  private detectProperMimeType(
    filename: string,
    providedMimetype: string,
  ): string {
    // If it's not the generic octet-stream, trust the provided MIME type
    if (providedMimetype && providedMimetype !== 'application/octet-stream') {
      return providedMimetype;
    }

    // Otherwise detect from extension
    return this.getMimeTypeFromFilename(filename);
  }

  /**
   * Helper method to determine MIME type from filename
   */
  public getMimeTypeFromFilename(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext) return 'application/octet-stream';

    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
      return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    }

    // SVG special case
    if (ext === 'svg') return 'image/svg+xml';

    // Video types
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
      return `video/${ext === 'mov' ? 'quicktime' : ext}`;
    }

    // Audio types
    if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(ext)) {
      return `audio/${ext}`;
    }

    // Document types
    const docTypes = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
      csv: 'text/csv',
      html: 'text/html',
      htm: 'text/html',
    };

    return docTypes[ext] || 'application/octet-stream';
  }

  /**
   * Helper method to determine if a file might have a thumbnail
   */
  private mightHaveThumbnail(filename: string, mimetype: string): boolean {
    // If it's already detected as an image, then yes
    if (mimetype.startsWith('image/')) {
      return true;
    }

    // Check extension for image files that might have wrong mimetype
    const ext = filename.split('.').pop()?.toLowerCase();
    if (
      ext &&
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Upload a file to MinIO using optimized streaming approach
   *
   * @param bucket - The bucket to upload to
   * @param filename - The original filename
   * @param fileStream - The file stream to upload
   * @param mimetype - The file's MIME type
   * @returns Metadata for the uploaded file
   */
  async uploadFile(
    bucket: string,
    filename: string,
    fileStream: BusboyFileStream,
    mimetype: string,
  ): Promise<FileMetadata> {
    // Detect proper MIME type
    const detectedMimetype = this.detectProperMimeType(filename, mimetype);

    // Validate MIME type if restrictions are specified
    if (this.config.allowedMimeTypes.length > 0) {
      const isAllowed = this.config.allowedMimeTypes.some((allowedType) => {
        if (allowedType.endsWith('/')) {
          return detectedMimetype.startsWith(allowedType);
        }
        if (allowedType.endsWith('/*')) {
          const prefix = allowedType.slice(0, -2);
          return detectedMimetype.startsWith(prefix);
        }
        return detectedMimetype === allowedType;
      });

      if (!isAllowed) {
        throw new BadRequestException(
          `mimetype : File type ${detectedMimetype} is not allowed`,
        );
      }
    }

    // Basic validation
    if (!fileStream) {
      this.logger.error(`Missing file stream for file: ${filename}`);
      throw new BadRequestException('No file stream provided');
    }

    if (!filename) {
      this.logger.error('Missing filename');
      throw new BadRequestException('Filename is required');
    }

    // Store the original filename before any modifications
    const originalFilename = filename;

    // Create the bucket if it doesn't exist
    await this.ensureBucketExists(bucket);

    // Generate a unique filename to prevent collisions
    const uniqueName = this.generateUniqueFilename(filename);

    // Create a temporary file to save the uploaded content
    let tempDir: string | null = null;
    let tempFilePath: string | null = null;
    let fileSize = 0;
    let thumbnailName: string | null = null;

    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create a temporary directory
      tempDir = await mkdtemp(
        path.join(os.tmpdir(), this.config.tempDirPrefix),
      );
      tempFilePath = path.join(tempDir, uniqueName);

      // Save the file stream to the temporary file to ensure we have the full content
      const fileWriteStream = fs.createWriteStream(tempFilePath);

      // Set up size tracking for the file
      let isEmpty = true;
      let hasExceededMaxSize = false;

      fileStream.on('data', (chunk) => {
        isEmpty = false;
        fileSize += chunk.length;

        // Check size limit
        if (fileSize > this.config.maxFileSizeMB * 1024 * 1024) {
          hasExceededMaxSize = true;
          fileStream.destroy(
            new BadRequestException(
              `File exceeds maximum size of ${this.config.maxFileSizeMB}MB`,
            ),
          );
        }
      });

      try {
        // Pipe the file to the temporary location
        await pipelineAsync(fileStream, fileWriteStream);
      } catch (streamError) {
        // If the error is due to exceeding max size, throw that specific error
        if (hasExceededMaxSize) {
          throw new BadRequestException(
            `File exceeds maximum size of ${this.config.maxFileSizeMB}MB`,
          );
        }
        throw streamError;
      }

      // Check if the file is empty after processing the entire stream
      if (isEmpty || fileSize === 0) {
        throw new BadRequestException('File is empty or contains no data');
      }

      // Verify the file exists and has content
      const stats = await fsPromises.stat(tempFilePath);
      if (stats.size === 0) {
        throw new BadRequestException('File was saved but has zero bytes');
      }

      this.logger.debug(
        `File saved to temp path: ${tempFilePath}, size: ${stats.size} bytes`,
      );

      // Encode the filename for storage in metadata
      // Store the original filename but base64 encode it to prevent header value issues
      const encodedOriginalName =
        Buffer.from(originalFilename).toString('base64');

      // Create metadata for the file with encoded filename
      const minioMetadata = {
        'Content-Type': detectedMimetype,
        'Original-Name-Encoded': encodedOriginalName,
        'Upload-Date': new Date().toISOString(),
      };

      this.logger.debug(
        `Storing original filename "${originalFilename}" encoded as "${encodedOriginalName}"`,
      );

      // Upload the file to MinIO using the temp file
      await this.minioClient.fPutObject(
        bucket,
        uniqueName,
        tempFilePath,
        minioMetadata,
      );

      // Prepare file metadata for database
      const fileData: FileMetadata = {
        originalName: originalFilename,
        uniqueName,
        size: fileSize,
        mimetype: detectedMimetype,
        bucket,
        uploadedAt: new Date(),
      };

      // Generate thumbnail for images
      if (detectedMimetype.startsWith('image/')) {
        this.logger.debug(`Generating thumbnail for image: ${filename}`);

        thumbnailName = await this.generateThumbnail(
          bucket,
          uniqueName,
          tempFilePath,
          detectedMimetype,
        );

        if (thumbnailName) {
          fileData.thumbnailName = thumbnailName;
          fileData.thumbnailUrl = `/api/files/download/${bucket}/${encodeURIComponent(thumbnailName)}`;
        }
      }

      // Generate URL for the file
      fileData.url = `/api/files/download/${bucket}/${encodeURIComponent(uniqueName)}`;

      this.logger.debug(
        `Returning file metadata with originalName: ${fileData.originalName}, uniqueName: ${fileData.uniqueName}`,
      );

      // Save file metadata to the database using the repository service
      const createFileDto = {
        originalName: fileData.originalName,
        uniqueName: fileData.uniqueName,
        size: fileData.size,
        mimetype: fileData.mimetype,
        thumbnailName: fileData.thumbnailName,
        url: fileData.url,
        thumbnailUrl: fileData.thumbnailUrl,
        bucket: fileData.bucket,
      };

      // Use the repository service with transaction
      const savedFile =
        await this.fileRepositoryService.createFileWithTransaction(
          createFileDto,
          queryRunner.manager,
        );

      // Commit the transaction
      await queryRunner.commitTransaction();

      // Add the database ID to the result
      return {
        ...fileData,
        id: savedFile.id,
      };
    } catch (error) {
      // Rollback the transaction
      await queryRunner.rollbackTransaction();

      this.logger.error(`Error uploading file: ${error.message}`, error.stack);

      // Try to clean up the partially uploaded file from MinIO
      try {
        await this.minioClient.removeObject(bucket, uniqueName);
        if (thumbnailName) {
          await this.minioClient.removeObject(bucket, thumbnailName);
        }
      } catch (cleanupError) {
        this.logger.warn(
          `Failed to clean up partial upload: ${cleanupError.message}`,
        );
      }

      // Rethrow the original error with appropriate status code
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          `Failed to upload file: ${error.message}`,
        );
      }
    } finally {
      // Release the query runner
      await queryRunner.release();

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
   * List all objects in a bucket reliably, handling pagination
   *
   * @param bucket - The bucket name
   * @param prefix - Optional prefix filter
   * @param recursive - Whether to list recursively
   * @returns Complete array of all object names
   */
  private async listAllObjectsInBucket(
    bucket: string,
    prefix = '',
    recursive = true,
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const objects: string[] = [];
      let streamError = null;

      // Create stream for object listing
      const objectsStream = this.minioClient.listObjects(
        bucket,
        prefix,
        recursive,
      );

      // Handle data events
      objectsStream.on('data', (obj) => {
        if (obj.name) {
          objects.push(obj.name);
        }
      });

      // Handle errors during streaming
      objectsStream.on('error', (err) => {
        streamError = err;
        this.logger.error(
          `Error listing objects in bucket ${bucket}: ${err.message}`,
        );
        reject(err);
      });

      // Handle stream completion
      objectsStream.on('end', () => {
        // Only resolve if no error occurred
        if (!streamError) {
          this.logger.debug(
            `Listed ${objects.length} objects from bucket ${bucket}`,
          );
          resolve(objects);
        }
      });
    });
  }

  /**
   * Get file metadata with optimized thumbnail handling
   *
   * @param bucket - The bucket name
   * @param objectName - The object name
   * @param hasThumbnail - Whether we already know a thumbnail exists
   * @returns File metadata or null if retrieval fails
   */
  private async getFileMetadataWithThumbnails(
    bucket: string,
    objectName: string,
    hasThumbnail: boolean,
  ): Promise<FileMetadata | null> {
    try {
      // Get object stats
      const stat = await this.minioClient.statObject(bucket, objectName);

      // Get proper MIME type
      let mimetype =
        stat.metaData['Content-Type'] || 'application/octet-stream';

      // Better detect MIME type if it's the generic octet-stream
      if (mimetype === 'application/octet-stream') {
        mimetype = this.getMimeTypeFromFilename(objectName);
      }

      // Get the original filename - handle both encoded and non-encoded versions for backward compatibility
      let originalName = objectName;

      if (stat.metaData['Original-Name-Encoded']) {
        // If we have the encoded version, decode it
        try {
          originalName = Buffer.from(
            stat.metaData['Original-Name-Encoded'],
            'base64',
          ).toString();
          this.logger.debug(
            `Decoded original filename from metadata: ${originalName}`,
          );
        } catch (decodeError) {
          this.logger.warn(
            `Failed to decode original filename: ${decodeError.message}`,
          );
          // Fall back to the object name if decoding fails
          originalName = objectName;
        }
      } else if (stat.metaData['Original-Name']) {
        // For backward compatibility with existing files
        originalName = stat.metaData['Original-Name'];
        this.logger.debug(
          `Found non-encoded original filename in metadata: ${originalName}`,
        );
      } else {
        this.logger.debug(
          `No original filename found in metadata, using object name: ${objectName}`,
        );
      }

      // Create base metadata
      const metadata: FileMetadata = {
        originalName: originalName,
        uniqueName: objectName,
        size: stat.size,
        mimetype: mimetype,
        bucket,
        uploadedAt: stat.lastModified,
      };

      // Generate main file URL
      metadata.url = await this.generatePresignedUrl(bucket, objectName);

      // If we know a thumbnail exists, add it
      if (hasThumbnail) {
        const thumbnailName = `${this.config.thumbnailPrefix}${objectName}`;
        metadata.thumbnailName = thumbnailName;
        metadata.thumbnailUrl = await this.generatePresignedUrl(
          bucket,
          thumbnailName,
        );
      }
      // Otherwise check if we should look for a thumbnail based on detected MIME type
      else if (this.mightHaveThumbnail(objectName, mimetype)) {
        try {
          const thumbnailName = `${this.config.thumbnailPrefix}${objectName}`;
          await this.minioClient.statObject(bucket, thumbnailName);
          metadata.thumbnailName = thumbnailName;
          metadata.thumbnailUrl = await this.generatePresignedUrl(
            bucket,
            thumbnailName,
          );
        } catch (thumbnailError) {
          // Thumbnail doesn't exist, ignore
        }
      }

      return metadata;
    } catch (error) {
      this.logger.warn(
        `Failed to get metadata for ${objectName}: ${error.message}`,
      );
      return null; // Skip this file if we can't get metadata
    }
  }

  /**
   * Generate a pre-signed URL for downloading or viewing a file
   *
   * @param bucket - The bucket where the file is stored
   * @param objectName - The object name in the bucket
   * @param expirySeconds - URL expiry time in seconds (default from config)
   * @returns Pre-signed URL for the file
   */
  async generatePresignedUrl(
    bucket: string,
    objectName: string,
    expirySeconds?: number,
  ): Promise<string> {
    try {
      // Create a direct API URL that will work through NGINX
      const publicEndpoint =
        this.minioConfigService.getPublicEndpoint() || 'localhost';

      // Ensure objectName is properly encoded in the URL
      const encodedObjectName = encodeURIComponent(objectName);

      // Build the direct API URL
      const directUrl = `http://${publicEndpoint}/api/files/download/${bucket}/${encodedObjectName}`;

      this.logger.debug(`Generated API URL: ${directUrl}`);

      return directUrl;
    } catch (error) {
      this.logger.error(
        `Error generating URL for ${objectName}: ${error.message}`,
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
   * @param expirySeconds - URL expiry time in seconds (default from config)
   * @returns Map of filenames to their pre-signed URLs
   */
  async generateBatchPresignedUrls(
    bucket: string,
    filenames: string[],
    expirySeconds?: number,
  ): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();
    const actualExpiry = expirySeconds || this.config.presignedUrlExpiry;

    // Generate URLs sequentially to avoid overwhelming the MinIO server
    for (const filename of filenames) {
      try {
        const url = await this.generatePresignedUrl(
          bucket,
          filename,
          actualExpiry,
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
      // Check if this is a thumbnail request (filename starts with thumbnail prefix)
      const isThumbnail = objectName.startsWith(this.config.thumbnailPrefix);

      // If it's a thumbnail, try to find the original file first
      if (isThumbnail) {
        // Extract the original filename from the thumbnail name
        const originalFileName = objectName.substring(
          this.config.thumbnailPrefix.length,
        );

        // Find the original file in the database
        const originalFile =
          await this.fileRepositoryService.findByUniqueName(originalFileName);

        if (originalFile && originalFile.thumbnailName === objectName) {
          // Return thumbnail metadata from the original file's record
          return {
            id: `thumb_${originalFile.id}`, // Generate a pseudo-ID for the thumbnail
            originalName: `thumb_${originalFile.originalName}`,
            uniqueName: objectName,
            size: 0, // We don't know the exact size of the thumbnail
            mimetype: originalFile.mimetype,
            thumbnailName: objectName,
            url: `/api/files/download/${bucket}/${encodeURIComponent(objectName)}`,
            thumbnailUrl: `/api/files/download/${bucket}/${encodeURIComponent(objectName)}`,
            bucket: bucket,
            uploadedAt: originalFile.createdAt,
          };
        }
      }

      // First, attempt to find the file in the database by uniqueName
      const dbFile =
        await this.fileRepositoryService.findByUniqueName(objectName);

      if (dbFile) {
        // If found in the database, return the database metadata
        return {
          id: dbFile.id,
          originalName: dbFile.originalName,
          uniqueName: dbFile.uniqueName,
          size: dbFile.size,
          mimetype: dbFile.mimetype,
          thumbnailName: dbFile.thumbnailName,
          url:
            dbFile.url ||
            `/api/files/download/${bucket}/${encodeURIComponent(dbFile.uniqueName)}`,
          thumbnailUrl:
            dbFile.thumbnailUrl ||
            (dbFile.thumbnailName
              ? `/api/files/download/${bucket}/${encodeURIComponent(dbFile.thumbnailName)}`
              : undefined),
          bucket: dbFile.bucket,
          uploadedAt: dbFile.createdAt,
        };
      }

      // If not found in the database, fall back to MinIO for thumbnails or special files
      if (isThumbnail) {
        try {
          // For thumbnails, check directly in MinIO
          const stat = await this.minioClient.statObject(bucket, objectName);

          // If it exists in MinIO, construct metadata
          return {
            originalName: objectName,
            uniqueName: objectName,
            size: stat.size,
            mimetype:
              stat.metaData['Content-Type'] ||
              this.getMimeTypeFromFilename(objectName),
            bucket: bucket,
            uploadedAt: stat.lastModified,
            url: `/api/files/download/${bucket}/${encodeURIComponent(objectName)}`,
          };
        } catch (minioError) {
          this.logger.error(
            `File ${objectName} not found in MinIO: ${minioError.message}`,
          );
          throw new NotFoundException(`File "${objectName}" not found`);
        }
      }

      // For non-thumbnails that aren't in the database, throw not found
      this.logger.error(
        `File metadata for ${objectName} not found in database`,
      );
      throw new NotFoundException(`File "${objectName}" metadata not found`);
    } catch (error) {
      this.logger.error(
        `Error getting file metadata: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get a list of files in a bucket with improved MIME type detection
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

      // Get all files from the database for this bucket
      const dbFiles = await this.fileRepositoryService.findByBucket(bucket);

      // Filter by prefix if needed
      let filteredFiles = dbFiles;
      if (prefix) {
        filteredFiles = dbFiles.filter((file) =>
          file.uniqueName.startsWith(prefix),
        );
      }

      // Transform to FileMetadata
      const results = await Promise.all(
        filteredFiles.map(async (dbFile) => {
          return {
            id: dbFile.id,
            originalName: dbFile.originalName,
            uniqueName: dbFile.uniqueName,
            size: dbFile.size,
            mimetype: dbFile.mimetype,
            thumbnailName: dbFile.thumbnailName,
            url:
              dbFile.url ||
              (await this.generatePresignedUrl(bucket, dbFile.uniqueName)),
            thumbnailUrl:
              dbFile.thumbnailUrl ||
              (dbFile.thumbnailName
                ? await this.generatePresignedUrl(bucket, dbFile.thumbnailName)
                : undefined),
            bucket: dbFile.bucket,
            uploadedAt: dbFile.createdAt,
          };
        }),
      );

      return results;
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
      // First check if the file exists in MinIO
      let fileExists = true;
      try {
        await this.minioClient.statObject(bucket, objectName);
      } catch (statError) {
        if (statError.code === 'NotFound') {
          fileExists = false;
        } else {
          throw statError;
        }
      }

      // Find file in database
      const dbFile =
        await this.fileRepositoryService.findByUniqueName(objectName);

      // Delete file from MinIO if it exists
      if (fileExists) {
        await this.minioClient.removeObject(bucket, objectName);
        this.logger.log(
          `Deleted file ${objectName} from MinIO bucket ${bucket}`,
        );

        // Also delete thumbnail if it exists
        try {
          const thumbnailName = `${this.config.thumbnailPrefix}${objectName}`;
          await this.minioClient.removeObject(bucket, thumbnailName);
          this.logger.log(
            `Deleted thumbnail ${thumbnailName} from bucket ${bucket}`,
          );
        } catch (thumbnailError) {
          this.logger.warn(
            `Error deleting thumbnail: ${thumbnailError.message}`,
          );
        }
      }

      // Delete from database if record exists
      if (dbFile) {
        await this.fileRepositoryService.remove(dbFile.id);
        this.logger.log(
          `Deleted file record with ID ${dbFile.id} from database`,
        );
      } else {
        this.logger.warn(`No database record found for file ${objectName}`);
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
   * Generate a thumbnail for an image file
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
    // Only generate thumbnails for images
    if (!mimetype.startsWith('image/')) {
      return null;
    }

    const thumbnailName = `${this.config.thumbnailPrefix}${objectName}`;
    const thumbnailPath = `${filePath}_thumb`;

    try {
      // Generate a thumbnail file to disk first
      await sharp(filePath)
        .resize(this.config.thumbnailSize, this.config.thumbnailSize, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(thumbnailPath);

      // Upload the thumbnail to MinIO
      await this.minioClient.fPutObject(bucket, thumbnailName, thumbnailPath, {
        'Content-Type': mimetype,
      });

      // Clean up the temporary thumbnail file
      try {
        await unlink(thumbnailPath);
      } catch (err) {
        this.logger.warn(`Failed to clean up temp thumbnail: ${err.message}`);
      }

      return thumbnailName;
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
    let objectStream: Readable;
    try {
      // Get the object stream from MinIO
      objectStream = await this.minioClient.getObject(bucket, objectName);

      // Pipe the stream to the output, with error handling
      return await pipelineAsync(objectStream, outputStream);
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
    } finally {
      // Ensure we clean up if needed
      if (objectStream && typeof objectStream.destroy === 'function') {
        objectStream.destroy();
      }
    }
  }

  /**
   * Check if a file's MIME type should use direct download
   *
   * @param mimetype - The MIME type to check
   * @returns True if the file should use direct download
   */
  isDirectDownloadType(mimetype: string): boolean {
    return this.config.directDownloadMimeTypes.some((type) => {
      if (type.endsWith('*')) {
        return mimetype.startsWith(type.slice(0, -1));
      }
      return mimetype === type;
    });
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
