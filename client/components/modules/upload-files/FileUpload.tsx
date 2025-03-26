'use client';

import { useState, useRef } from 'react';
import SingleFileUpload from '@/components/modules/upload-files/SingleFileUpload';
import { useUploadFileMutation } from '@/store/features/files/files.api';

export type FileUploadProps = {
  id: string; // Unique identifier for this upload component
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  type?: 'single' | 'multiple';
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: any) => void;
  onFileSelect?: (file: File | null) => void;
};

// Upload status type
export type UploadStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';

const FileUpload = ({
  id,
  bucket = 'default',
  acceptedFileTypes = 'image/jpeg,image/png,application/pdf',
  maxSizeMB = 5,
  type = 'single',
  onUploadSuccess,
  onUploadError,
  onFileSelect: externalFileSelectHandler,
}: FileUploadProps) => {
  // Local state instead of Redux
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const [uploadFile] = useUploadFileMutation();
  const uploadPromiseRef = useRef<any>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);

    if (file) {
      setUploadStatus('selected');
      setErrorMessage('');
    } else {
      resetUploadState();
    }

    // Call external handler if provided
    if (externalFileSelectHandler) {
      externalFileSelectHandler(file);
    }
  };

  const handleFileReject = (reason: string) => {
    setSelectedFile(null);
    setUploadStatus('failed');
    setErrorMessage(reason);
  };

  const handleUploadStart = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Create a component-specific abort controller
      const controller = new AbortController();
      const signal = controller.signal;

      // Create a custom upload function that uses XMLHttpRequest to track progress
      const uploadWithProgress = async (file: File) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `/api/files/upload/${bucket}`, true);

          // Add abort listener
          signal.addEventListener('abort', () => {
            xhr.abort();
            reject({ status: 'aborted', message: 'Upload cancelled' });
          });

          // Track upload progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percentComplete);
            }
          };

          // Handle response
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                reject({ status: xhr.status, message: 'Invalid response format' });
              }
            } else {
              reject({ status: xhr.status, message: xhr.responseText });
            }
          };

          // Handle errors
          xhr.onerror = () => {
            reject({ status: xhr.status, message: 'Network error' });
          };

          // Prepare FormData
          const formData = new FormData();
          formData.append('file', file);

          // Send request
          xhr.send(formData);
        });
      };

      // Store the controller for possible cancellation
      uploadPromiseRef.current = {
        abort: () => controller.abort(),
        promise: uploadWithProgress(selectedFile),
      };

      // Wait for the upload to complete
      const result = await uploadPromiseRef.current.promise;

      // Update state on success
      setUploadStatus('completed');
      setUploadProgress(100);

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      return result;
    } catch (error: any) {
      // Check if this was canceled
      if (error.status === 'aborted') {
        setUploadStatus('failed');
        setErrorMessage('Upload cancelled');
      } else {
        setUploadStatus('failed');
        setErrorMessage(error.message || 'Upload failed');

        // Call error callback if provided
        if (onUploadError) {
          onUploadError(error);
        }
      }

      return null;
    } finally {
      // Clear the promise reference
      uploadPromiseRef.current = null;
    }
  };

  const handleUploadCancel = () => {
    if (uploadPromiseRef.current && uploadPromiseRef.current.abort) {
      uploadPromiseRef.current.abort();
      uploadPromiseRef.current = null;
      setUploadStatus('failed');
      setErrorMessage('Upload cancelled');
    }
  };

  const handleRemoveFile = () => {
    resetUploadState();
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
  };

  return (
    <div data-upload-id={id}>
      <SingleFileUpload
        type={type}
        acceptedFileTypes={acceptedFileTypes}
        maxSizeMB={maxSizeMB}
        onFileSelect={handleFileSelect}
        onFileReject={handleFileReject}
        uploadStatus={uploadStatus}
        uploadProgress={uploadProgress}
        errorMessage={errorMessage}
        onUploadStart={handleUploadStart}
        onUploadCancel={handleUploadCancel}
        onRemoveFile={handleRemoveFile}
      />
    </div>
  );
};

export default FileUpload;
