# File Upload Components

A collection of modern, responsive React components for handling file uploads with real-time progress tracking, validation, and error handling.

## Features

- 🚀 **Real-time upload progress** with visual indicators
- 📱 **Fully responsive design** that adapts to any screen size
- 🌐 **Multi-language support** (English and Persian)
- 🎯 **File type validation** with configurable MIME type filtering
- 📏 **File size limits** with clear user feedback
- 🔄 **Intuitive state management** (idle, selected, uploading, completed, failed)
- 🧩 **Drag and drop support** for better user experience
- 📊 **Detailed progress reporting** with file queue management
- 🔄 **Isolated uploads** to prevent component interference
- 🔀 **Sequential uploads** for multiple files
- 📁 **Custom file organization** via buckets
- 🔗 **Rich callback API** for seamless integration

## Available Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `SingleFileUpload` | Upload a single file with visual feedback | Uploading profile pictures, individual documents |
| `MultiFileUpload` | Upload multiple files with queue management | Uploading photo galleries, document collections |

## Installation

These components are part of the main project and require no additional installation beyond the project dependencies.

## Usage

### SingleFileUpload

For simple use cases where users need to upload a single file:

```tsx
import { SingleFileUpload } from '@/components/modules/upload-files';

const MyComponent = () => {
  const handleUploadSuccess = (result) => {
    console.log('File uploaded successfully:', result);
    // Handle successful upload (e.g., save URL to form data)
  };

  const handleUploadError = (error) => {
    console.error('Upload failed:', error);
    // Handle upload error
  };

  return (
    <SingleFileUpload
      id="profile-picture-upload"
      bucket="user-profiles"
      acceptedFileTypes="image/*"
      maxSizeMB={5}
      uploadingDependsToForm={true}
      onUploadSuccess={handleUploadSuccess}
      onUploadError={handleUploadError}
    />
  );
};
```

### MultiFileUpload

For more complex scenarios requiring multiple file uploads:

```tsx
import { MultiFileUpload } from '@/components/modules/upload-files';

const GalleryUploader = () => {
  const handleUploadComplete = (uploadedFiles) => {
    console.log('Files uploaded:', uploadedFiles);
    // Process successfully uploaded files
  };

  const handleAllUploadsComplete = (succeeded, failed) => {
    console.log(`${succeeded.length} files uploaded, ${failed.length} failed`);
    // Update UI based on all uploads completion
  };

  const handleError = (error) => {
    console.error('Error during upload:', error);
    // Handle errors
  };

  return (
    <MultiFileUpload
      id="gallery-uploader"
      bucket="photo-gallery" 
      acceptedFileTypes="image/jpeg,image/png,image/webp"
      maxSizeMB={10}
      language="en"
      onUploadComplete={handleUploadComplete}
      onAllUploadsComplete={handleAllUploadsComplete}
      onError={handleError}
    />
  );
};
```

## Component Properties

### SingleFileUpload Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | auto-generated | Unique identifier for the component instance |
| `bucket` | `string` | `'default'` | Storage bucket to upload files to |
| `acceptedFileTypes` | `string` | `''` | Comma-separated list of MIME types (e.g., `"image/*,application/pdf"`) |
| `maxSizeMB` | `number` | `10` | Maximum file size in MB |
| `uploadingDependsToForm` | `boolean` | `true` | If true, shows upload button; if false, uploads immediately on selection |
| `language` | `'en' \| 'fa'` | `'fa'` | UI language (English or Persian) |
| `onUploadSuccess` | `(result: any) => void` | `undefined` | Callback when upload completes successfully |
| `onUploadError` | `(error: any) => void` | `undefined` | Callback when upload fails |
| `onFileSelect` | `(file: File \| null) => void` | `undefined` | Callback when file is selected or removed |

### MultiFileUpload Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | auto-generated | Unique identifier for the component instance |
| `bucket` | `string` | `'default'` | Storage bucket to upload files to |
| `acceptedFileTypes` | `string` | `'image/jpeg,image/png,application/pdf'` | Comma-separated list of MIME types |
| `maxSizeMB` | `number` | `10` | Maximum file size in MB |
| `language` | `'en' \| 'fa'` | `'fa'` | UI language (English or Persian) |
| `onUploadComplete` | `(uploadedFiles: FileUploadInfo[]) => void` | `undefined` | Callback when files are uploaded |
| `onAllUploadsComplete` | `(succeeded: FileUploadInfo[], failed: FileUploadInfo[]) => void` | `undefined` | Callback when all uploads are done |
| `onError` | `(error: any) => void` | `undefined` | Callback when an error occurs |

## States and Transitions

The upload components manage several states internally:

| Status | Description | Visible Indicators |
|--------|-------------|-------------------|
| `idle` | No file selected | Empty upload area with instructions |
| `selected` | File chosen but not yet uploading | File name, size, and upload button |
| `uploading` | File is being transferred | Progress bar, percentage, cancel option |
| `completed` | Upload finished successfully | Success message, check mark |
| `failed` | Upload encountered an error | Error message, retry option |

## Upload Workflow (Multiple Files)

For multiple file uploads, the component follows this sequence:

1. User selects files via drag-drop or file dialog
2. Files are validated for type and size
3. User clicks "Start Upload" to begin the process
4. Files are uploaded one by one, with progress tracking for each
5. Completed uploads show success indicators
6. Failed uploads show error messages with retry options
7. When all uploads finish, the completion callback is triggered

## File Validation

Both components perform validation on selected files:

1. **Size validation**: Rejects files larger than `maxSizeMB`
2. **Type validation**: Accepts only the MIME types specified in `acceptedFileTypes`

### MIME Type Patterns

The `acceptedFileTypes` prop supports several patterns:

| Pattern | Example | Description |
|---------|---------|-------------|
| Exact MIME type | `"image/jpeg"` | Matches only JPEG images |
| Type category | `"image/*"` | Matches all image types |
| Multiple types | `"image/png,application/pdf"` | Matches PNG images and PDFs |

## Advanced Usage

### Custom Upload Triggers

You can control when uploads begin with the `uploadingDependsToForm` prop:

```tsx
// Upload starts immediately when file is selected
<SingleFileUpload 
  uploadingDependsToForm={false}
  // ...other props
/>

// Upload starts when user clicks the "Start Upload" button
<SingleFileUpload 
  uploadingDependsToForm={true}
  // ...other props
/>
```

### Handling Failed Uploads

The MultiFileUpload component provides retry capabilities for failed uploads:

```tsx
const GalleryUploader = () => {
  const handleAllUploadsComplete = (succeeded, failed) => {
    if (failed.length > 0) {
      // Store failed uploads for potential retry or reporting
      setFailedUploads(failed);
    }
  };

  // Other implementation...
};
```

### Using with Form Libraries

These components work well with React form libraries like Formik or React Hook Form:

```tsx
import { useForm } from 'react-hook-form';
import { SingleFileUpload } from '@/components/modules/upload-files';

const ProfileForm = () => {
  const { register, handleSubmit, setValue } = useForm();
  
  const handleUploadSuccess = (result) => {
    // Save file URL to form data
    setValue('profilePictureUrl', result.url);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      
      <SingleFileUpload
        id="profile-picture"
        acceptedFileTypes="image/*"
        maxSizeMB={2}
        onUploadSuccess={handleUploadSuccess}
      />
      
      <input type="hidden" {...register('profilePictureUrl')} />
      <button type="submit">Save Profile</button>
    </form>
  );
};
```

## Localization

The components support English and Persian languages:

```tsx
// English UI
<MultiFileUpload language="en" />

// Persian UI
<MultiFileUpload language="fa" />
```

## API Integration

These components internally use our file API system, but expose a simple interface. The files are uploaded to a MinIO-compatible storage service organized by buckets.

## Styling

The components use Tailwind CSS for styling and are designed to adapt to dark/light mode themes.

## Best Practices

1. **Always provide unique IDs** for component instances to ensure proper isolation
2. **Be specific with MIME types** to prevent users from uploading incorrect file types
3. **Set appropriate size limits** based on your application's needs
4. **Use proper error handling** callbacks to provide feedback to users
5. **Consider bucket organization** for better file management

## Implementation Details

The components use React hooks internally for state management:

- `useSingleFileUpload`: Custom hook for single file upload
- `useMultiFileUpload`: Custom hook for multiple file uploads

These hooks interact with the Redux store to manage upload states and progress tracking.