# File Upload Components

This directory contains reusable file upload components that support various features such as:
- Single file upload with progress tracking
- Multiple file upload with queue management
- Thumbnail generation for images and videos
- Drag and drop support
- Upload status feedback
- Localization support

## Components

### SingleFileUpload

A component for uploading a single file with real-time progress tracking.

```tsx
import SingleFileUpload from '@/components/modules/upload-files/SingleFileUpload';

// Basic usage
<SingleFileUpload 
  id="profile-picture"
  bucket="images"
  acceptedFileTypes="image/*"
  maxSizeMB={5}
  onUploadSuccess={(result) => console.log('Upload success:', result)}
  onUploadError={(error) => console.error('Upload error:', error)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | auto-generated | Unique identifier for this upload component |
| bucket | string | 'default' | Storage bucket name for the file |
| type | 'multiple' \| 'single' | 'single' | Upload type |
| acceptedFileTypes | string | '' | Comma-separated list of accepted MIME types (e.g., "image/*,application/pdf") |
| maxSizeMB | number | 10 | Maximum file size in megabytes |
| uploadingDependsToForm | boolean | true | If true, shows a "Start Upload" button; if false, uploads automatically |
| language | 'fa' \| 'en' | 'fa' | UI language (Persian or English) |
| generateThumbnail | boolean | true | Whether to generate thumbnails for supported files (images/videos) |
| skipThumbnailForLargeFiles | boolean | true | Whether to skip thumbnail generation for large files |
| onUploadSuccess | function | - | Callback when upload completes successfully |
| onUploadError | function | - | Callback when upload fails |
| onFileSelect | function | - | Callback when a file is selected |

### MultiFileUpload

A component for uploading multiple files with queue management and bulk actions.

```tsx
import MultiFileUpload from '@/components/modules/upload-files/MultiFileUpload';

// Basic usage
<MultiFileUpload 
  id="document-uploads"
  bucket="documents"
  acceptedFileTypes="application/pdf,image/*"
  maxSizeMB={20}
  onUploadComplete={(files) => console.log('Files uploaded:', files)}
  onAllUploadsComplete={(succeeded, failed) => console.log('All uploads done')}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | auto-generated | Unique identifier for this upload component |
| bucket | string | 'default' | Storage bucket name for files |
| acceptedFileTypes | string | '' | Comma-separated list of accepted MIME types |
| maxSizeMB | number | 10 | Maximum file size in megabytes |
| language | 'fa' \| 'en' | 'fa' | UI language (Persian or English) |
| maxSizeMB | number | undefined | Maximum file size in megabytes |
| generateThumbnail | boolean | undefined | Whether to generate thumbnails for supported files |
| skipThumbnailForLargeFiles | boolean | undefined | Whether to skip thumbnail generation for large files |
| allowedMimeTypes | string[] | undefined | Array of allowed MIME types |
| onUploadComplete | function | - | Callback when a single file upload completes |
| onAllUploadsComplete | function | - | Callback when all files are processed |
| onError | function | - | Callback when an error occurs |

## Hooks

The components use custom hooks to manage the upload state and process:

### useSingleFileUpload

```tsx
const {
  instanceId,
  selectedFile,
  fileInfo,
  uploadStatus,
  uploadProgress,
  errorMessage,
  handleFileSelect,
  handleFileReject,
  startUpload,
  cancelUpload,
  resetUpload
} = useSingleFileUpload({
  id: 'custom-id',
  bucket: 'my-bucket',
  maxSizeMB: 10,
  generateThumbnail: true,
  // other options...
});
```

### useMultiFileUpload

```tsx
const {
  componentId,
  queue,
  queueStatus,
  currentUploadingFile,
  isUploading,
  addFilesToQueue,
  removeFileFromQueue,
  startFileUpload,
  cancelSingleUpload,
  cancelAllFileUploads,
  retryFailedUpload,
  retryAllFailed,
  resetForMoreFiles
} = useMultiFileUpload({
  id: 'custom-id',
  bucket: 'my-bucket',
  // other options...
});
```

## Examples

### Basic Example Components

The `example` folder contains simple implementation examples:

- `ExampleSingleUploadFile.tsx` - Demonstrates basic single file upload usage
- `ExampleMultiUploadFile.tsx` - Demonstrates basic multi-file upload usage

### Comprehensive Example

The `FileUploadExample.tsx` provides a more comprehensive demonstration of the file upload system:

```tsx
import FileUploadExample from '@/components/modules/upload-files/FileUploadExample';

// Usage
<FileUploadExample />
```

This example component showcases:

- **Multiple upload methods**: Using both component-based and direct API uploads
- **Bucket selection**: Dynamically changing the upload destination
- **File listing**: Displaying uploaded files with thumbnails and metadata
- **File operations**: Download, preview, and delete functionality
- **Success/Error handling**: Proper user feedback for operations
- **Advanced API features**: Demonstrates the direct usage of file operation hooks
- **Thumbnail preview**: Showing how to handle file previews

It's an excellent reference for more complex integrations and demonstrates how to combine all the parts of the file system together in a practical application.

## Advanced Usage

For more advanced usage patterns, including custom integration with the Redux store or handling specific upload scenarios, refer to the `FileUploadExample.tsx` component or the Redux module README.