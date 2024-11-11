// controllers/file.controller.ts
import { Controller, Get, Param, Post, Req, Body } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { MinioFilesService } from '../services/minio-files.service';

@Controller('api/files')
export class MinioFilesController {
  constructor(private readonly minioService: MinioFilesService) { }

  // Upload file to MinIO bucket
  @Post('upload/:bucket')
  async uploadFile(
    @Param('bucket') bucket: string,
    @Req() req: FastifyRequest, // Use FastifyRequest to access the multipart data
  ) {
    const data = await req.file(); // Get the uploaded file data (stream)

    // Access file metadata
    const fileStream = data.file;
    const filename = data.filename; // Filename from the multipart form
    const mimetype = data.mimetype; // MIME type from the multipart form

    // Save file stream to MinIO (use stream handling)
    // const buffer: Buffer = await this.streamToBuffer(fileStream); // Convert stream to buffer

    await this.minioService.uploadFile(bucket, filename, fileStream, { 'Content-Type': mimetype });

    return { message: 'File uploaded successfully', fileName: filename };
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
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
