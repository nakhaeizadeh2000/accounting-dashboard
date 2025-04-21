// controllers/file.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { MinioFilesService } from '../services/minio-files.service';

@Controller('files')
export class MinioFilesController {
  constructor(private readonly minioService: MinioFilesService) {}

  // Upload multiple files to MinIO bucket
  @Post('upload/:bucket')
  async uploadFiles(
    @Param('bucket') bucket: string,
    @Req() req: FastifyRequest, // Use FastifyRequest to access the multipart data
  ) {
    try {
      const files = await req.files(); // Get multiple files from the request
      const uploadPromises = [];

      // Manually iterate over the AsyncGenerator with .next()
      let file = await files.next();
      while (!file.done) {
        // Extract file properties
        const { file: fileStream, filename, mimetype } = file.value;

        console.log(`Processing file: ${filename}, MIME type: ${mimetype}`);

        // Stream file to MinIO without buffering
        const uploadPromise = this.minioService.uploadFile(
          bucket,
          filename,
          fileStream,
          {
            'Content-Type': mimetype,
          },
        );
        uploadPromises.push(uploadPromise);

        // Move to the next file
        file = await files.next();
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      return { message: 'All files uploaded successfully' };
    } catch (error) {
      console.error('File upload error:', error);
      throw new HttpException(
        'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // TODO: must add another endpoint to return batch of files url for array of download/:bucket/:filename in request. urls must be for download or preview
  // Generate a pre-signed URL for downloading a file
  @Get('download/:bucket/:filename')
  async downloadFile(
    @Param('bucket') bucket: string,
    @Param('filename') filename: string,
  ) {
    const url = await this.minioService.getDownloadUrl(bucket, filename);
    return { url };
  }

  // Helper function to convert the stream to a buffer
  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      // TODO: chunks has error in next line : Argument of type is not assignable to parameter of type .
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
