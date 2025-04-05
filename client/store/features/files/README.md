# File Management System

This module provides a comprehensive file management system powered by Redux and RTK Query. It handles file uploads, downloads, and management with features like progress tracking, thumbnail generation, and batch operations.

## Features

- **Advanced file upload** with real-time progress tracking
- **File queue management** for handling multiple files
- **Automatic thumbnail generation** for images and videos
- **Streaming uploads** for optimal performance
- **Throttled network requests** to prevent server overload
- **Presigned URL support** for secure file transfers
- **Direct download options** for immediate file access
- **Batch operations** for multiple files
- **File metadata handling** with thumbnails and previews
- **Optimized for large files** with configurable limits

## Core Files

### API and State Management

- **files.api.ts**: RTK Query API endpoints for file operations
- **progress-slice.ts**: Redux slice for tracking file upload progress and status

### Utilities

- **file-helpers.ts**: Utility functions for file format, size, and type handling
- **upload-utils.ts**: Core utilities for upload management and state
- **file-operations.ts**: High-level functions for common file operations
- **index.ts**: Main export file that brings everything together

## Available Hooks and Functions

| Hook/Function | Description | Use Case |
|---------------|-------------|----------|
| `useFileUpload` | Hook for single file uploads | When a single file needs to be uploaded with progress tracking |
| `useBatchFileUpload` | Hook for multiple file uploads | When multiple files need to be uploaded at once |
| `useFilesList` | Hook to fetch files from a bucket | When displaying files from storage |
| `useFileMetadata` | Hook to get detailed file metadata | When needing specific information about a file |
| `useDeleteFile` | Hook to delete files with confirmation | When allowing users to remove files |
| `useBucketsList` | Hook to list available buckets | When switching between storage locations |
| `downloadFile` | Function to download a file | When users need to get files from the system |
| `previewThumbnail` | Function to preview file thumbnails | When showing previews of images/videos |

## Upload Options

### FileUploadOptions Interface

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `generateThumbnail` | boolean | `true` | Enable/disable thumbnail generation |
| `maxSizeMB` | number | `50` | Maximum file size in MB |
| `skipThumbnailForLargeFiles` | boolean | `true` | Skip thumbnails for large files |
| `largeSizeMB` | number | `20` | Size threshold (MB) for skipping thumbnails |
| `allowedMimeTypes` | string[] | `undefined` | Array of allowed MIME types |

### File Type-Specific Defaults

| File Type | Example MIME Types | Thumbnail Settings |
|-----------|-------------------|-------------------|
| Images | image/jpeg, image/png | Always generate (`skipThumbnailForLargeFiles: false`) |
| Videos | video/mp4, video/webm | Higher threshold (`largeSizeMB: 50`) |
| Documents | application/pdf, application/msword | No thumbnails (`generateThumbnail: false`) |
| Audio | audio/mp3, audio/wav | No thumbnails (`generateThumbnail: false`) |
| Archives | application/zip, application/x-rar-compressed | No thumbnails (`generateThumbnail: false`) |

## Download Options

### Download Configuration Parameters

| Parameter | Type | Description | Use Case |
|-----------|------|-------------|----------|
| `direct` | boolean | Use direct streaming instead of presigned URL | For immediate downloads or secure files |
| `expiry` | number | Expiry time in seconds for presigned URLs | For limited-time access links |

### File Type-Specific Download Defaults

| File Type | Example MIME Types | Default Settings |
|-----------|-------------------|-----------------|
| Images | image/jpeg, image/png | `{ direct: true, expiry: 3600 }` |
| Videos | video/mp4, video/webm | `{ direct: true, expiry: 3600 }` |
| Audio | audio/mp3, audio/wav | `{ direct: true, expiry: 3600 }` |
| Documents | application/pdf, application/msword | `{ direct: false, expiry: 86400 }` |
| Others | application/octet-stream | `{ direct: false, expiry: 86400 }` |

## File Metadata Structure

| Property | Type | Description |
|----------|------|-------------|
| `originalName` | string | Original filename |
| `uniqueName` | string | Unique filename in storage |
| `size` | number | File size in bytes |
| `mimetype` | string | File MIME type |
| `thumbnailName` | string (optional) | Thumbnail filename (if generated) |
| `url` | string | Presigned URL for access |
| `thumbnailUrl` | string (optional) | Presigned URL for thumbnail |
| `bucket` | string | Bucket name |
| `uploadedAt` | Date | Upload timestamp |

## Usage Examples

### Basic File Upload

```tsx
// Using the hook-based interface
import { useFileUpload } from '@/store/features/files';

const MyComponent = () => {
  const { uploadFile, isLoading } = useFileUpload('my-bucket');
  
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    try {
      const result = await uploadFile(file, {
        generateThumbnail: true,
        skipThumbnailForLargeFiles: true,
        largeSizeMB: 20
      });
      console.log('Upload success:', result);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  return (
    <input type="file" onChange={handleUpload} disabled={isLoading} />
  );
};
```

### Multiple File Upload

```tsx
import { useBatchFileUpload } from '@/store/features/files';

const MultiUploadComponent = () => {
  const { uploadFiles, isLoading } = useBatchFileUpload('documents');
  
  const handleBatchUpload = async (event) => {
    const files = Array.from(event.target.files);
    try {
      const result = await uploadFiles(files, {
        generateThumbnail: true,
        skipThumbnailForLargeFiles: true,
        largeSizeMB: 50
      });
      console.log('Uploaded files:', result.files);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  return (
    <input type="file" multiple onChange={handleBatchUpload} disabled={isLoading} />
  );
};
```

## Common Upload Scenarios

| Scenario | Recommended Options | Code Example |
|----------|---------------------|--------------|
| Profile Pictures | `{ generateThumbnail: true, skipThumbnailForLargeFiles: false }` | `uploadFile(image, { generateThumbnail: true, skipThumbnailForLargeFiles: false })` |
| Document Library | `{ generateThumbnail: false, maxSizeMB: 100 }` | `uploadFile(document, { generateThumbnail: false, maxSizeMB: 100 })` |
| Video Uploads | `{ generateThumbnail: true, skipThumbnailForLargeFiles: true, largeSizeMB: 100 }` | `uploadFile(video, { generateThumbnail: true, skipThumbnailForLargeFiles: true, largeSizeMB: 100 })` |
| Bulk Image Uploads | `{ generateThumbnail: true, skipThumbnailForLargeFiles: true, largeSizeMB: 10 }` | `uploadFiles(images, { generateThumbnail: true, skipThumbnailForLargeFiles: true, largeSizeMB: 10 })` |

## Download Options and Examples

### Direct File Download

```tsx
import { downloadFile } from '@/store/features/files';

const DownloadButton = ({ file }) => {
  const handleDownload = () => {
    // Direct download using streaming
    downloadFile(file, { direct: true });
  };
  
  return (
    <button onClick={handleDownload}>Download {file.originalName}</button>
  );
};
```

### Creating Shareable Links

```tsx
import { useGetFileDownloadUrlQuery } from '@/store/features/files';

const ShareLinkButton = ({ bucket, filename }) => {
  const { data, isLoading } = useGetFileDownloadUrlQuery({
    bucket,
    filename,
    expiry: 86400 // 24 hours
  });
  
  const copyToClipboard = () => {
    if (data?.url) {
      navigator.clipboard.writeText(data.url);
      alert('Download link copied to clipboard!');
    }
  };
  
  return (
    <button onClick={copyToClipboard} disabled={isLoading}>
      Copy Sharing Link (Valid for 24 hours)
    </button>
  );
};
```

### Batch Download URLs

```tsx
import { useGetBatchDownloadUrlsQuery } from '@/store/features/files';

const BatchDownloadLinks = ({ bucket, filenames }) => {
  const { data, isLoading } = useGetBatchDownloadUrlsQuery({
    bucket,
    filenames,
    expiry: 7200 // 2 hours
  });
  
  if (isLoading) return <div>Loading download links...</div>;
  
  return (
    <ul>
      {data && Object.entries(data.urls).map(([filename, url]) => (
        <li key={filename}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            Download {filename}
          </a>
        </li>
      ))}
    </ul>
  );
};
```

## File Selection and Listing

### Listing Files with Thumbnails

```tsx
import { useFilesList } from '@/store/features/files';

const FileGallery = ({ bucket }) => {
  const { files, isLoading, error } = useFilesList(bucket);
  
  if (isLoading) return <div>Loading files...</div>;
  if (error) return <div>Error loading files</div>;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {files.map(file => (
        <div key={file.uniqueName} className="border p-2 rounded">
          {file.thumbnailUrl ? (
            <img src={file.thumbnailUrl} alt={file.originalName} className="w-full h-32 object-cover" />
          ) : (
            <div className="w-full h-32 flex items-center justify-center bg-gray-100">
              {file.mimetype.split('/')[0]}
            </div>
          )}
          <p className="mt-2 truncate">{file.originalName}</p>
          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
        </div>
      ))}
    </div>
  );
};
```

### Using Selectors for Upload Status

| Selector | Purpose | Example Use |
|----------|---------|-------------|
| `selectFilesByOwnerId` | Get files for a specific component | Track files in a specific uploader |
| `selectQueueStatusByOwnerId` | Get upload queue status | Show overall upload status for a component |
| `selectCurrentUploadingFileByOwnerId` | Get current uploading file | Show which file is currently being uploaded |
| `selectUploadedFilesByOwnerId` | Get successfully uploaded files | Show completed uploads |
| `selectFailedFilesByOwnerId` | Get failed uploads | Show error status and retry options |

```tsx
import { useSelector } from 'react-redux';
import { selectUploadedFilesByOwnerId, selectFailedFilesByOwnerId } from '@/store/features/files';

const UploadStatus = ({ ownerId }) => {
  const uploadedFiles = useSelector(selectUploadedFilesByOwnerId(ownerId));
  const failedFiles = useSelector(selectFailedFilesByOwnerId(ownerId));
  
  return (
    <div>
      <h3>Upload Status</h3>
      <p>Successful: {uploadedFiles.length}</p>
      <p>Failed: {failedFiles.length}</p>
    </div>
  );
};
```

## Advanced Configuration

### Upload States and Transitions

| Status | Description | Next Possible States |
|--------|-------------|---------------------|
| `idle` | No file selected | `selected` |
| `selected` | File chosen but not uploading | `waiting`, `uploading` |
| `waiting` | File in queue waiting to upload | `uploading` |
| `uploading` | File is actively uploading | `completed`, `failed` |
| `completed` | Upload finished successfully | `idle` (after reset) |
| `failed` | Upload encountered an error | `waiting`, `idle` (after reset) |

### Using Helper Methods for Options Management

```tsx
import { getUploadOptionsForFile, prepareUploadOptions } from '@/store/features/files';

// Automatically generate optimal options based on file type
const file = event.target.files[0];
const autoOptions = getUploadOptionsForFile(file);

// For manual options, use the utility to ensure only valid properties are included
const manualOptions = prepareUploadOptions({
  generateThumbnail: true,
  skipThumbnailForLargeFiles: file.size > 10 * 1024 * 1024,
  // Only defined properties are included in the result
});
```

## Implementation Notes

- Uses XHR behind the scenes for reliable progress tracking
- Supports file throttling to prevent excessive concurrent uploads
- Manages file objects outside of Redux to avoid non-serializable data issues
- Handles cancellation and cleanup automatically
- Tracks progress with high precision
- Avoids memory leaks with proper cleanup
- Smart file option handling with the new `prepareUploadOptions` utility

## Thumbnail Preview Examples

### Basic Thumbnail Preview

```tsx
import { shouldHaveThumbnail } from '@/store/features/files';

const FileThumbnail = ({ file }) => {
  if (shouldHaveThumbnail(file) && file.thumbnailUrl) {
    return <img src={file.thumbnailUrl} alt={file.originalName} className="w-20 h-20 object-cover" />;
  }
  
  // Fallback for files without thumbnails
  return (
    <div className="w-20 h-20 flex items-center justify-center bg-gray-100 text-gray-500">
      {file.mimetype.split('/')[1]?.toUpperCase() || 'FILE'}
    </div>
  );
};
```

### Interactive Preview

```tsx
import { previewThumbnail } from '@/store/features/files';

const InteractivePreview = ({ file }) => {
  if (!shouldHaveThumbnail(file)) {
    return <div>No preview available</div>;
  }
  
  return (
    <div className="cursor-pointer" onClick={() => previewThumbnail(file)}>
      <img
        src={file.thumbnailUrl || file.url}
        alt={file.originalName}
        className="max-w-full h-auto"
      />
      <p className="mt-2 text-center text-blue-500">Click to view full size</p>
    </div>
  );
};
```

## Example Upload Queue Component

```tsx
import { useSelector } from 'react-redux';
import { selectFilesByOwnerId, selectQueueStatusByOwnerId } from '@/store/features/files';

const UploadQueue = ({ ownerId }) => {
  const files = useSelector(selectFilesByOwnerId(ownerId));
  const queueStatus = useSelector(selectQueueStatusByOwnerId(ownerId));
  
  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold">Upload Queue ({queueStatus})</h3>
      <ul className="mt-2 divide-y">
        {files.map(file => (
          <li key={file.id} className="py-2">
            <div className="flex justify-between items-center">
              <span className="truncate">{file.fileData.name}</span>
              <span className="ml-2 min-w-[80px] text-right">
                {file.status === 'uploading' ? `${file.progress}%` : file.status}
              </span>
            </div>
            {file.status === 'uploading' && (
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${file.progress}%` }}
                ></div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
```