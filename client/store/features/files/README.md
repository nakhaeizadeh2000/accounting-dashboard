# File System Redux Store

A comprehensive Redux-based state management system for handling file operations with real-time progress tracking, caching, and optimized streaming uploads.

## Features

- 🚀 **Optimized file streaming** for efficient uploads and downloads
- 📊 **Real-time progress tracking** with granular updates
- 🔄 **Automatic thumbnail generation** for image files
- 🌐 **Presigned URL support** for secure file access
- 📁 **Bucket-based organization** for logical file separation
- 📱 **Mobile-friendly** with minimal memory footprint
- 🔄 **Sequential upload queue** for multiple files
- 🔒 **Automatic file validation** with type and size checks
- 🌐 **Batch operations** for multiple files
- 📑 **Rich metadata support** including thumbnails and custom properties
- ⏳ **Upload throttling** to prevent server overload
- 🧩 **Modular architecture** for flexible integration

## Core Modules

| Module | Description | Key Functionality |
|--------|-------------|-------------------|
| `files.api.ts` | RTK Query API endpoints | File operations with the server |
| `progress-slice.ts` | Redux slice for tracking | Upload status and progress management |
| `file-operations.ts` | High-level operation hooks | Simplified interfaces for common tasks |
| `file-helpers.ts` | Utility functions | File formatting and type helpers |
| `upload-utils.ts` | Upload management utilities | Throttling and request management |

## Getting Started

### Basic File Upload

```tsx
import { useFileUpload } from '@/store/features/files';

function UploadComponent() {
  const { uploadFile, isLoading } = useFileUpload('my-bucket');
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const result = await uploadFile(file);
        console.log('Upload success:', result);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };
  
  return (
    <div>
      <input type="file" onChange={handleFileChange} disabled={isLoading} />
      {isLoading && <p>Uploading...</p>}
    </div>
  );
}
```

### Multiple File Upload

```tsx
import { useBatchFileUpload } from '@/store/features/files';

function BatchUploadComponent() {
  const { uploadFiles, isLoading } = useBatchFileUpload('documents');
  
  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      try {
        const result = await uploadFiles(files);
        console.log('Uploaded files:', result.files);
      } catch (error) {
        console.error('Batch upload failed:', error);
      }
    }
  };
  
  return (
    <div>
      <input type="file" multiple onChange={handleFilesChange} disabled={isLoading} />
      {isLoading && <p>Uploading files...</p>}
    </div>
  );
}
```

### Downloading Files

```tsx
import { downloadFile } from '@/store/features/files';

function DownloadButton({ file }) {
  const handleDownload = () => {
    downloadFile(file);
  };
  
  return (
    <button onClick={handleDownload}>
      Download {file.originalName}
    </button>
  );
}
```

### Listing Files

```tsx
import { useFilesList } from '@/store/features/files';

function FilesList() {
  const { files, isLoading, error, refetch } = useFilesList('images');
  
  if (isLoading) return <p>Loading files...</p>;
  if (error) return <p>Error loading files: {error.message}</p>;
  
  return (
    <div>
      <button onClick={refetch}>Refresh Files</button>
      <ul>
        {files.map(file => (
          <li key={file.uniqueName}>
            {file.originalName} - {formatFileSize(file.size)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## API Reference

### File Upload Hooks

#### `useFileUpload`

```typescript
const { uploadFile, isLoading } = useFileUpload(bucket?: string);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `bucket` | `string` | `'default'` | Storage bucket to upload to |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `uploadFile` | `(file: File) => Promise<UploadResult>` | Function to upload a single file |
| `isLoading` | `boolean` | Whether an upload is in progress |

#### `useBatchFileUpload`

```typescript
const { uploadFiles, isLoading } = useBatchFileUpload(bucket?: string);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `bucket` | `string` | `'default'` | Storage bucket to upload to |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `uploadFiles` | `(files: File[]) => Promise<BatchUploadResult>` | Function to upload multiple files |
| `isLoading` | `boolean` | Whether uploads are in progress |

### File Operation Functions

#### `downloadFile`

```typescript
downloadFile(metadata: FileMetadata, options?: { direct?: boolean });
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `metadata` | `FileMetadata` | File metadata object |
| `options` | `object` | Optional configuration |
| `options.direct` | `boolean` | Whether to stream directly (otherwise uses presigned URL) |

#### `previewThumbnail`

```typescript
previewThumbnail(metadata: FileMetadata);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `metadata` | `FileMetadata` | File metadata object |

### File Query Hooks

#### `useFilesList`

```typescript
const { files, isLoading, error, refetch } = useFilesList(
  bucket: string, 
  options?: { prefix?: string; recursive?: boolean; skip?: boolean }
);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `bucket` | `string` | Storage bucket to list files from |
| `options` | `object` | Optional query parameters |
| `options.prefix` | `string` | Filter files by prefix |
| `options.recursive` | `boolean` | List files recursively |
| `options.skip` | `boolean` | Skip the query execution |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `files` | `FileMetadata[]` | Array of file metadata objects |
| `isLoading` | `boolean` | Whether the query is loading |
| `error` | `Error \| null` | Error if query failed |
| `refetch` | `() => void` | Function to refetch data |

#### `useFileMetadata`

```typescript
const { metadata, isLoading, error } = useFileMetadata(
  bucket: string, 
  filename: string, 
  skip?: boolean
);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `bucket` | `string` | Storage bucket containing the file |
| `filename` | `string` | Unique filename to get metadata for |
| `skip` | `boolean` | Skip the query execution |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `metadata` | `FileMetadata \| null` | File metadata if found |
| `isLoading` | `boolean` | Whether the query is loading |
| `error` | `Error \| null` | Error if query failed |

#### `useDeleteFile`

```typescript
const { deleteFile, isDeleting } = useDeleteFile();
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `deleteFile` | `(metadata: FileMetadata, skipConfirmation?: boolean) => Promise<any>` | Function to delete a file |
| `isDeleting` | `boolean` | Whether a deletion is in progress |

#### `useBucketsList`

```typescript
const { buckets, isLoading, error } = useBucketsList();
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `buckets` | `Array<{ name: string; creationDate: Date }>` | Available storage buckets |
| `isLoading` | `boolean` | Whether the query is loading |
| `error` | `Error \| null` | Error if query failed |

### Redux Selectors

The store provides selectors for accessing upload state:

```typescript
import { useSelector } from 'react-redux';
import { 
  selectFilesByOwnerId,
  selectQueueStatusByOwnerId,
  selectCurrentUploadingFileByOwnerId,
  selectUploadedFilesByOwnerId,
  selectFailedFilesByOwnerId
} from '@/store/features/files';

function UploadStatus({ componentId }) {
  // Get all files associated with this component
  const files = useSelector(selectFilesByOwnerId(componentId));
  
  // Get overall upload status (idle, uploading, completed, failed)
  const status = useSelector(selectQueueStatusByOwnerId(componentId));
  
  // Get the file currently being uploaded, if any
  const currentFile = useSelector(selectCurrentUploadingFileByOwnerId(componentId));
  
  // Get successfully uploaded files
  const uploadedFiles = useSelector(selectUploadedFilesByOwnerId(componentId));
  
  // Get failed uploads
  const failedFiles = useSelector(selectFailedFilesByOwnerId(componentId));
  
  // Display status information
  // ...
}
```

## File Metadata Structure

The `FileMetadata` interface represents the core file data structure:

```typescript
interface FileMetadata {
  originalName: string;      // Original filename
  uniqueName: string;        // Unique identifier on the server
  size: number;              // File size in bytes
  mimetype: string;          // MIME type (e.g., "image/jpeg")
  thumbnailName?: string;    // Thumbnail file name (if available)
  url: string;               // Presigned URL for access
  thumbnailUrl?: string;     // Presigned URL for thumbnail (if available)
  bucket: string;            // Storage bucket
  uploadedAt: Date;          // Upload timestamp
}
```

## Upload States

File uploads go through several states, tracked in the Redux store:

| Status | Description | Next Possible States |
|--------|-------------|---------------------|
| `idle` | No file selected | `selected` |
| `selected` | File chosen but not uploading | `waiting`, `uploading` |
| `waiting` | File in queue waiting to upload | `uploading` |
| `uploading` | File is actively uploading | `completed`, `failed` |
| `completed` | Upload finished successfully | Final state |
| `failed` | Upload encountered an error | `waiting` (retry) |

## File Types and Thumbnails

With the updated API, thumbnail generation happens automatically on the server, but with some important differences:

- Thumbnails are **only generated for image files**
- No client-side configuration is needed
- Helper functions like `shouldHaveThumbnail()` automatically handle this logic

```typescript
import { shouldHaveThumbnail } from '@/store/features/files';

function FilePreview({ file }) {
  return (
    <div>
      {shouldHaveThumbnail(file) ? (
        <img src={file.thumbnailUrl || file.url} alt={file.originalName} />
      ) : (
        <div className="file-icon">{getFileIcon(file.mimetype)}</div>
      )}
    </div>
  );
}
```

## Advanced Usage

### Handling Upload Progress

Track upload progress using Redux selectors:

```tsx
import { useSelector } from 'react-redux';
import { selectFileById } from '@/store/features/files';

function UploadProgressBar({ fileId }) {
  const file = useSelector(selectFileById(fileId));
  
  if (!file) return null;
  
  return (
    <div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${file.progress}%` }}
        />
      </div>
      <div className="progress-text">
        {file.status === 'uploading' ? (
          `Uploading: ${file.progress}%`
        ) : file.status === 'completed' ? (
          'Upload complete'
        ) : file.status === 'failed' ? (
          `Failed: ${file.errorMessage}`
        ) : (
          file.status
        )}
      </div>
    </div>
  );
}
```

### Canceling Uploads

The API provides a function to cancel in-progress uploads:

```tsx
import { cancelUploadRequest } from '@/store/features/files';

function CancelButton({ fileId }) {
  const handleCancel = () => {
    cancelUploadRequest(fileId);
  };
  
  return (
    <button onClick={handleCancel}>
      Cancel Upload
    </button>
  );
}
```

### Multiple Component Isolation

Each upload component can have its own isolated queue:

```tsx
// Component A
function ProfilePictureUploader() {
  return (
    <SingleFileUpload 
      id="profile-picture-uploader"
      bucket="profile-images"
      // other props...
    />
  );
}

// Component B
function DocumentsUploader() {
  return (
    <MultiFileUpload 
      id="documents-uploader"
      bucket="documents"
      // different component, isolated queue
    />
  );
}
```

The `id` prop ensures each component has its own isolated upload state in Redux.

## Helper Functions

The store includes various helper functions:

| Function | Purpose | Example |
|----------|---------|---------|
| `formatFileSize` | Format byte size for display | `formatFileSize(1048576)` → `"1 MB"` |
| `formatFileName` | Truncate long filenames | `formatFileName("very_long_filename.pdf", 10)` → `"very_long_...pdf"` |
| `formatDate` | Format dates consistently | `formatDate(new Date())` → `"Apr 6, 2025"` |
| `getFileExtension` | Extract file extension | `getFileExtension("image.jpg")` → `"jpg"` |
| `isImageFile` | Check if file is an image | `isImageFile("image/png")` → `true` |
| `isVideoFile` | Check if file is a video | `isVideoFile("video/mp4")` → `true` |
| `validateFile` | Validate file type and size | `validateFile(file, { maxSizeMB: 10 })` |

## Direct Download vs. Presigned URLs

The file system supports two download methods:

1. **Direct Download** (streaming): Immediately streams the file to the browser
2. **Presigned URL**: Returns a time-limited URL for downloading the file

The system automatically chooses the appropriate method based on the file type:

```typescript
// Auto-selects best method based on file type
downloadFile(fileMetadata);

// Force direct download (streaming)
downloadFile(fileMetadata, { direct: true });

// Force presigned URL
downloadFile(fileMetadata, { direct: false });
```

By default, media files (images, videos, audio) use direct streaming, while other files use presigned URLs.

## Implementation Details

### File Upload Process

1. File is selected by the user
2. File metadata is added to Redux state with `selected` status
3. Upload is initiated, status changes to `uploading`
4. Progress updates are streamed to Redux during upload
5. On completion, status changes to `completed` and metadata is updated
6. On failure, status changes to `failed` with error information

### Sequential Upload Queue

When uploading multiple files, the system:

1. Adds all files to the queue with `waiting` status
2. Sets the first file to `uploading` status
3. When complete, automatically moves to the next file
4. Tracks overall progress across all files
5. Provides hooks for monitoring the entire queue

## Error Handling

The store includes comprehensive error handling:

- Network failures with appropriate messages
- File size validation with clear errors
- MIME type validation for allowed file types
- Upload cancellation handling
- Server-side error translation
- Retry capabilities for failed uploads

## Browser Compatibility

The file system is compatible with:

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Android Chrome)
- IE11 is not supported due to modern JavaScript features

## Best Practices

1. **Always handle errors** in your UI components
2. **Provide unique IDs** for upload components to ensure isolation
3. **Use high-level hooks** (`useFileUpload`, etc.) for most cases
4. **Implement appropriate cancel buttons** for long-running uploads
5. **Consider bucket organization** for better file management
6. **Use `shouldHaveThumbnail()`** to determine if thumbnails should be displayed
7. **Prefer direct Redux selectors** for complex upload status tracking
8. **Implement upload rate limiting** for large file collections