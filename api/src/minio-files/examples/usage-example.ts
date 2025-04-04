// import { Injectable } from '@nestjs/common';
// import { MinioFilesService } from 'src/minio-files/services/minio-files.service';
// import * as fs from 'fs';
// import * as path from 'path';
// import { pipeline } from 'stream/promises';
// import * as sharp from 'sharp';

// /**
//  * Example service demonstrating efficient usage of the MinioFilesService
//  */
// @Injectable()
// export class FileManagerService {
//   constructor(private readonly minioFilesService: MinioFilesService) {}

//   /**
//    * Upload a local file to MinIO with optimized streaming
//    *
//    * @param filePath - Path to the local file
//    * @param bucket - Bucket to upload to
//    * @returns Metadata for the uploaded file
//    */
//   async uploadLocalFile(filePath: string, bucket: string) {
//     // Create the file stream from the local file
//     const fileStream = fs.createReadStream(filePath);
//     const filename = path.basename(filePath);
//     const mimetype = this.getMimetypeFromFilename(filename);

//     // Stream must be converted to the expected BusboyFileStream type
//     // In real usage, this stream usually comes from a multipart form request
//     const busboyFileStream = fileStream as any;

//     try {
//       // Upload the file with optimized streaming and resource settings
//       const fileMetadata = await this.minioFilesService.uploadFile(
//         bucket,
//         filename,
//         busboyFileStream,
//         mimetype,
//         {
//           generateThumbnail: true,
//           maxSizeMB: 50,
//           skipThumbnailForLargeFiles: true,
//           largeSizeMB: 20,
//         },
//       );

//       console.log(`File uploaded successfully: ${fileMetadata.url}`);

//       if (fileMetadata.thumbnailUrl) {
//         console.log(`Thumbnail available at: ${fileMetadata.thumbnailUrl}`);
//       }

//       return fileMetadata;
//     } catch (error) {
//       console.error(`Error uploading file: ${error.message}`);
//       throw error;
//     }
//   }

//   /**
//    * Example of processing and uploading a large image with streaming transformations
//    *
//    * @param imagePath - Path to the local image
//    * @param bucket - Bucket to upload to
//    * @returns Metadata for the uploaded file
//    */
//   async processAndUploadLargeImage(imagePath: string, bucket: string) {
//     const filename = path.basename(imagePath);
//     const uniqueFilename = `processed-${Date.now()}-${filename}`;

//     try {
//       // Ensure bucket exists
//       await this.minioFilesService.ensureBucketExists(bucket);

//       // Create a readable stream from the local file
//       const readStream = fs.createReadStream(imagePath);

//       // Create a transformation pipeline with Sharp
//       // This processes the image without loading the entire file into memory
//       const transformer = sharp()
//         .resize(1200, null, { withoutEnlargement: true })
//         .jpeg({ quality: 85 });

//       // Get a writable stream from MinIO (we'll create this method)
//       const minioWritableStream = await this.createMinioWritableStream(
//         bucket,
//         uniqueFilename,
//       );

//       // Process the image stream-to-stream with proper error handling
//       await pipeline(readStream, transformer, minioWritableStream);

//       // Generate URL for the uploaded file
//       const url = await this.minioFilesService.generatePresignedUrl(
//         bucket,
//         uniqueFilename,
//       );

//       return {
//         originalName: filename,
//         uniqueName: uniqueFilename,
//         bucket,
//         url,
//         uploadedAt: new Date(),
//       };
//     } catch (error) {
//       console.error(`Error processing and uploading image: ${error.message}`);
//       throw error;
//     }
//   }

//   /**
//    * Helper method to create a writable stream to MinIO
//    */
//   private async createMinioWritableStream(bucket: string, filename: string) {
//     const { PassThrough } = await import('stream');
//     const passThrough = new PassThrough();

//     // Start the upload operation in the background
//     const uploadPromise = this.minioFilesService
//       .getClient()
//       .putObject(bucket, filename, passThrough, null, {
//         'Content-Type': 'image/jpeg',
//       });

//     // Handle upload completion/errors in the background
//     uploadPromise.catch((err) => {
//       console.error(`Error uploading to MinIO: ${err.message}`);
//       passThrough.destroy(err);
//     });

//     return passThrough;
//   }

//   /**
//    * Example method to download and process a file on-the-fly
//    *
//    * @param bucket - Bucket containing the file
//    * @param filename - Name of the file
//    * @param outputPath - Local path to save the processed file
//    * @returns The local path where the processed file was saved
//    */
//   async downloadAndProcessImage(
//     bucket: string,
//     filename: string,
//     outputPath: string,
//   ) {
//     try {
//       // Get a stream from MinIO
//       const fileStream = await this.minioFilesService.getFileStream(
//         bucket,
//         filename,
//       );

//       // Create transformation stream
//       const transformer = sharp()
//         .grayscale() // Convert to grayscale as an example
//         .resize(800, null, { withoutEnlargement: true });

//       // Create output stream
//       const outputStream = fs.createWriteStream(outputPath);

//       // Process the entire pipeline in memory-efficient streaming fashion
//       await pipeline(fileStream, transformer, outputStream);

//       return outputPath;
//     } catch (error) {
//       console.error(`Error downloading and processing image: ${error.message}`);
//       throw error;
//     }
//   }

//   /**
//    * Get MIME type from filename extension (simple example)
//    */
//   private getMimetypeFromFilename(filename: string): string {
//     const extension = path.extname(filename).toLowerCase();

//     // Simple mapping of common extensions to MIME types
//     const mimeTypes = {
//       '.jpg': 'image/jpeg',
//       '.jpeg': 'image/jpeg',
//       '.png': 'image/png',
//       '.gif': 'image/gif',
//       '.webp': 'image/webp',
//       '.pdf': 'application/pdf',
//       '.doc': 'application/msword',
//       '.docx':
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       '.xls': 'application/vnd.ms-excel',
//       '.xlsx':
//         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       '.mp3': 'audio/mpeg',
//       '.mp4': 'video/mp4',
//       '.mov': 'video/quicktime',
//       '.zip': 'application/zip',
//       '.txt': 'text/plain',
//       '.html': 'text/html',
//       '.json': 'application/json',
//     };

//     return mimeTypes[extension] || 'application/octet-stream';
//   }
// }
