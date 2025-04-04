# MinioFiles Module

A high-performance, resource-efficient file management module for NestJS applications using MinIO for storage. This module provides comprehensive file handling with minimal memory footprint, even for large files.

## Features

- **Memory-Efficient Streaming**: Direct streaming from client to MinIO with minimal RAM usage
- **Large File Support**: Optimized for handling large files (GB+) without memory issues
- **Thumbnail Generation**: Automatic, configurable thumbnail creation for images and videos
- **Flexible API**: Upload, download, list, and manage files and buckets
- **Direct Streaming**: Stream files directly to clients without intermediate storage
- **Resource Control**: Configurable limits and optimizations to control resource usage
- **Policy-Based Access Control**: Integrated with CASL for fine-grained permissions

## Installation

### Dependencies

```bash
npm install --save minio sharp fluent-ffmpeg stream uuid
npm install --save-dev @types/minio @types/sharp @types/fluent-ffmpeg @types/uuid
```

### Module Setup

```typescript
// app.module.ts
import { MinioFilesModule } from './minio-files/minio-files.module';

@Module({
  imports: [
    // other modules
    MinioFilesModule,
  ],
})
export class AppModule {}
```

## Configuration

### Environment Variables

Add these environment variables to your `.env` file:

```
MINIO_ENDPOINT=your-minio-host
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_REGION=us-east-1
```

### Docker Setup

For local development, use the provided Docker Compose configuration:

```yaml
# docker-compose-minio.yml
version: '3.7'

services:
  minio:
    image: minio/minio:latest
    container_name: minio
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - app-network

volumes:
  minio-data:

networks:
  app-network:
    driver: bridge
```

Start the MinIO server:

```bash
docker-compose -f docker-compose-minio.yml up -d
```

This will start a MinIO server accessible at:

- API: http://localhost:9000
- Console: http://localhost:9001

## API Endpoints

### File Operations

| Method   | Endpoint                            | Description                               |
| -------- | ----------------------------------- | ----------------------------------------- |
| `POST`   | `/files/upload/:bucket`             | Upload files to a bucket                  |
| `GET`    | `/files/download/:bucket/:filename` | Get file (presigned URL or direct stream) |
| `GET`    | `/files/batch-download`             | Get presigned URLs for multiple files     |
| `GET`    | `/files/metadata/:bucket/:filename` | Get metadata for a file                   |
| `GET`    | `/files/list/:bucket`               | List files in a bucket                    |
| `DELETE` | `/files/delete/:bucket/:filename`   | Delete a file                             |

### Bucket Operations

| Method   | Endpoint               | Description         |
| -------- | ---------------------- | ------------------- |
| `GET`    | `/files/buckets`       | List all buckets    |
| `POST`   | `/files/buckets/:name` | Create a new bucket |
| `DELETE` | `/files/buckets/:name` | Delete a bucket     |

## Usage Examples

### Uploading Files

#### Basic Upload

```typescript
// Using fetch API
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/files/upload/my-bucket', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result.files);
```

#### Upload with Options

```typescript
// With custom options
const formData = new FormData();
formData.append('file', file);

const response = await fetch(
  '/api/files/upload/my-bucket?generateThumbnail=true&maxSizeMB=50&skipThumbnailForLargeFiles=true&largeSizeMB=20',
  {
    method: 'POST',
    body: formData,
  },
);

const result = await response.json();
console.log(result.files);
```

### Downloading Files

#### Using Presigned URLs

```typescript
// Get a presigned URL
const response = await fetch('/api/files/download/my-bucket/my-file.jpg');
const result = await response.json();
window.open(result.url, '_blank');
```

#### Direct Streaming

```typescript
// Stream file directly to client
window.location.href = '/api/files/download/my-bucket/my-file.jpg?direct=true';
```

### Listing Files

```typescript
// Basic listing
const response = await fetch('/api/files/list/my-bucket');
const result = await response.json();
console.log(result.files);

// Filtered listing
const filteredResponse = await fetch(
  '/api/files/list/my-bucket?prefix=reports/2023/&recursive=true',
);
const filteredFiles = await filteredResponse.json();
console.log(filteredFiles.files);
```

### Managing Buckets

```typescript
// Create a bucket with a public policy
const createResponse = await fetch(
  '/api/files/buckets/new-bucket?publicPolicy=true&region=us-east-1',
  { method: 'POST' },
);

// List all buckets
const bucketsResponse = await fetch('/api/files/buckets');
const buckets = await bucketsResponse.json();
console.log(buckets);

// Delete a bucket and all its contents
const deleteResponse = await fetch('/api/files/buckets/old-bucket?force=true', {
  method: 'DELETE',
});
```

## Advanced Features

### File Metadata

Each file upload returns metadata with this structure:

```typescript
{
  originalName: string;     // Original filename
  uniqueName: string;       // Unique filename in MinIO
  size: number;             // File size in bytes
  mimetype: string;         // File MIME type
  thumbnailName?: string;   // Thumbnail filename (if generated)
  url: string;              // Presigned URL for access
  thumbnailUrl?: string;    // Presigned URL for thumbnail
  bucket: string;           // Bucket name
  uploadedAt: Date;         // Upload timestamp
}
```

### Thumbnail Generation

Thumbnails are automatically generated for supported file types:

- **Images**: Using Sharp for efficient processing
- **Videos**: Using FFmpeg to extract frames

Thumbnail configuration options:

- `generateThumbnail`: Enable/disable thumbnail generation (default: `true`)
- `skipThumbnailForLargeFiles`: Skip thumbnails for large files (default: `true`)
- `largeSizeMB`: Size threshold for skipping thumbnails (default: `100`)

Thumbnails are stored with prefix `thumb_` in the same bucket as the original file.

### Resource Optimization

The module includes several features to minimize resource usage:

1. **Streaming Architecture**

   - Files are streamed directly from client to MinIO
   - No intermediate buffering of entire files
   - Proper backpressure handling

2. **Memory-Efficient Thumbnail Generation**

   - Skip thumbnails for large files
   - Stream-based processing
   - Proper resource cleanup

3. **Batch Processing**

   - Bucket operations are done in batches
   - Prevents memory spikes with large collections

4. **Direct Streaming**
   - Files can be streamed directly to clients
   - Avoids generating presigned URLs when not needed

### File Uniqueness

Files are stored with unique names to prevent collisions:

Format: `originalname-timestamp-randomstring.ext`

Example: `report-20240423142536-a1b2c3d4.pdf`

## Integration with CASL

The module integrates with CASL for policy-based access control:

```typescript
// Example CASL ability configuration
// Define abilities in your CASL factory
can('read', 'Files'); // Allow reading files
can('create', 'Files'); // Allow creating files
can('delete', 'Files'); // Allow deleting files

// Super-admin access
can('super-modify', 'Files'); // Full access
```

## Performance Considerations

### Large File Handling

For large file uploads:

- No memory buffering of complete files
- Streaming validation of file size
- Skip thumbnails for large files
- Batched processing for bulk operations

### Recommended Settings

For optimal performance with large files:

```
POST /api/files/upload/my-bucket?skipThumbnailForLargeFiles=true&largeSizeMB=50
```

This setting will skip thumbnail generation for files larger than 50MB.

## Error Handling

The module provides detailed error messages for common issues:

- **File not found**: When accessing non-existent files
- **Bucket not found**: When accessing non-existent buckets
- **Size limit exceeded**: When uploading files larger than `maxSizeMB`
- **Invalid MIME type**: When uploading disallowed file types
- **Permission denied**: When lacking required permissions

## Programmatic Usage

### Service Injection

```typescript
import { Injectable } from '@nestjs/common';
import { MinioFilesService } from './minio-files/services/minio-files.service';

@Injectable()
export class YourService {
  constructor(private readonly minioFilesService: MinioFilesService) {}

  async processFile(bucket: string, filename: string) {
    // Get file metadata
    const metadata = await this.minioFilesService.getFileMetadata(
      bucket,
      filename,
    );

    // Get file stream for processing
    const fileStream = await this.minioFilesService.getFileStream(
      bucket,
      filename,
    );

    // Process the stream
    // ...

    return metadata;
  }
}
```

### Direct Stream Processing

```typescript
import { Controller, Get, Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { MinioFilesService } from './minio-files/services/minio-files.service';

@Controller('custom-files')
export class CustomFilesController {
  constructor(private readonly minioFilesService: MinioFilesService) {}

  @Get('stream/:bucket/:filename')
  async streamFileWithTransformation(
    @Param('bucket') bucket: string,
    @Param('filename') filename: string,
    @Res() response: FastifyReply,
  ) {
    // Get a stream from MinIO
    const fileStream = await this.minioFilesService.getFileStream(
      bucket,
      filename,
    );

    // Apply custom transformation
    const transformedStream = applyCustomTransform(fileStream);

    // Stream directly to client
    return response
      .header('Content-Type', 'application/octet-stream')
      .send(transformedStream);
  }
}
```

## Security Best Practices

1. **Set File Size Limits**: Always use `maxSizeMB` option to prevent DOS attacks
2. **Restrict MIME Types**: Use `allowedMimeTypes` to prevent upload of malicious files
3. **Use Policy-Based Access Control**: Leverage CASL integration for fine-grained permissions
4. **Set Short Expiry for Presigned URLs**: Use the `expiry` parameter with shortest practical values
5. **Use Secure Buckets**: For sensitive files, create buckets without public policies

## Troubleshooting

### Common Issues

1. **"Error uploading file: connect ECONNREFUSED"**

   - Check that MinIO server is running
   - Verify MINIO_ENDPOINT and MINIO_PORT environment variables

2. **"Error: File exceeds maximum size"**

   - Increase `maxSizeMB` parameter or reduce file size

3. **"Out of memory"**

   - Verify you're using the latest service implementation with streaming
   - Add `skipThumbnailForLargeFiles=true` for large file uploads
   - Consider adjusting Node.js memory limits for very large files: `--max-old-space-size`

4. **"File type not allowed"**

   - Check `allowedMimeTypes` parameter against the file's MIME type
   - Use appropriate MIME types list (e.g., `image/*,application/pdf`)

5. **"Cannot read property 'pipe' of undefined"**
   - Make sure the file stream is available and not consumed elsewhere

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to the branch (`git push origin feature/your-feature`)
7. Open a Pull Request

## License

MIT

## Credits

This module uses the following dependencies:

- [minio](https://github.com/minio/minio-js): MinIO Client SDK for Node.js
- [sharp](https://github.com/lovell/sharp): High-performance image processing
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg): FFmpeg wrapper for video thumbnails
- [uuid](https://github.com/uuidjs/uuid): For generating unique identifiers
