# MinioFiles Module

This module provides comprehensive file handling functionality using MinIO as the storage backend. It supports file uploads, downloads, thumbnail generation, metadata management, and bucket operations.

## Features

- **File Upload**: Upload single or multiple files with automatic thumbnail generation for supported file types
- **Presigned URLs**: Generate time-limited URLs for file access without authentication
- **Thumbnails**: Automatic generation of thumbnails for images and videos
- **File Management**: List, get metadata, and delete files
- **Bucket Management**: Create, list, and delete buckets
- **Flexible Options**: Configure upload options like file size limits, allowed MIME types, etc.

## Installation

Ensure you have the required dependencies:

```bash
npm install --save minio sharp fluent-ffmpeg stream uuid
npm install --save-dev @types/minio @types/sharp @types/fluent-ffmpeg @types/uuid
```

## Configuration

Set the following environment variables:

```
MINIO_ENDPOINT=your-minio-host
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
```

## API Endpoints

### File Operations

- `POST /files/upload/:bucket` - Upload files to a bucket
- `GET /files/download/:bucket/:filename` - Get a presigned URL for downloading a file
- `GET /files/batch-download` - Get presigned URLs for multiple files
- `GET /files/metadata/:bucket/:filename` - Get metadata for a file
- `GET /files/list/:bucket` - List files in a bucket
- `DELETE /files/delete/:bucket/:filename` - Delete a file

### Bucket Operations

- `GET /files/buckets` - List all buckets
- `POST /files/buckets/:name` - Create a new bucket
- `DELETE /files/buckets/:name` - Delete a bucket

## Usage Examples

### Uploading Files

```typescript
// Using fetch API for demonstration
const formData = new FormData();
formData.append('file', file);

const response = await fetch(
  '/api/files/upload/my-bucket?generateThumbnail=true&maxSizeMB=10',
  {
    method: 'POST',
    body: formData,
  },
);

const result = await response.json();
console.log(result.files);
```

### Downloading Files

```typescript
const response = await fetch('/api/files/download/my-bucket/my-file.jpg');
const result = await response.json();
window.open(result.url, '_blank');
```

### Listing Files

```typescript
const response = await fetch('/api/files/list/my-bucket');
const result = await response.json();
console.log(result.files);
```

## File Metadata

Each file upload returns metadata with the following structure:

```typescript
{
  originalName: string;     // Original filename
  uniqueName: string;       // Unique filename in the bucket
  size: number;             // File size in bytes
  mimetype: string;         // File MIME type
  thumbnailName?: string;   // Thumbnail filename (if generated)
  url: string;              // Presigned URL for accessing the file
  thumbnailUrl?: string;    // Presigned URL for thumbnail (if generated)
  bucket: string;           // Bucket name
  uploadedAt: Date;         // Upload timestamp
}
```

## Thumbnail Generation

Thumbnails are automatically generated for:

- **Images**: Using Sharp for efficient image processing
- **Videos**: Using FFmpeg to extract frames

Thumbnails are stored in the same bucket with the prefix `thumb_` and have presigned URLs generated for easy access.

## File Uniqueness

Files are stored with unique names to prevent collisions while maintaining readability:

Format: `originalname-timestamp-randomstring.ext`

Example: `report-20240423142536-a1b2c3d4.pdf`

## Docker Setup

The module includes a Docker Compose configuration for running MinIO locally:

```bash
docker-compose -f docker-compose-minio.yml up -d
```

This will start a MinIO server accessible at http://localhost:9000 with the console at http://localhost:9001.

## Module Integration

Add the MinioFilesModule to your app.module.ts:

```typescript
import { MinioFilesModule } from './minio-files/minio-files.module';

@Module({
  imports: [
    // other modules
    MinioFilesModule,
  ],
})
export class AppModule {}
```

## Security

The enhanced controller includes policy-based access control integration. Users must have the appropriate permissions to perform operations:

- `create` and `super-modify` permissions for upload operations
- `read` and `super-modify` permissions for download/list operations
- `delete` and `super-modify` permissions for delete operations

## Error Handling

The module includes comprehensive error handling with detailed error messages. Common error scenarios:

- File not found
- Bucket not found
- File size exceeds limit
- Unauthorized MIME type
- Missing required parameters

## Dependencies

- minio: MinIO client for Node.js
- sharp: Image processing library for thumbnail generation
- fluent-ffmpeg: FFmpeg wrapper for video thumbnail generation
- uuid: For generating unique identifiers

## Contributing

Feel free to submit issues or pull requests to enhance this module.

## License

MIT
