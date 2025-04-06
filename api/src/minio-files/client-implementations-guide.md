# MinIO File Service Client Implementation Guide

This guide explains how to interact with the optimized MinIO file service API from client applications. The API has been refactored to improve performance, security, and resource usage.

## Breaking Changes

Recent refactoring made several breaking changes to the API:

1. **Client-side configuration parameters have been removed**

   - Configuration options like `maxSizeMB`, `generateThumbnail`, etc. are now controlled via server-side environment variables
   - Client requests that include these parameters will still work, but the parameters will be ignored

2. **Thumbnail generation is now limited to images only**

   - Only image files will get thumbnails generated
   - For non-image files, clients should use generic file type icons instead

3. **Resource intensive operations are optimized**
   - Streaming is used throughout the pipeline to minimize memory usage
   - Large file uploads and downloads are handled more efficiently

## API Endpoints

### Upload Files

```
POST /api/files/upload/:bucket
```

- **URL Parameters:**

  - `bucket`: The name of the target bucket

- **Multipart Form Data:**

  - Send one or more files in a standard multipart form data request

- **Response:**
  ```json
  {
    "message": "Files uploaded successfully",
    "files": [
      {
        "originalName": "example.jpg",
        "uniqueName": "example-20240423142536-a1b2c3d4.jpg",
        "size": 12345,
        "mimetype": "image/jpeg",
        "thumbnailName": "thumb_example-20240423142536-a1b2c3d4.jpg",
        "url": "https://...",
        "thumbnailUrl": "https://...",
        "bucket": "default",
        "uploadedAt": "2024-04-23T14:25:36.789Z"
      }
    ]
  }
  ```

### Download File

```
GET /api/files/download/:bucket/:filename
```

- **URL Parameters:**

  - `bucket`: The name of the bucket containing the file
  - `filename`: The unique filename of the file to download

- **Query Parameters:**

  - `direct` (optional): Set to "true" to stream the file directly instead of returning a URL

- **Response:**
  - If `direct=true` or the file type is in the direct download list: The file is streamed directly to the client
  - Otherwise: A JSON response with a presigned URL:
    ```json
    {
      "url": "https://..."
    }
    ```

### Batch Download URLs

```
GET /api/files/batch-download?bucket=:bucket&filenames=:filenames
```

- **Query Parameters:**

  - `bucket`: The name of the bucket containing the files
  - `filenames`: Comma-separated list of filenames to generate URLs for
  - `expiry` (optional): URL expiry time in seconds (defaults to server config)

- **Response:**
  ```json
  {
    "urls": {
      "file1.jpg": "https://...",
      "file2.pdf": "https://..."
    }
  }
  ```

### Get File Metadata

```
GET /api/files/metadata/:bucket/:filename
```

- **URL Parameters:**

  - `bucket`: The name of the bucket containing the file
  - `filename`: The unique filename of the file

- **Response:**
  ```json
  {
    "metadata": {
      "originalName": "example.jpg",
      "uniqueName": "example-20240423142536-a1b2c3d4.jpg",
      "size": 12345,
      "mimetype": "image/jpeg",
      "thumbnailName": "thumb_example-20240423142536-a1b2c3d4.jpg",
      "url": "https://...",
      "thumbnailUrl": "https://...",
      "bucket": "default",
      "uploadedAt": "2024-04-23T14:25:36.789Z"
    }
  }
  ```

### List Files

```
GET /api/files/list/:bucket
```

- **URL Parameters:**

  - `bucket`: The name of the bucket to list files from

- **Query Parameters:**

  - `prefix` (optional): Filter files by prefix
  - `recursive` (optional): Set to "false" to not list files in subdirectories

- **Response:**
  ```json
  {
    "files": [
      {
        "originalName": "example1.jpg",
        "uniqueName": "example1-20240423142536-a1b2c3d4.jpg",
        "size": 12345,
        "mimetype": "image/jpeg",
        "thumbnailName": "thumb_example1-20240423142536-a1b2c3d4.jpg",
        "url": "https://...",
        "thumbnailUrl": "https://...",
        "bucket": "default",
        "uploadedAt": "2024-04-23T14:25:36.789Z"
      },
      {
        "originalName": "example2.pdf",
        "uniqueName": "example2-20240423142536-e5f6g7h8.pdf",
        "size": 67890,
        "mimetype": "application/pdf",
        "url": "https://...",
        "bucket": "default",
        "uploadedAt": "2024-04-23T14:25:36.789Z"
      }
    ]
  }
  ```

### Delete File

```
DELETE /api/files/delete/:bucket/:filename
```

- **URL Parameters:**

  - `bucket`: The name of the bucket containing the file
  - `filename`: The unique filename of the file to delete

- **Response:**
  ```json
  {
    "message": "File \"filename\" deleted successfully from bucket \"bucket\""
  }
  ```

### List Buckets

```
GET /api/files/buckets
```

- **Response:**
  ```json
  {
    "buckets": [
      {
        "name": "default",
        "creationDate": "2024-04-23T14:25:36.789Z"
      },
      {
        "name": "images",
        "creationDate": "2024-04-23T14:25:36.789Z"
      }
    ]
  }
  ```

### Create Bucket

```
POST /api/files/buckets/:name
```

- **URL Parameters:**

  - `name`: The name of the bucket to create

- **Query Parameters:**

  - `region` (optional): The region to create the bucket in (default: 'us-east-1')
  - `publicPolicy` (optional): Set to "false" to create a private bucket (default: true)

- **Response:**
  ```json
  {
    "message": "Bucket \"name\" created successfully"
  }
  ```

### Delete Bucket

```
DELETE /api/files/buckets/:name
```

- **URL Parameters:**

  - `name`: The name of the bucket to delete

- **Query Parameters:**

  - `force` (optional): Set to "true" to force deletion by removing all objects first

- **Response:**
  ```json
  {
    "message": "Bucket \"name\" deleted successfully"
  }
  ```

## Client Implementation Examples

### Uploading Files

#### Basic Upload with Fetch API

```javascript
const uploadFile = async (file, bucket = 'default') => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`/api/files/upload/${bucket}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.files[0]; // Return the first file's metadata
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
```

#### Multiple File Upload with Fetch API

```javascript
const uploadMultipleFiles = async (files, bucket = 'default') => {
  const formData = new FormData();

  // Add all files to the form data
  for (const file of files) {
    formData.append('file', file);
  }

  try {
    const response = await fetch(`/api/files/upload/${bucket}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.files; // Return all file metadata
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};
```

### Downloading Files

#### Direct Download

```javascript
const directDownload = (bucket, filename) => {
  // Directly navigate to the download URL
  window.location.href = `/api/files/download/${bucket}/${filename}?direct=true`;
};
```

#### Using Presigned URL

```javascript
const downloadWithPresignedUrl = async (bucket, filename) => {
  try {
    const response = await fetch(`/api/files/download/${bucket}/${filename}`);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Open the presigned URL in a new tab
    window.open(result.url, '_blank');
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
};
```

### Handling Thumbnails

Since thumbnails are now only generated for images, clients should implement conditional logic:

```javascript
const getThumbnailUrl = (file) => {
  // Check if file is an image and has a thumbnail
  if (file.mimetype.startsWith('image/') && file.thumbnailUrl) {
    return file.thumbnailUrl;
  }

  // For non-image files, return appropriate icon based on MIME type
  return getIconForMimeType(file.mimetype);
};

const getIconForMimeType = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return '/icons/image.svg';
  } else if (mimetype.startsWith('video/')) {
    return '/icons/video.svg';
  } else if (mimetype.startsWith('audio/')) {
    return '/icons/audio.svg';
  } else if (mimetype.includes('pdf')) {
    return '/icons/pdf.svg';
  } else if (mimetype.includes('word') || mimetype.includes('document')) {
    return '/icons/document.svg';
  } else if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) {
    return '/icons/spreadsheet.svg';
  } else if (
    mimetype.includes('presentation') ||
    mimetype.includes('powerpoint')
  ) {
    return '/icons/presentation.svg';
  } else if (mimetype.includes('zip') || mimetype.includes('compressed')) {
    return '/icons/archive.svg';
  } else {
    return '/icons/file.svg';
  }
};
```

## React Component Example

Here's a simple React file uploader component that works with the updated API:

```jsx
import React, { useState } from 'react';

const SimpleFileUploader = ({ bucket = 'default', onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setError(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('file', file));

      const response = await fetch(`/api/files/upload/${bucket}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (onUploadSuccess) {
        onUploadSuccess(result.files);
      }

      setFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
      />

      {files.length > 0 && (
        <div className="selected-files">
          <p>Selected {files.length} file(s):</p>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <button onClick={handleUpload} disabled={files.length === 0 || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default SimpleFileUploader;
```

## Migrating from the Previous API

If you were using the previous API with client-side configuration, you'll need to modify your code:

1. **Remove all client-side configuration parameters**

   - Remove parameters like `generateThumbnail`, `maxSizeMB`, etc. from your upload requests

2. **Update thumbnail handling**

   - Modify your code to use generic icons for non-image files
   - Only expect thumbnail URLs for image files

3. **Adapt to resource-efficient streaming**

   - For large file downloads, prefer direct streaming (`direct=true`) when appropriate
   - Be prepared for faster response times but potentially different behavior with large files

4. **Review environment configuration**
   - If you're deploying the server, ensure all required environment variables are set
   - Adjust the configuration to match your specific requirements
