import { useState, useRef } from 'react';

export type UploadStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';

type UploadOptions = {
  bucket?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  resetAfterUpload?: boolean;
};

const useFileUpload = (bucket = 'default') => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const uploadPromiseRef = useRef<any>(null);

  const selectFile = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setUploadStatus('selected');
      setErrorMessage('');
    } else {
      resetUpload();
    }
  };

  const rejectFile = (reason: string) => {
    setSelectedFile(null);
    setUploadStatus('failed');
    setErrorMessage(reason);
  };

  const startUpload = async (options: UploadOptions = {}) => {
    if (!selectedFile) return null;

    const {
      bucket: optionsBucket = bucket,
      onSuccess,
      onError,
      resetAfterUpload = false,
    } = options;

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Create a controller for aborting the upload
      const controller = new AbortController();
      const signal = controller.signal;

      // Custom upload function using XMLHttpRequest to track progress
      const uploadWithProgress = async (file: File) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `/api/files/upload/${optionsBucket}`, true);

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

      // Store reference for potential cancellation
      uploadPromiseRef.current = {
        abort: () => controller.abort(),
        promise: uploadWithProgress(selectedFile),
      };

      // Wait for upload to complete
      const result = await uploadPromiseRef.current.promise;

      // Update state on success
      setUploadStatus('completed');
      setUploadProgress(100);

      if (onSuccess) {
        onSuccess(result);
      }

      if (resetAfterUpload) {
        setTimeout(() => {
          resetUpload();
        }, 2000); // Reset after showing completed state for 2 seconds
      }

      return result;
    } catch (error: any) {
      // Check if this was cancelled
      if (error.status === 'aborted') {
        setUploadStatus('failed');
        setErrorMessage('Upload cancelled');
      } else {
        setUploadStatus('failed');
        setErrorMessage(error.message || 'Upload failed');

        if (onError) {
          onError(error);
        }
      }

      return null;
    } finally {
      uploadPromiseRef.current = null;
    }
  };

  const cancelUpload = () => {
    if (uploadPromiseRef.current && uploadPromiseRef.current.abort) {
      uploadPromiseRef.current.abort();
      uploadPromiseRef.current = null;
      setUploadStatus('failed');
      setErrorMessage('Upload cancelled');
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
  };

  return {
    selectedFile,
    uploadStatus,
    uploadProgress,
    errorMessage,
    selectFile,
    rejectFile,
    startUpload,
    cancelUpload,
    resetUpload,
    uploadProps: {
      onFileSelect: selectFile,
      onFileReject: rejectFile,
      uploadStatus,
      uploadProgress,
      errorMessage,
      onUploadStart: () => startUpload(),
      onUploadCancel: cancelUpload,
      onRemoveFile: resetUpload,
    },
  };
};

export default useFileUpload;
