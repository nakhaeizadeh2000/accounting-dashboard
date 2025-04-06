import {
  Param,
  Req,
  Query,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  Res,
  Body,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import {
  MinioFilesService,
  FileMetadata,
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
} from './minio-files-combined-decorators';
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

@filesControllerDecorators()
export class MinioFilesController {
  constructor(private readonly minioService: MinioFilesService) {}

  @filesUploadEndpointDecorators()
  async uploadFiles(
    @Param('bucket') bucket: string,
    @Req() req: FastifyRequest,
  ): Promise<UploadFileResponseDto> {
    try {
      // Validate bucket
      if (!bucket || typeof bucket !== 'string') {
        throw new BadRequestException('Valid bucket name is required');
      }

      // Ensure the request is multipart
      if (!req.isMultipart()) {
        throw new BadRequestException('Request is not multipart');
      }

      const files = await req.files();
      const uploadResults: FileMetadataDto[] = [];

      // Check if there are any files to process
      const firstFile = await files.next();
      if (firstFile.done) {
        throw new BadRequestException('No files were provided');
      }

      // Reset to process all files
      let filePromises = [];
      let currentFile = firstFile;

      while (!currentFile.done) {
        const { file: fileStream, filename, mimetype } = currentFile.value;

        // Basic validations
        if (!fileStream) {
          console.warn(`Skipping file with missing stream: ${filename}`);
          currentFile = await files.next();
          continue;
        }

        if (!filename) {
          console.warn('Skipping file with missing filename');
          currentFile = await files.next();
          continue;
        }

        // Log the incoming file for debugging
        console.log(
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

      // If all files failed, throw an error with details
      if (successfulUploads.length === 0 && failedUploads.length > 0) {
        throw new BadRequestException({
          message: 'No files were successfully uploaded',
          failures: failedUploads,
        });
      }

      return {
        message:
          failedUploads.length > 0
            ? `${successfulUploads.length} files uploaded successfully, ${failedUploads.length} failed`
            : 'Files uploaded successfully',
        files: successfulUploads,
        failures: failedUploads.length > 0 ? failedUploads : undefined,
      };
    } catch (error) {
      // Handle errors that may occur outside the file processing
      if (error instanceof HttpException) {
        throw error;
      }

      // If it's a BadRequestException with failures, rethrow it
      if (
        error instanceof BadRequestException &&
        error.getResponse()['failures']
      ) {
        throw error;
      }

      console.error(`Upload failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        `File upload failed: ${error.message}`,
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
        filename,
        fileStream,
        mimetype,
      );

      // Convert FileMetadata to FileMetadataDto
      const fileDto: FileMetadataDto = {
        originalName: result.originalName,
        uniqueName: result.uniqueName,
        size: result.size,
        mimetype: result.mimetype,
        thumbnailName: result.thumbnailName,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        bucket: result.bucket,
        uploadedAt: result.uploadedAt,
        success: true,
      };

      // Add to results array
      results.push(fileDto);
      console.log(`Successfully uploaded: ${filename}`);
    } catch (error) {
      console.error(`Error processing file ${filename}: ${error.message}`);

      // Create an error result to include in the response
      results.push({
        originalName: filename,
        uniqueName: '',
        size: 0,
        mimetype: mimetype,
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

        // To be even more thorough, you can attempt to consume the stream
        // This is a safety measure to ensure streams don't hang
        if (fileStream && typeof fileStream.pipe === 'function') {
          const devNull = new require('stream').Writable({
            write(chunk, encoding, callback) {
              // Discard the chunk and call the callback
              callback();
            },
          });
          fileStream.pipe(devNull);
        }
      } catch (streamError) {
        // Just log if there's any issue with stream handling
        console.warn(
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
      // If direct=true is specified or the file type is in the direct download list, stream the file directly
      if (direct === 'true' && response) {
        // Get file metadata to determine content type
        const metadata = await this.minioService.getFileMetadata(
          bucket,
          filename,
        );

        // Set appropriate headers
        response.header(
          'Content-Disposition',
          `attachment; filename="${metadata.originalName}"`,
        );
        response.header('Content-Type', metadata.mimetype);

        // Start streaming the file directly to the response
        const fileStream = await this.minioService.getFileStream(
          bucket,
          filename,
        );
        return response.send(fileStream);
      } else {
        // Check if this file type should use direct download by default
        const metadata = await this.minioService.getFileMetadata(
          bucket,
          filename,
        );

        if (
          this.minioService.isDirectDownloadType(metadata.mimetype) &&
          response
        ) {
          // Set appropriate headers for streaming
          response.header(
            'Content-Disposition',
            `attachment; filename="${metadata.originalName}"`,
          );
          response.header('Content-Type', metadata.mimetype);

          // Start streaming the file directly to the response
          const fileStream = await this.minioService.getFileStream(
            bucket,
            filename,
          );
          return response.send(fileStream);
        } else {
          // Regular presigned URL generation
          const url = await this.minioService.generatePresignedUrl(
            bucket,
            filename,
          );
          return { url };
        }
      }
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException(
          `File "${filename}" not found in bucket "${bucket}"`,
        );
      }
      throw new InternalServerErrorException(
        `Failed to generate download URL: ${error.message}`,
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
      if (error.code === 'NotFound' || error instanceof NotFoundException) {
        throw new NotFoundException(
          `File "${filename}" not found in bucket "${bucket}"`,
        );
      }
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
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
