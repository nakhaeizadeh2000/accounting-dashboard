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
        skipThumbnailForLargeFiles: true
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
      const result = await uploadFiles(files);
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

### File Download

```tsx
import { downloadFile } from '@/store/features/files';

const DownloadButton = ({ file }) => {
  const handleDownload = () => {
    downloadFile(file); // Automatically uses direct download or presigned URL based on file type
  };
  
  return (
    <button onClick={handleDownload}>Download {file.originalName}</button>
  );
};
```

### Listing Files

```tsx
import { useFilesList } from '@/store/features/files';

const FilesList = () => {
  const { files, isLoading, error } = useFilesList('images', { prefix: 'profile/' });
  
  if (isLoading) return <div>Loading files...</div>;
  if (error) return <div>Error loading files</div>;
  
  return (
    <ul>
      {files.map(file => (
        <li key={file.uniqueName}>
          {file.originalName} - {formatFileSize(file.size)}
        </li>
      ))}
    </ul>
  );
};
```

## Advanced Configuration

### Upload Options

```typescript
interface FileUploadOptions {
  generateThumbnail?: boolean;     // Enable/disable thumbnail generation
  maxSizeMB?: number;              // Maximum file size in MB
  allowedMimeTypes?: string[];     // Array of allowed MIME types
  skipThumbnailForLargeFiles?: boolean; // Skip thumbnails for large files
  largeSizeMB?: number;            // Size threshold for skipping thumbnails
}
```

### Working with Components

The file system is designed to work seamlessly with our `SingleFileUpload` and `MultiFileUpload` components:

```tsx
import { 
  SingleFileUpload, 
  MultiFileUpload, 
  useSingleFileUpload, 
  useMultiFileUpload 
} from '@/store/features/files';

// These components use the hooks internally and manage all the Redux state
```

## Selectors

The system provides various selectors to access file state:

```tsx
import {
  selectFilesByOwnerId,
  selectQueueStatusByOwnerId,
  selectCurrentUploadingFileByOwnerId,
  selectUploadedFilesByOwnerId,
  selectFailedFilesByOwnerId
} from '@/store/features/files';
```

## Utility Functions

```tsx
import {
  formatFileSize,
  formatFileName,
  formatDate,
  isImageFile,
  isVideoFile,
  isDocumentFile,
  shouldHaveThumbnail
} from '@/store/features/files';
```

## Implementation Notes

- Uses XHR behind the scenes for reliable progress tracking
- Supports file throttling to prevent excessive concurrent uploads
- Manages file objects outside of Redux to avoid non-serializable data issues
- Handles cancellation and cleanup automatically
- Tracks progress with high precision
- Avoids memory leaks with proper cleanup