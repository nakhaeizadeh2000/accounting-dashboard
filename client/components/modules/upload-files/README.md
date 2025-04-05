# File Upload Components

A comprehensive set of React components for file uploads in Next.js applications with a focus on user experience, progress tracking, and error handling.

## Components

This package includes:

- **SingleFileUpload**: For uploading one file at a time
- **MultiFileUpload**: For batch uploading multiple files
- **Custom Hooks**: `useSingleFileUpload` and `useMultiFileUpload` for advanced control

## Features

- **Real-time progress tracking**: Visual indication of upload progress
- **Drag and drop**: Intuitive file selection
- **Validation**: File type and size validation
- **Customizable**: Extensive props for customization
- **Responsive design**: Adapts to different screen sizes
- **Multilingual**: Supports English and Persian
- **Dark mode support**: Adapts to light/dark themes
- **Cancellation**: Ability to cancel uploads in progress
- **Retry functionality**: Easy retry for failed uploads
- **File type visualization**: Different icons for different file types

## Installation

Ensure you have the required dependencies:

```bash
npm install uuid react-redux @reduxjs/toolkit
```

## SingleFileUpload Component

### Usage

```tsx
import { SingleFileUpload } from '@/components/modules/upload-files';

const MyComponent = () => {
  const handleUploadSuccess = (result) => {
    console.log('File uploaded:', result);
  };

  return (
    <SingleFileUpload
      id="upload-1"
      bucket="default"
      acceptedFileTypes="image/*,application/pdf"
      maxSizeMB={5}
      language="en"
      onUploadSuccess={handleUploadSuccess}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | auto-generated | Unique identifier for this upload component |
| `bucket` | string | 'default' | Server-side storage bucket |
| `type` | 'multiple' \| 'single' | 'single' | Upload type |
| `acceptedFileTypes` | string | '' | Comma-separated list of MIME types |
| `maxSizeMB` | number | 10 | Maximum file size in MB |
| `uploadingDependsToForm` | boolean | true | Whether upload requires explicit start |
| `language` | 'fa' \| 'en' | 'fa' | Interface language |
| `onUploadSuccess` | function | undefined | Callback when upload succeeds |
| `onUploadError` | function | undefined | Callback when upload fails |
| `onFileSelect` | function | undefined | Callback when file is selected |

### States

The SingleFileUpload component has the following states:

1. **Idle**: No file selected, shows dropzone
2. **Selected**: File selected, waiting for upload to start
3. **Uploading**: File upload in progress with percentage
4. **Completed**: Upload successful
5. **Failed**: Upload failed with error message

## MultiFileUpload Component

### Usage

```tsx
import { MultiFileUpload } from '@/components/modules/upload-files';

const MyComponent = () => {
  const handleAllUploadsComplete = (succeeded, failed) => {
    console.log('Uploads completed:', succeeded.length, 'Failed:', failed.length);
  };

  return (
    <MultiFileUpload
      id="multi-upload-1"
      bucket="user-uploads"
      acceptedFileTypes="image/*,video/*,audio/*"
      maxSizeMB={20}
      language="en"
      onAllUploadsComplete={handleAllUploadsComplete}
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | auto-generated | Unique identifier for this upload component |
| `bucket` | string | 'default' | Server-side storage bucket |
| `acceptedFileTypes` | string | 'image/jpeg,image/png,application/pdf' | Comma-separated list of MIME types |
| `maxSizeMB` | number | 10 | Maximum file size in MB |
| `language` | 'fa' \| 'en' | 'fa' | Interface language |
| `onUploadComplete` | function | undefined | Callback when an individual upload completes |
| `onAllUploadsComplete` | function | undefined | Callback when all uploads complete |
| `onError` | function | undefined | Callback when any error occurs |

### States

The MultiFileUpload component has the following queue states:

1. **Idle**: No files selected, shows dropzone
2. **Selected**: Files selected, waiting for upload to start
3. **Uploading**: Files uploading with progress tracking
4. **Completed**: All uploads successful
5. **Failed**: Some or all uploads failed

Each file in the queue has its own status: 'selected', 'waiting', 'uploading', 'completed', or 'failed'.

## Custom Hooks

### useSingleFileUpload

For more control over file uploads, use the `useSingleFileUpload` hook:

```tsx
import { useSingleFileUpload } from '@/components/modules/upload-files/hook';

const MyCustomUploader = () => {
  const {
    selectedFile,
    fileInfo,
    uploadStatus,
    uploadProgress,
    errorMessage,
    handleFileSelect,
    startUpload,
    cancelUpload,
    resetUpload,
  } = useSingleFileUpload({
    id: 'custom-uploader',
    bucket: 'user-files',
    acceptedFileTypes: 'image/*',
    maxSizeMB: 5,
    onUploadSuccess: (result) => console.log('Success:', result),
    onUploadError: (error) => console.error('Error:', error),
  });

  // Custom UI implementation using the hook state and methods
  return (
    <div>
      {/* Your custom UI */}
    </div>
  );
};
```

### useMultiFileUpload

For advanced multi-file upload control:

```tsx
import { useMultiFileUpload } from '@/components/modules/upload-files/hook';

const MyCustomMultiUploader = () => {
  const {
    queue,
    queueStatus,
    currentUploadingFile,
    addFilesToQueue,
    removeFileFromQueue,
    startFileUpload,
    cancelSingleUpload,
    cancelAllFileUploads,
    retryFailedUpload,
    retryAllFailed,
  } = useMultiFileUpload({
    id: 'custom-multi-uploader',
    bucket: 'user-gallery',
    onAllUploadsComplete: (succeeded, failed) => {
      console.log('All uploads finished');
    },
  });

  // Custom UI implementation
  return (
    <div>
      {/* Your custom UI */}
    </div>
  );
};
```

## UI Customization

Both components use Tailwind CSS for styling with built-in responsiveness and dark mode support.

### File Type Icons

The components automatically display different icons based on file types:

- **Image files**: Image icon
- **Video files**: Video icon
- **Audio files**: Audio icon
- **Compressed files**: Archive icon
- **Other files**: Document icon

## Internationalization

The components support English and Persian languages:

```tsx
// English version
<SingleFileUpload language="en" />

// Persian version
<SingleFileUpload language="fa" />
```

Language settings affect all text in the component, including button labels, status messages, and tooltips.

## Error Handling

### Validation Errors

The components validate files before adding them to the queue:

1. **File size**: Files larger than `maxSizeMB` are rejected
2. **File type**: Files not matching `acceptedFileTypes` are rejected

Error messages are displayed to the user.

### Upload Errors

If an upload fails:

1. The file is marked as failed
2. An error message is displayed
3. The `onUploadError` callback is triggered
4. A retry button is shown

## Examples

### Basic Single File Upload

```tsx
<SingleFileUpload
  id="profile-picture"
  bucket="profile"
  acceptedFileTypes="image/*"
  maxSizeMB={2}
  onUploadSuccess={(result) => {
    updateProfilePicture(result.url);
  }}
/>
```

### Auto-Upload Single File

```tsx
<SingleFileUpload
  id="document-upload"
  bucket="documents"
  acceptedFileTypes="application/pdf,application/msword"
  uploadingDependsToForm={false} // Automatically starts upload on file selection
  onUploadSuccess={handleDocumentUploaded}
/>
```

### Multi-File Upload with Callbacks

```tsx
<MultiFileUpload
  id="gallery-upload"
  bucket="gallery"
  acceptedFileTypes="image/*,video/*"
  maxSizeMB={10}
  onUploadComplete={(file) => {
    // Handle each file as it completes
    addToGallery(file.response.url);
  }}
  onAllUploadsComplete={(succeeded, failed) => {
    // Handle batch completion
    showNotification(`Uploaded ${succeeded.length} files`);
    if (failed.length > 0) {
      showErrors(`${failed.length} files failed to upload`);
    }
  }}
/>
```

## Best Practices

1. **Unique IDs**: Always provide unique IDs to isolate component state
2. **Error Handling**: Always provide error handling callbacks
3. **File Types**: Be specific about acceptable file types
4. **Size Limits**: Set appropriate size limits to prevent timeouts
5. **User Feedback**: Use callbacks to provide user feedback

## Integration with React Forms

The components can be integrated with form libraries:

```tsx
import { useForm } from 'react-hook-form';
import { SingleFileUpload } from '@/components/modules/upload-files';

const FormWithUpload = () => {
  const { register, handleSubmit, setValue } = useForm();
  
  const handleUploadSuccess = (result) => {
    setValue('fileUrl', result.url);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('fileUrl')} type="hidden" />
      <SingleFileUpload
        id="form-upload"
        onUploadSuccess={handleUploadSuccess}
      />
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Server Configuration

These components expect a server endpoint that:

1. Accepts `FormData` with a `file` field
2. Returns a JSON response with upload information
3. Supports proper error status codes

Example server response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": ["File uploaded successfully"],
  "data": {
    "url": "https://example.com/files/image.jpg",
    "filename": "image.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **IE**: Not supported

## Performance Considerations

1. **Large Files**: For very large files, consider using chunked uploads
2. **Multiple Files**: Avoid uploading too many large files simultaneously
3. **Preview Generation**: For image uploads, consider generating previews on the client side

## Troubleshooting

### Common Issues

1. **Uploads not starting**: Check if `uploadingDependsToForm` is set to true
2. **File validation failing**: Verify `acceptedFileTypes` and `maxSizeMB` settings
3. **Server errors**: Check response format and network connectivity
4. **Component state not resetting**: Ensure proper cleanup on unmount

## Further Customization

For more advanced customization, use the hooks directly and build your own UI components.