'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { formatFileSize } from '../utils/file-formatters';
import {
  UseSingleFileUploadOptions,
  SingleFileUploadHookResult,
  UploadStatus,
} from '../utils/file-types';
import {
  addFiles,
  removeFilesForComponent,
  updateFileProgress,
  fileUploadSuccess,
  fileUploadFailure,
  setFileUploading,
  clearFileUploading,
} from '@/store/features/files/progress-slice';
import {
  cancelUploadRequest,
  selectFilesByOwnerId,
  selectQueueStatusByOwnerId,
  useUploadSingleFileMutation,
} from '@/store/features/files/files.api';

// Import these functions directly from the file-helpers to avoid circular dependencies
import { clearUploadState } from '@/store/features/files/upload-utils';

/**
 * Custom hook for managing single file uploads
 */
const useSingleFileUpload = (
  options: UseSingleFileUploadOptions = {},
): SingleFileUploadHookResult => {
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

  // Use the RTK Query mutation
  const [uploadFileMutation] = useUploadSingleFileMutation();

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
        (currentFile.response || currentFile.metadata) &&
        !successCallbackCalled
      ) {
        // Pass metadata if available, otherwise pass the entire response
        // Extract from the nested data structure if needed
        const responseData =
          currentFile.response?.data?.files?.[0] ||
          currentFile.response?.files?.[0] ||
          currentFile.metadata;

        onUploadSuccess(responseData);
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

  // Start the upload process using RTK Query
  const startUpload = useCallback(async () => {
    if (!fileId.current || !file) return null;

    // Set status to uploading immediately
    setInternalUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Mark file as uploading in Redux
      dispatch(setFileUploading(fileId.current));

      // Use the RTK Query mutation with proper ownerId
      const result = await uploadFileMutation({
        bucket,
        fileInfo: {
          id: fileId.current,
          ownerId: componentIdRef.current, // Make sure to include the ownerId
          fileData: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          status: 'uploading',
          progress: 0,
          bytesUploaded: 0,
          errorMessage: '',
          file,
        },
      }).unwrap();

      // Update status on success
      setInternalUploadStatus('completed');
      setUploadProgress(100);

      // Call success callback if provided and if not already called
      if (onUploadSuccess && !successCallbackCalled) {
        // Extract the file data from the nested response structure
        const fileData = result.data?.files?.[0] || {};
        onUploadSuccess(fileData);
        setSuccessCallbackCalled(true);
      }

      return result;
    } catch (error: any) {
      // Set status to failed
      setInternalUploadStatus('failed');

      // Check if this was a cancellation
      const isCancelled =
        error?.message?.includes('cancelled') ||
        error?.status === 'cancelled' ||
        error?.status === 499;

      let errorMsg = isCancelled ? 'Upload cancelled' : 'Upload failed';
      if (error.data) {
        if (Array.isArray(error.data.message)) {
          errorMsg = error.data.message.join(', ');
        } else if (typeof error.data.message === 'string') {
          errorMsg = error.data.message;
        } else if (typeof error.data === 'string') {
          errorMsg = error.data;
        } else {
          errorMsg = JSON.stringify(error.data);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);

      // Call error callback if provided
      if (onUploadError) {
        onUploadError(error);
      }

      return null;
    } finally {
      // Clean up uploading status in Redux
      if (fileId.current) {
        dispatch(clearFileUploading(fileId.current));
      }
    }
  }, [
    bucket,
    dispatch,
    file,
    onUploadError,
    onUploadSuccess,
    uploadFileMutation,
    successCallbackCalled,
    componentIdRef,
  ]);

  // Cancel an in-progress upload
  const cancelUpload = useCallback(() => {
    if (fileId.current) {
      // Cancel via API helper
      cancelUploadRequest(fileId.current);
      setInternalUploadStatus('failed');
      setErrorMessage('Upload cancelled');

      // Call error callback with cancellation data
      if (onUploadError) {
        onUploadError({
          status: 'cancelled',
          message: 'Upload cancelled by user',
          data: {
            success: false,
            statusCode: 499,
            message: ['Upload cancelled by user'],
          },
        });
      }
    }
  }, [onUploadError]);

  // Reset the upload state
  const resetUpload = useCallback(() => {
    // Cancel any in-progress upload
    if (fileId.current) {
      cancelUploadRequest(fileId.current);
      clearUploadState(fileId.current);
    }

    // Clean up from Redux by removing all files for this component
    dispatch(removeFilesForComponent(componentIdRef.current));

    // Reset local state
    setFile(null);
    setFileInfo({ name: '', size: '', type: '' });
    setInternalUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setSuccessCallbackCalled(false);
    fileId.current = null;
  }, [dispatch]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Cancel any in-progress upload
      if (fileId.current) {
        cancelUploadRequest(fileId.current);
        clearUploadState(fileId.current);
      }

      // Clean up Redux state for this component
      dispatch(removeFilesForComponent(componentIdRef.current));
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
