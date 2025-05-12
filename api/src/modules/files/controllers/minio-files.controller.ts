import {
  Param,
  Req,
  Query,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  Res,
  Body,
  Logger,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import {
  MinioFilesService,
} from '../services/minio-files.service';
import { FileMetadataDto } from '../dto/minio-files.dto';
import {
  filesControllerDecorators,
  filesUploadEndpointDecorators,
  filesDownloadEndpointDecorators,
  filesBatchDownloadEndpointDecorators,
  filesMetadataEndpointDecorators,
  filesListEndpointDecorators,
  filesDeleteEndpointDecorators,
  filesBucketsListEndpointDecorators,
  filesBucketCreateEndpointDecorators,
  filesBucketDeleteEndpointDecorators,
} from '../decorators/minio-files-combined-decorators';
import {
  UploadFileResponseDto,
  DownloadUrlResponseDto,
  BatchDownloadUrlResponseDto,
  FileMetadataResponseDto,
  ListFilesResponseDto,
  MessageResponseDto,
  BucketsResponseDto,
  BucketConfigDto,
} from '../dto/minio-files.dto';
import { BusboyFileStream } from '@fastify/busboy';
import { Writable } from 'stream';
import { ValidationException } from 'src/common/exceptions/validation.exception';

@filesControllerDecorators()
export class MinioFilesController {
  private readonly logger = new Logger(MinioFilesService.name);
  constructor(private readonly minioService: MinioFilesService) { }

  @filesUploadEndpointDecorators()
  async uploadFiles(
    @Param('bucket') bucket: string,
    @Req() req: FastifyRequest,
  ): Promise<UploadFileResponseDto> {
    try {
      // Validate bucket
      if (!bucket || typeof bucket !== 'string') {
        throw new BadRequestException('bucket : Valid bucket name is required');
      }

      // Ensure the request is multipart
      if (!req.isMultipart()) {
        throw new BadRequestException(
          'files : Request must be multipart format',
        );
      }

      const files = await req.files();
      const uploadResults: FileMetadataDto[] = [];

      // Check if there are any files to process
      const firstFile = await files.next();
      if (firstFile.done) {
        throw new BadRequestException('files : No files were provided');
      }

      // Reset to process all files
      let filePromises = [];
      let currentFile = firstFile;

      while (!currentFile.done) {
        const { file: fileStream, filename, mimetype } = currentFile.value;

        // Basic validations
        if (!fileStream) {
          this.logger.warn(`Skipping file with missing stream: ${filename}`);
          currentFile = await files.next();
          continue;
        }

        if (!filename) {
          this.logger.warn('Skipping file with missing filename');
          currentFile = await files.next();
          continue;
        }

        // Log the incoming file for debugging
        this.logger.log(
          `Processing file: ${filename}, mimetype: ${mimetype || 'unknown'}`,
        );

        // Process file upload asynchronously
        const uploadPromise = this.processFileUpload(
          bucket,
          fileStream,
          filename,
          mimetype,
          uploadResults,
        );
        filePromises.push(uploadPromise);

        // Move to the next file
        currentFile = await files.next();
      }

      // Wait for all uploads to complete
      await Promise.all(filePromises);

      // Separate successful and failed uploads
      const successfulUploads = uploadResults.filter((file) => !file.error);
      const failedUploads = uploadResults.filter((file) => !!file.error);

      // If all files failed, throw a properly formatted error
      if (successfulUploads.length === 0 && failedUploads.length > 0) {
        // Format error messages according to your standard format for ValidationException
        const errorMessages = failedUploads.map(
          (file) => `${file.originalName} : ${file.error}`,
        );

        throw new ValidationException(errorMessages);
      }
      return {
        message: 'Files uploaded successfully',
        files: successfulUploads,
        // Don't include failures in success response, they're handled via exceptions
      };
    } catch (error) {
      // Handle errors that may occur outside the file processing
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Upload failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        `file : Upload failed - ${error.message}`,
      );
    }
  }

  /**
   * Helper method to process a single file upload
   */
  private async processFileUpload(
    bucket: string,
    fileStream: BusboyFileStream,
    filename: string,
    mimetype: string,
    results: FileMetadataDto[],
  ): Promise<void> {
    try {
      // Process and upload file using the optimized service
      const result = await this.minioService.uploadFile(
        bucket,
        filename, // This is the actual original filename that should be preserved
        fileStream,
        mimetype,
      );

      // Convert FileMetadata to FileMetadataDto
      const fileDto: FileMetadataDto = {
        id: result.id,
        originalName: filename, // Ensure we use the original filename passed to the method
        uniqueName: result.uniqueName,
        size: result.size,
        mimetype: result.mimetype,
        thumbnailName: result.thumbnailName,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        bucket: result.bucket,
        uploadedAt: result.uploadedAt,
      };

      // Add to results array
      results.push(fileDto);
      this.logger.log(
        `Successfully uploaded: ${filename} with ID ${result.id}`,
      );
    } catch (error) {
      this.logger.error(`Error processing file ${filename}: ${error.message}`);

      // Create an error result to include in the response
      results.push({
        id: '', // No ID for failed uploads
        originalName: filename, // Again, preserve the original filename
        uniqueName: '',
        size: 0,
        mimetype: mimetype,
        url: '', // Empty URL to satisfy TypeScript
        bucket: bucket,
        uploadedAt: new Date(),
        error: error.message, // Add error information
        success: false, // Mark as failed
      });

      // Ensure the stream is fully consumed to prevent hanging
      try {
        if (fileStream && typeof fileStream.resume === 'function') {
          fileStream.resume();
        }

        // To be even more thorough, attempt to consume the stream
        if (fileStream && typeof fileStream.pipe === 'function') {
          const devNull = new Writable({
            write(chunk, encoding, callback) {
              // Discard the chunk and call the callback
              callback();
            },
          });
          fileStream.pipe(devNull);
        }
      } catch (streamError) {
        // Just log if there's any issue with stream handling
        this.logger.warn(
          `Error handling stream for ${filename}: ${streamError.message}`,
        );
      }
    }
  }

  @filesDownloadEndpointDecorators()
  async downloadFile(
    @Param('bucket') bucket: string,
    @Param('filename') filename: string,
    @Query('direct') direct?: string,
    @Res() response?: FastifyReply,
  ): Promise<DownloadUrlResponseDto | void> {
    try {
      // Check if this is a thumbnail request
      const isThumbnail = filename.startsWith(
        this.minioService.config.thumbnailPrefix,
      );

      try {
        // Get metadata - this will now handle thumbnails
        const metadata = await this.minioService.getFileMetadata(
          bucket,
          filename,
        );

        // Stream file directly from MinIO to client (for direct=true)
        if (
          direct === 'true' ||
          this.minioService.isDirectDownloadType(metadata.mimetype)
        ) {
          // Set appropriate headers using metadata
          const isAttachment =
            direct === 'true' && !metadata.mimetype.startsWith('image/');
          const disposition = isAttachment
            ? `attachment; filename="${encodeURIComponent(metadata.originalName)}"`
            : `inline; filename="${encodeURIComponent(metadata.originalName)}"`;

          response.header('Content-Disposition', disposition);
          response.header('Content-Type', metadata.mimetype);
          if (metadata.size > 0) {
            response.header('Content-Length', metadata.size.toString());
          }

          // Stream directly from MinIO to client
          const fileStream = await this.minioService.getFileStream(
            bucket,
            filename,
          );
          return response.send(fileStream);
        } else {
          // Return URL for indirect download
          const directUrl = `/api/files/download/${bucket}/${filename}`;
          return { url: directUrl };
        }
      } catch (metadataError) {
        // If it's a not found error for thumbnails, we can try to stream directly from MinIO
        if (isThumbnail && metadataError instanceof NotFoundException) {
          try {
            // Try to check if the file exists directly in MinIO
            const fileStream = await this.minioService.getFileStream(
              bucket,
              filename,
            );

            // Set headers for the thumbnail
            response.header(
              'Content-Disposition',
              `inline; filename="${encodeURIComponent(filename)}"`,
            );
            response.header(
              'Content-Type',
              this.minioService.getMimeTypeFromFilename(filename),
            );

            // Stream directly
            return response.send(fileStream);
          } catch (minioError) {
            throw new NotFoundException(
              `File "${filename}" not found in bucket "${bucket}"`,
            );
          }
        } else {
          // Re-throw the original error
          throw metadataError;
        }
      }
    } catch (error) {
      // Error handling
      if (error.code === 'NotFound' || error instanceof NotFoundException) {
        throw new NotFoundException(
          `File "${filename}" not found in bucket "${bucket}"`,
        );
      }
      this.logger.error(
        `Error downloading file: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to download file: ${error.message}`,
      );
    }
  }

  @filesBatchDownloadEndpointDecorators()
  async batchDownloadFiles(
    @Query('bucket') bucket: string,
    @Query('filenames') filenamesStr: string,
    @Query('expiry') expiry?: string,
  ): Promise<BatchDownloadUrlResponseDto> {
    if (!bucket || !filenamesStr) {
      throw new BadRequestException('Both bucket and filenames are required');
    }

    const filenames = filenamesStr.split(',');
    // Expiry is now optional as we have a default in the service
    const expirySeconds = expiry ? parseInt(expiry) : undefined;

    try {
      const urlsMap = await this.minioService.generateBatchPresignedUrls(
        bucket,
        filenames,
        expirySeconds,
      );

      // Convert Map to an object for the response
      const urlsObject = {};
      for (const [filename, url] of urlsMap.entries()) {
        urlsObject[filename] = url;
      }

      return { urls: urlsObject };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate batch download URLs: ${error.message}`,
      );
    }
  }

  @filesMetadataEndpointDecorators()
  async getFileMetadata(
    @Param('bucket') bucket: string,
    @Param('filename') filename: string,
  ): Promise<FileMetadataResponseDto> {
    try {
      const metadata = await this.minioService.getFileMetadata(
        bucket,
        filename,
      );
      // Convert FileMetadata to FileMetadataDto
      const metadataDto: FileMetadataDto = {
        id: metadata.id,
        originalName: metadata.originalName,
        uniqueName: metadata.uniqueName,
        size: metadata.size,
        mimetype: metadata.mimetype,
        thumbnailName: metadata.thumbnailName,
        url: metadata.url,
        thumbnailUrl: metadata.thumbnailUrl,
        bucket: metadata.bucket,
        uploadedAt: metadata.uploadedAt,
      };
      return { metadata: metadataDto };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get file metadata: ${error.message}`,
      );
    }
  }

  @filesListEndpointDecorators()
  async listFiles(
    @Param('bucket') bucket: string,
    @Query('prefix') prefix?: string,
    @Query('recursive') recursive?: string,
  ): Promise<ListFilesResponseDto> {
    try {
      const isRecursive = recursive !== 'false';
      const serviceFiles = await this.minioService.listFiles(
        bucket,
        prefix || '',
        isRecursive,
      );

      // Convert FileMetadata[] to FileMetadataDto[]
      const filesDtos: FileMetadataDto[] = serviceFiles.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        uniqueName: file.uniqueName,
        size: file.size,
        mimetype: file.mimetype,
        thumbnailName: file.thumbnailName,
        url: file.url,
        thumbnailUrl: file.thumbnailUrl,
        bucket: file.bucket,
        uploadedAt: file.uploadedAt,
      }));

      return { files: filesDtos };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to list files: ${error.message}`,
      );
    }
  }

  @filesDeleteEndpointDecorators()
  async deleteFile(
    @Param('bucket') bucket: string,
    @Param('filename') filename: string,
  ): Promise<MessageResponseDto> {
    try {
      await this.minioService.deleteFile(bucket, filename);
      return {
        message: `File "${filename}" deleted successfully from bucket "${bucket}"`,
      };
    } catch (error) {
      // Only rethrow if it's not a NotFound error, since that means the file is already gone
      if (error.code !== 'NotFound' && !(error instanceof NotFoundException)) {
        this.logger.error(`Error deleting file: ${error.message}`, error.stack);
        throw new InternalServerErrorException(
          `Failed to delete file: ${error.message}`,
        );
      }

      // If it's a NotFound error, still return a success message
      // since the end goal (file not existing) is achieved
      return {
        message: `File "${filename}" no longer exists in bucket "${bucket}"`,
      };
    }
  }

  @filesBucketsListEndpointDecorators()
  async listBuckets(): Promise<BucketsResponseDto> {
    try {
      const buckets = await this.minioService.listBuckets();
      return { buckets };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to list buckets: ${error.message}`,
      );
    }
  }

  @filesBucketCreateEndpointDecorators()
  async createBucket(
    @Param('name') bucketName: string,
    @Query('region') region?: string,
    @Query('publicPolicy') publicPolicy?: string,
    @Body() config?: BucketConfigDto,
  ): Promise<MessageResponseDto> {
    try {
      const bucketConfig = config || {
        region: region || 'us-east-1',
        publicPolicy: publicPolicy !== 'false',
      };

      await this.minioService.createBucket(bucketName, bucketConfig);
      return { message: `Bucket "${bucketName}" created successfully` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create bucket: ${error.message}`,
      );
    }
  }

  @filesBucketDeleteEndpointDecorators()
  async deleteBucket(
    @Param('name') bucketName: string,
    @Query('force') force?: string,
  ): Promise<MessageResponseDto> {
    try {
      const forceDelete = force === 'true';
      await this.minioService.removeBucket(bucketName, forceDelete);
      return { message: `Bucket "${bucketName}" deleted successfully` };
    } catch (error) {
      if (error.code === 'NoSuchBucket') {
        throw new NotFoundException(`Bucket "${bucketName}" not found`);
      }
      throw new InternalServerErrorException(
        `Failed to delete bucket: ${error.message}`,
      );
    }
  }
}
