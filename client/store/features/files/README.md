# Redux File Upload System

A robust and flexible Redux-based file upload management system for Next.js applications. This system provides comprehensive control over file uploads with progress tracking, cancellation, retry functionality, and more.

## Features

- **Progress tracking**: Real-time tracking of upload progress
- **Upload queue management**: Handle multiple files with priority
- **Cancellable uploads**: Abort uploads in progress
- **Retry functionality**: Easily retry failed uploads
- **Component isolation**: Each upload component instance has its own state
- **Throttling**: Prevent rapid successive upload attempts
- **Error handling**: Comprehensive error capture and reporting

## Architecture

The upload system is built on RTK (Redux Toolkit) and includes:

- **Redux state**: Maintained for tracking upload status
- **Upload queue**: Manages files waiting to be uploaded
- **XMLHttpRequest**: Used for better control over upload progress
- **AbortController**: For cancelling uploads in progress

## Core Files

- `progress-slice.ts`: Redux slice for managing upload state
- `files.api.ts`: RTK Query API endpoints and selectors
- `upload-utils.ts`: Helper functions for throttling and tracking uploads

## Installation

Ensure you have the required dependencies:

```bash
npm install @reduxjs/toolkit react-redux uuid
```

## Redux Setup

1. **Add the file upload reducer to your store**:

```typescript
// In your store configuration
import fileUploadReducer from './features/files/progress-slice';

const rootReducer = combineReducers({
  // other reducers
  upload: fileUploadReducer,
});
```

2. **Register the API endpoints**:

```typescript
// In your store configuration
import { baseApi } from './api';
import { authMiddleware } from './redux-middlewares/auth-middleware';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, authMiddleware),
});
```

## State Management

The upload system maintains the following state:

### File Upload States

```typescript
export type FileUploadStatus =
  | 'idle'      // No file selected
  | 'selected'  // File selected but not yet uploading
  | 'waiting'   // File in queue, waiting to upload
  | 'uploading' // File currently uploading
  | 'completed' // Upload successful
  | 'failed';   // Upload failed
```

### Queue Status

```typescript
export type QueueStatus = 
  | 'idle'      // No files in queue
  | 'selected'  // Files selected but not uploading
  | 'uploading' // Files currently uploading
  | 'completed' // All uploads completed successfully
  | 'failed';   // Some or all uploads failed
```

## Selectors

The system provides several selectors for accessing upload state:

```typescript
// Get all files for a specific component
selectFilesByOwnerId(ownerId)

// Get queue status for a specific component
selectQueueStatusByOwnerId(ownerId)

// Get the file currently being uploaded for a component
selectCurrentUploadingFileByOwnerId(ownerId)

// Check if all files for a component have been processed
selectAllFilesHandledByOwnerId(ownerId)

// Get all successfully uploaded files for a component
selectUploadedFilesByOwnerId(ownerId)

// Get all failed files for a component
selectFailedFilesByOwnerId(ownerId)

// Get a specific file by ID
selectFileById(fileId)
```

## API Endpoints

The system provides the following API endpoints:

```typescript
// Upload a single file
useUploadSingleFileMutation()

// Get a file download URL
useGetFileDownloadUrlQuery()

// Get file metadata
useGetFileMetadataQuery()

// Delete a file
useDeleteFileMutation()
```

## Actions

The system provides several actions for managing uploads:

```typescript
// Add files to the queue
addFiles({ ownerId, files })

// Remove a file from the queue
removeFile(fileId)

// Remove all files for a specific component
removeFilesForComponent(ownerId)

// Reset the upload UI for a component
resetUploadUI(ownerId)

// Clear all files from the queue for a component
clearComponentQueue(ownerId)

// Start the upload process for a component
startUpload(ownerId)

// Update progress for a file
updateFileProgress({ id, progress, bytesUploaded })

// Set a file as actively uploading
setFileUploading(fileId)

// Clear a file's uploading status
clearFileUploading(fileId)

// Mark a file as completed
fileUploadSuccess({ id, response })

// Mark a file as failed
fileUploadFailure({ id, errorMessage })

// Cancel a specific file upload
cancelFileUpload(fileId)

// Cancel all uploads for a component
cancelComponentUploads(ownerId)

// Retry a failed file upload
retryFileUpload(fileId)

// Retry all failed uploads for a component
retryComponentFailedUploads(ownerId)
```

## Helper Functions

The system includes several helper functions in `upload-utils.ts`:

```typescript
// Throttle an upload to prevent rapid requests
throttleUpload(fileId, callback)

// Check if an upload is being throttled
isUploadThrottled(fileId)

// Check if an upload is in progress
isUploadInProgress(fileId)

// Clear throttling and in-progress state for a file
clearUploadState(fileId)

// Clear all throttling and in-progress information
clearAllUploadStates()
```

## Cancellation

To cancel an upload in progress:

```typescript
import { cancelUploadRequest } from '@/store/features/files/files.api';

// Cancel a specific upload
cancelUploadRequest(fileId);
```

## Error Handling

Errors are captured in the Redux state and available via the file upload info:

```typescript
// File upload state includes error information
{
  id: string;
  status: 'failed';
  errorMessage: string;
  // other properties
}
```

## Best Practices

1. **Always provide unique IDs**: Each upload component should have a unique ID to isolate state
2. **Clean up on unmount**: Ensure components clean up their state when unmounting
3. **Handle errors**: Always provide error handling for uploads
4. **Monitor upload status**: Use selectors to monitor upload status and handle UI accordingly
5. **Throttle uploads**: Be mindful of server load and use throttling for multiple uploads

## Example Implementation

```typescript
// In a component
import { useDispatch, useSelector } from 'react-redux';
import {
  addFiles,
  startUpload,
  cancelFileUpload,
} from '@/store/features/files/progress-slice';
import { selectFilesByOwnerId } from '@/store/features/files/files.api';

// Component implementation
const MyUploadComponent = ({ id }) => {
  const dispatch = useDispatch();
  const files = useSelector(selectFilesByOwnerId(id));

  const handleFileSelect = (file) => {
    dispatch(addFiles({
      ownerId: id,
      files: [{ id: 'file-id', name: file.name, size: file.size, type: file.type }]
    }));
  };

  const handleStartUpload = () => {
    dispatch(startUpload(id));
  };

  const handleCancelUpload = (fileId) => {
    dispatch(cancelFileUpload(fileId));
  };

  // Rest of component
};
```

## Advanced Configuration

### Customizing Upload Timeout

You can adjust the throttle time in `upload-utils.ts`:

```typescript
// Default is 1000ms (1 second)
export const UPLOAD_THROTTLE_TIME = 1000;
```

### Server Integration

The upload system is designed to work with any server that accepts `FormData` uploads. The API endpoints expect responses in the format defined in `base-response.model.ts`.

## Troubleshooting

### Uploads Not Starting

- Check that the component has a unique ID
- Verify that files have been added to the queue
- Ensure `startUpload` has been dispatched

### Uploads Failing

- Check server response format
- Verify file size and type constraints
- Check network connectivity

### Memory Leaks

- Ensure components clean up on unmount by calling `removeFilesForComponent`
- Clear file objects from the Map when no longer needed