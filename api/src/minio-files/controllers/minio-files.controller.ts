import {
  Param,
  Req,
  Query,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  Body,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import {
  MinioFilesService,
  FileMetadata,
  FileUploadOptions,
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

@filesControllerDecorators()
export class MinioFilesController {
  constructor(private readonly minioService: MinioFilesService) {}

  @filesUploadEndpointDecorators()
  async uploadFiles(
    @Param('bucket') bucket: string,
    @Req() req: FastifyRequest,
    @Query('generateThumbnail') generateThumbnail?: string,
    @Query('maxSizeMB') maxSizeMB?: string,
    @Query('allowedMimeTypes') allowedMimeTypesStr?: string,
  ): Promise<UploadFileResponseDto> {
    try {
      const allowedMimeTypes = allowedMimeTypesStr
        ? allowedMimeTypesStr.split(',')
        : [];

      const options: FileUploadOptions = {
        generateThumbnail: generateThumbnail !== 'false',
        maxSizeMB: maxSizeMB ? parseFloat(maxSizeMB) : undefined,
        allowedMimeTypes:
          allowedMimeTypes.length > 0 ? allowedMimeTypes : undefined,
      };

      const files = await req.files();
      const uploadResults: FileMetadataDto[] = [];

      // Manually iterate over the AsyncGenerator with .next()
      let file = await files.next();

      if (file.done) {
        throw new BadRequestException('No files were provided');
      }

      while (!file.done) {
        // Extract file properties
        const { file: fileStream, filename, mimetype } = file.value;

        try {
          // Process and upload file
          const result = await this.minioService.uploadFile(
            bucket,
            filename,
            fileStream,
            mimetype,
            options,
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
          };

          uploadResults.push(fileDto);
        } catch (error) {
          throw new HttpException(
            `Error uploading file ${filename}: ${error.message}`,
            error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        // Move to the next file
        file = await files.next();
      }

      return {
        message: 'Files uploaded successfully',
        files: uploadResults,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `File upload failed: ${error.message}`,
      );
    }
  }

  @filesDownloadEndpointDecorators()
  async downloadFile(
    @Param('bucket') bucket: string,
    @Param('filename') filename: string,
    @Query('expiry') expiry?: string,
  ): Promise<DownloadUrlResponseDto> {
    try {
      const expirySeconds = expiry ? parseInt(expiry) : 24 * 60 * 60;
      const url = await this.minioService.generatePresignedUrl(
        bucket,
        filename,
        expirySeconds,
      );
      return { url };
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
    const expirySeconds = expiry ? parseInt(expiry) : 24 * 60 * 60;

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
      if (error.code === 'NotFound') {
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
