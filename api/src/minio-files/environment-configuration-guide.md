# MinIO Environment Configuration Guide

This document explains all the available environment variables for configuring the MinIO file service. These settings control important aspects like file size limits, thumbnail generation, and security features.

## Server Connection Configuration

| Variable              | Description                                | Default     | Example                |
| --------------------- | ------------------------------------------ | ----------- | ---------------------- |
| `MINIO_ENDPOINT`      | Hostname or IP address of the MinIO server | -           | `minio` or `localhost` |
| `MINIO_PORT`          | Port number for the MinIO server           | `9000`      | `9000`                 |
| `MINIO_USE_SSL`       | Whether to use SSL for MinIO connection    | `false`     | `true` or `false`      |
| `MINIO_ROOT_USER`     | MinIO admin username                       | -           | `minioadmin`           |
| `MINIO_ROOT_PASSWORD` | MinIO admin password                       | -           | `minioadmin`           |
| `MINIO_REGION`        | Default region for bucket creation         | `us-east-1` | `us-east-1`            |

## Resource Management and Limits

| Variable                     | Description                                                | Default         | Example       |
| ---------------------------- | ---------------------------------------------------------- | --------------- | ------------- |
| `MINIO_MAX_FILE_SIZE_MB`     | Maximum allowed file size in megabytes                     | `100`           | `500`         |
| `MINIO_THUMBNAIL_SIZE`       | Width/height of generated thumbnails in pixels             | `300`           | `200`         |
| `MINIO_THUMBNAIL_PREFIX`     | Prefix added to thumbnail filenames                        | `thumb_`        | `thumbnail-`  |
| `MINIO_PRESIGNED_URL_EXPIRY` | Expiry time for presigned URLs in seconds                  | `86400` (24h)   | `3600` (1h)   |
| `MINIO_TEMP_DIR_PREFIX`      | Prefix for temporary directories created during processing | `minio-upload-` | `tmp-upload-` |

## Security and File Type Controls

| Variable                           | Description                                                      | Default                | Example                   |
| ---------------------------------- | ---------------------------------------------------------------- | ---------------------- | ------------------------- |
| `MINIO_ALLOWED_MIME_TYPES`         | Comma-separated list of allowed MIME types (empty = all allowed) | empty                  | `image/*,application/pdf` |
| `MINIO_DIRECT_DOWNLOAD_MIME_TYPES` | MIME types to stream directly instead of providing URLs          | `image/,video/,audio/` | `image/,video/`           |

## Understanding Specific Settings

### MINIO_MAX_FILE_SIZE_MB

Controls the maximum size of files that can be uploaded. This is a hard limit enforced by the server, and cannot be overridden by client applications. Setting this appropriately helps prevent denial-of-service attacks and controls resource usage.

```
MINIO_MAX_FILE_SIZE_MB=100
```

Recommendations:

- For general purpose: 50-100 MB
- For multimedia applications: 200-500 MB
- For document management: 20-50 MB

### MINIO_ALLOWED_MIME_TYPES

Restricts the types of files that can be uploaded. This is a comma-separated list of MIME types or patterns. An empty value allows all types.

```
MINIO_ALLOWED_MIME_TYPES=image/*,video/*,application/pdf,application/msword
```

You can use wildcards in the format `type/*` to allow all subtypes within a category. For example, `image/*` allows all image formats.

Common values:

- `image/*` - All image types
- `video/*` - All video types
- `audio/*` - All audio types
- `application/pdf` - PDF documents
- `application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Word documents

### MINIO_DIRECT_DOWNLOAD_MIME_TYPES

Specifies which file types should be streamed directly to the client instead of providing a presigned URL when downloading. This is useful for media files that are typically viewed in the browser.

```
MINIO_DIRECT_DOWNLOAD_MIME_TYPES=image/,video/,audio/
```

Direct streaming is usually better for:

- Images - For direct viewing in browser
- Videos - For streaming playback
- Audio - For streaming playback

While presigned URLs are better for:

- Documents - For downloading and opening in local applications
- Archives - For downloading and extracting locally
- Large files - Where download management is needed

### MINIO_THUMBNAIL_SIZE

Controls the dimensions of generated thumbnails in pixels. Thumbnails are now only generated for image files.

```
MINIO_THUMBNAIL_SIZE=300
```

Higher values create larger, more detailed thumbnails but consume more storage and bandwidth. Lower values are more efficient but may lack detail.

### MINIO_PRESIGNED_URL_EXPIRY

Sets how long (in seconds) presigned URLs remain valid.

```
MINIO_PRESIGNED_URL_EXPIRY=86400
```

Security considerations:

- Shorter expiry times (3600-7200s) are more secure
- Longer expiry times are more convenient for users
- For sensitive content, use shorter expiration periods

## Performance Optimization

The refactored service now uses optimized streaming for all operations, which significantly reduces memory usage. These optimizations apply regardless of configuration settings, but you can fine-tune resource usage with appropriate limits.

For high-traffic deployments:

1. Set reasonable file size limits with `MINIO_MAX_FILE_SIZE_MB`
2. Use `MINIO_ALLOWED_MIME_TYPES` to restrict unnecessary file types
3. Consider a smaller `MINIO_THUMBNAIL_SIZE` to reduce processing requirements
4. Ensure your MinIO server has sufficient resources and is properly configured

## Environment Variable Example

Here's a complete example for a production deployment:

```
# Server Connection
MINIO_ENDPOINT=minio.example.com
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=secure-password-here
MINIO_REGION=us-east-1

# Resource Management
MINIO_MAX_FILE_SIZE_MB=100
MINIO_THUMBNAIL_SIZE=250
MINIO_THUMBNAIL_PREFIX=thumb_
MINIO_PRESIGNED_URL_EXPIRY=7200
MINIO_TEMP_DIR_PREFIX=minio-upload-

# Security Controls
MINIO_ALLOWED_MIME_TYPES=image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*
MINIO_DIRECT_DOWNLOAD_MIME_TYPES=image/,video/,audio/
```
