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
  generateThumbnail={true}
  skipThumbnailForLargeFiles={true}
  largeSizeMB={20}
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
| largeSizeMB | number | 20 | Size threshold in MB for skipping thumbnail generation |
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
  generateThumbnail={true}
  skipThumbnailForLargeFiles={true}
  largeSizeMB={50}
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
| generateThumbnail | boolean | true | Whether to generate thumbnails for supported files |
| skipThumbnailForLargeFiles | boolean | true | Whether to skip thumbnail generation for large files |
| largeSizeMB | number | 20 | Size threshold in MB for skipping thumbnail generation |
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
  skipThumbnailForLargeFiles: true,
  largeSizeMB: 20,
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
  maxSizeMB: 10,
  generateThumbnail: true,
  skipThumbnailForLargeFiles: true,
  largeSizeMB: 20,
  // other options...
});
```

## Thumbnail Generation

The components now support server-side thumbnail generation for images and videos. This is controlled by the following props:

- **generateThumbnail**: Enable/disable thumbnail generation (default: true)
- **skipThumbnailForLargeFiles**: Skip generating thumbnails for large files to save processing time and resources (default: true)
- **largeSizeMB**: Size threshold in MB for considering a file "large" (default: 20MB)

The components automatically optimize these settings based on file type:
- For images, thumbnails are always generated regardless of size (skipThumbnailForLargeFiles=false)
- For videos, the large file threshold is increased to 50MB by default
- For documents, thumbnail generation is disabled

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
- **Thumbnail preview**: Showing how to handle file previews and thumbnails

It's an excellent reference for more complex integrations and demonstrates how to combine all the parts of the file system together in a practical application.

## Advanced Usage

For more advanced usage patterns, including custom integration with the Redux store or handling specific upload scenarios, refer to the `FileUploadExample.tsx` component or the Redux module README.

## Working with Thumbnails

When a file is uploaded with thumbnail generation enabled, the server will attempt to create a thumbnail for supported file types (images and videos). The resulting thumbnail URL can be accessed in the upload result:

```tsx
<SingleFileUpload
  generateThumbnail={true}
  onUploadSuccess={(result) => {
    if (result.thumbnailUrl) {
      console.log('Thumbnail available at:', result.thumbnailUrl);
      // You can use this URL to display a preview
    }
  }}
/>
```

For multiple file uploads, you can check each file's metadata for the thumbnail URL:

```tsx
onAllUploadsComplete={(succeeded) => {
  succeeded.forEach(file => {
    if (file.metadata?.thumbnailUrl) {
      console.log(`Thumbnail for ${file.fileData.name}:`, file.metadata.thumbnailUrl);
    }
  });
}}
```

The FileMetadata object returned from a successful upload includes the following thumbnail-related properties:

- `thumbnailName`: The unique filename of the generated thumbnail
- `thumbnailUrl`: The URL to access the thumbnail