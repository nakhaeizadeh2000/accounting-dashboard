import { useCallback, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  addFiles,
  removeFilesForComponent,
  updateFileProgress,
  fileUploadSuccess,
  fileUploadFailure,
  setFileUploading,
  clearFileUploading,
  FileUploadStatus,
} from '@/store/features/files/progress-slice';
import {
  cancelUploadRequest,
  selectFilesByOwnerId,
  selectQueueStatusByOwnerId,
} from '@/store/features/files/files.api';
import { clearUploadState } from '@/store/features/files/upload-utils';

export type UseSingleFileUploadOptions = {
  id?: string; // Component instance ID for isolation
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: any) => void;
  onFileSelect?: (file: File | null) => void;
};

// Type that matches what SingleFileUpload component expects
type UploadStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';

const useSingleFileUpload = (options: UseSingleFileUploadOptions = {}) => {
  const {
    id: providedId,
    bucket = 'default',
    acceptedFileTypes = '',
    maxSizeMB = 10,
    onUploadSuccess,
    onUploadError,
    onFileSelect: externalFileSelectHandler,
  } = options;

  // Create a stable instance ID for this component
  const componentIdRef = useRef<string>(providedId || `single-upload-${uuidv4()}`);

  // Store file locally in the hook instead of in a global Map
  const [file, setFile] = useState<File | null>(null);
  const dispatch = useDispatch();
  const fileId = useRef<string | null>(null);
  const [fileInfo, setFileInfo] = useState({ name: '', size: '', type: '' });
  const [internalUploadStatus, setInternalUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const uploadPromiseRef = useRef<any>(null);

  // Track if we've already called success callback for the current file
  const [successCallbackCalled, setSuccessCallbackCalled] = useState(false);

  // Get files from Redux for this component only
  const componentFiles = useSelector(selectFilesByOwnerId(componentIdRef.current));
  const reduxQueueStatus = useSelector(selectQueueStatusByOwnerId(componentIdRef.current));

  // Sync local state with Redux when needed
  useEffect(() => {
    // If we have files in Redux
    if (componentFiles.length > 0) {
      const currentFile = componentFiles[0]; // Single file upload only has one file

      // Only update uploading status if we transition to 'completed' or 'failed'
      // This prevents flickering between 'selected' and 'uploading'
      if (
        (currentFile.status === 'completed' || currentFile.status === 'failed') &&
        internalUploadStatus !== currentFile.status
      ) {
        setInternalUploadStatus(currentFile.status as UploadStatus);

        // Reset success callback flag if status changes from completed
        if (currentFile.status !== 'completed') {
          setSuccessCallbackCalled(false);
        }
      }

      // Always update progress, even if we don't update status
      if (currentFile.progress !== uploadProgress && internalUploadStatus === 'uploading') {
        setUploadProgress(currentFile.progress);
      }

      if (currentFile.errorMessage !== errorMessage) {
        setErrorMessage(currentFile.errorMessage);
      }

      // Handle success callback if file is completed and we haven't called it yet
      if (
        currentFile.status === 'completed' &&
        onUploadSuccess &&
        currentFile.response &&
        !successCallbackCalled
      ) {
        onUploadSuccess(currentFile.response);
        setSuccessCallbackCalled(true);
      }
    } else if (internalUploadStatus !== 'idle') {
      // If no files in Redux but we had a status, reset to idle
      setInternalUploadStatus('idle');
      setUploadProgress(0);
      setErrorMessage('');
      setFile(null);
      fileId.current = null;
      setSuccessCallbackCalled(false);
    }
  }, [
    componentFiles,
    internalUploadStatus,
    uploadProgress,
    errorMessage,
    onUploadSuccess,
    successCallbackCalled,
  ]);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

    return `${formattedSize} ${sizes[i]}`;
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    (newFile: File | null) => {
      // Clean up any existing files for this component
      dispatch(removeFilesForComponent(componentIdRef.current));

      // Cancel any in-progress upload
      if (fileId.current) {
        cancelUploadRequest(fileId.current);
        clearUploadState(fileId.current);
        fileId.current = null;
      }

      // Reset success callback state
      setSuccessCallbackCalled(false);

      if (newFile) {
        // Generate new ID for this file with component ID to ensure uniqueness
        const newFileId = `${componentIdRef.current}-${uuidv4()}`;
        fileId.current = newFileId;

        // Store file locally in state
        setFile(newFile);

        // Set file info for UI
        setFileInfo({
          name: newFile.name,
          size: formatFileSize(newFile.size),
          type: newFile.type,
        });

        // Update internal status
        setInternalUploadStatus('selected');
        setErrorMessage('');

        // Add to Redux with component owner ID
        dispatch(
          addFiles({
            ownerId: componentIdRef.current,
            files: [
              {
                id: newFileId,
                name: newFile.name,
                size: newFile.size,
                type: newFile.type,
              },
            ],
          }),
        );
      } else {
        resetUpload();
      }

      // Call external handler if provided
      if (externalFileSelectHandler) {
        externalFileSelectHandler(newFile);
      }
    },
    [dispatch, externalFileSelectHandler],
  );

  // Handle file rejection
  const handleFileReject = useCallback((reason: string) => {
    setInternalUploadStatus('failed');
    setErrorMessage(reason);
  }, []);

  // Start the upload process
  const startUpload = useCallback(async () => {
    if (!fileId.current || !file) return null;

    // Set status to uploading immediately
    setInternalUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Create a controller for aborting
      const controller = new AbortController();
      const signal = controller.signal;

      // Custom upload function using XMLHttpRequest
      const uploadWithProgress = async () => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const currentFileId = fileId.current as string;

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
              // Update the progress state directly - don't rely solely on Redux
              setUploadProgress(percentComplete);

              // Keep the status as uploading
              setInternalUploadStatus('uploading');

              // Update Redux with progress
              dispatch(
                updateFileProgress({
                  id: currentFileId,
                  progress: percentComplete,
                  bytesUploaded: event.loaded,
                }),
              );
            }
          };

          // Handle response
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);

                // Update Redux with success
                dispatch(
                  fileUploadSuccess({
                    id: currentFileId,
                    response,
                  }),
                );

                // Force progress to 100% and status to completed
                setUploadProgress(100);
                setInternalUploadStatus('completed');

                resolve(response);
              } catch (e) {
                const errorMsg = 'Invalid response format';

                dispatch(
                  fileUploadFailure({
                    id: currentFileId,
                    errorMessage: errorMsg,
                  }),
                );

                // Force status to failed
                setInternalUploadStatus('failed');
                setErrorMessage(errorMsg);

                reject({ status: xhr.status, message: errorMsg });
              }
            } else {
              let errorMsg;
              try {
                errorMsg = JSON.parse(xhr.responseText).message || 'Upload failed';
              } catch (e) {
                errorMsg = 'Upload failed';
              }

              dispatch(
                fileUploadFailure({
                  id: currentFileId,
                  errorMessage: errorMsg,
                }),
              );

              // Force status to failed
              setInternalUploadStatus('failed');
              setErrorMessage(errorMsg);

              reject({ status: xhr.status, message: errorMsg });
            }
          };

          // Handle errors
          xhr.onerror = () => {
            const errorMsg = 'Network error occurred';

            dispatch(
              fileUploadFailure({
                id: currentFileId,
                errorMessage: errorMsg,
              }),
            );

            reject({ status: xhr.status, message: errorMsg });
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
        promise: uploadWithProgress(),
      };

      // Set file as uploading in Redux
      dispatch(setFileUploading(fileId.current));

      // Wait for the upload to complete
      const result = await uploadPromiseRef.current.promise;

      // Update state on success
      setInternalUploadStatus('completed');
      setUploadProgress(100);

      // Call success callback if provided
      // (We'll also handle this via the effect, but direct callback is useful for immediate feedback)
      if (onUploadSuccess && !successCallbackCalled) {
        onUploadSuccess(result);
        setSuccessCallbackCalled(true);
      }

      return result;
    } catch (error: any) {
      // Check if this was canceled
      if (error.status === 'aborted') {
        setInternalUploadStatus('failed');
        setErrorMessage('Upload cancelled');
      } else {
        setInternalUploadStatus('failed');
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

      // Clear file uploading status in Redux
      if (fileId.current) {
        dispatch(clearFileUploading(fileId.current));
      }
    }
  }, [bucket, dispatch, onUploadError, onUploadSuccess, file, successCallbackCalled]);

  // Cancel an in-progress upload
  const cancelUpload = useCallback(() => {
    if (uploadPromiseRef.current && uploadPromiseRef.current.abort) {
      uploadPromiseRef.current.abort();
      uploadPromiseRef.current = null;
      setInternalUploadStatus('failed');
      setErrorMessage('Upload cancelled');

      // Cancel via API helper
      if (fileId.current) {
        cancelUploadRequest(fileId.current);
      }
    }
  }, []);

  // Reset the upload state
  const resetUpload = useCallback(() => {
    // Cancel any in-progress upload
    if (uploadPromiseRef.current && uploadPromiseRef.current.abort) {
      uploadPromiseRef.current.abort();
      uploadPromiseRef.current = null;
    }

    // Clean up from Redux by removing all files for this component
    dispatch(removeFilesForComponent(componentIdRef.current));

    // If we had a file ID, clean up its specific state
    if (fileId.current) {
      clearUploadState(fileId.current);
      fileId.current = null;
    }

    // Reset local state
    setFile(null);
    setFileInfo({ name: '', size: '', type: '' });
    setInternalUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setSuccessCallbackCalled(false);
  }, [dispatch]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Cancel any in-progress upload
      if (uploadPromiseRef.current && uploadPromiseRef.current.abort) {
        uploadPromiseRef.current.abort();
      }

      // Clean up Redux state for this component
      dispatch(removeFilesForComponent(componentIdRef.current));

      // Clean up uploading state for any specific file
      if (fileId.current) {
        clearUploadState(fileId.current);
      }
    };
  }, [dispatch]);

  return {
    instanceId: componentIdRef.current,
    selectedFile: file,
    fileInfo,
    uploadStatus: internalUploadStatus,
    uploadProgress,
    errorMessage,
    handleFileSelect,
    handleFileReject,
    startUpload,
    cancelUpload,
    resetUpload,
    // Convenience props object for direct passing to SingleFileUpload
    uploadProps: {
      selectedFile: file,
      onFileSelect: handleFileSelect,
      onFileReject: handleFileReject,
      uploadStatus: internalUploadStatus,
      uploadProgress,
      errorMessage,
      onUploadStart: startUpload,
      onUploadCancel: cancelUpload,
      onRemoveFile: resetUpload,
    },
  };
};

export default useSingleFileUpload;
