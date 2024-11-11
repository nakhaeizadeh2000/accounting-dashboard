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

  // Upload file to MinIO bucket
  @Post('upload/:bucket')
  async uploadFile(
    @Param('bucket') bucket: string,
    @Req() req: FastifyRequest, // Use FastifyRequest to access the multipart data
  ) {
    try {
      const data = await req.file();
      const fileStream = data.file;
      const filename = data.filename;
      const mimetype = data.mimetype;

      await this.minioService.uploadFile(bucket, filename, fileStream, {
        'Content-Type': mimetype,
      });

      return { message: 'File uploaded successfully', fileName: filename };
    } catch (error) {
      console.error('File upload error:', error);
      throw new HttpException(
        'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
