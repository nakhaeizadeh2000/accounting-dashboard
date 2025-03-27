'use client';

import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IRootState } from '@/store';
import MultiFileUpload from '@/components/modules/upload-files/MultiFileUpload';
import { useUploadFileMutation } from '@/store/features/files/files.api';
import {
  setUploadProgress,
  setUploadStatus,
  setUploadError,
  resetUploadState,
  UploadStatus,
} from '@/store/features/files/progress-slice';

export type MultiFileUploadWrapperProps = {
  id: string; // Unique identifier for this upload component
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  uploadingDependsToForm?: boolean;
  onUploadSuccess?: (fileId: string, result: any) => void;
  onUploadError?: (fileId: string, error: any) => void;
  onFilesSelect?: (files: File[]) => void;
  onAllUploadsComplete?: (results: Record<string, any>) => void;
};

// Type for file entry
type FileEntry = {
  id: string;
  file: File;
  status: UploadStatus;
};

/**
 * A wrapper component that adds functionality to the MultiFileUpload component
 * Handles file selection, validation, upload, and state management
 */
const MultiFileUploadWrapper = ({
  id,
  bucket = 'default',
  acceptedFileTypes = 'image/jpeg,image/png,application/pdf',
  maxSizeMB = 5,
  maxFiles = 10,
  uploadingDependsToForm = false,
  onUploadSuccess,
  onUploadError,
  onFilesSelect,
  onAllUploadsComplete,
}: MultiFileUploadWrapperProps) => {
  // Redux
  const dispatch = useDispatch();
  const uploadReduxState = useSelector((state: IRootState) => state.upload);
  const [uploadFile] = useUploadFileMutation();

  // Track files and their states
  const [files, setFiles] = useState<Record<string, FileEntry>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [overallStatus, setOverallStatus] = useState<UploadStatus>('idle');
  const [uploadResults, setUploadResults] = useState<Record<string, any>>({});

  // Refs for managing uploads
  const uploadPromiseRefs = useRef<Record<string, AbortController | null>>({});
  const activeFileIdRef = useRef<string | null>(null);

  // Effect to monitor Redux state changes for progress updates
  useEffect(() => {
    if (overallStatus === 'uploading' && activeFileIdRef.current) {
      const fileId = activeFileIdRef.current;

      // Update progress for the active file
      setUploadProgress((prev) => ({
        ...prev,
        [fileId]: uploadReduxState.progress,
      }));

      // Update file status if upload status changed in Redux
      if (uploadReduxState.status !== 'uploading' && files[fileId]?.status === 'uploading') {
        setFiles((prev) => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: uploadReduxState.status,
          },
        }));

        if (uploadReduxState.status === 'failed') {
          setUploadErrors((prev) => ({
            ...prev,
            [fileId]: uploadReduxState.errorMessage,
          }));
        }

        // If file completed/failed, clear the active file ref
        if (uploadReduxState.status === 'completed' || uploadReduxState.status === 'failed') {
          activeFileIdRef.current = null;
        }
      }
    }
  }, [uploadReduxState, overallStatus, files]);

  // Generate a unique file ID
  const generateFileId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  const handleFilesSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    // Create a unique ID for each file
    const newFiles: Record<string, FileEntry> = {};

    selectedFiles.forEach((file) => {
      const fileId = generateFileId();
      newFiles[fileId] = {
        id: fileId,
        file,
        status: 'selected',
      };
    });

    // Update files state
    setFiles((prev) => ({
      ...prev,
      ...newFiles,
    }));

    setOverallStatus('selected');

    // Call external handler if provided
    if (onFilesSelect) {
      onFilesSelect(selectedFiles);
    }
  };

  const handleFileReject = (reason: string) => {
    // Just log the rejection for now
    console.warn('File rejected:', reason);
  };

  const handleUploadStart = async () => {
    // Only proceed if we have files in 'selected' state
    const filesToUpload = Object.entries(files).filter(
      ([_, fileInfo]) => fileInfo.status === 'selected',
    );

    if (filesToUpload.length === 0) return [];

    // Reset Redux state
    dispatch(resetUploadState());

    // Update overall status
    setOverallStatus('uploading');

    // Reset progress for files that are about to be uploaded
    const initialProgress = { ...uploadProgress };
    filesToUpload.forEach(([fileId]) => {
      initialProgress[fileId] = 0;
    });
    setUploadProgress(initialProgress);

    // Update file statuses to 'uploading'
    const updatedFiles = { ...files };
    filesToUpload.forEach(([fileId]) => {
      updatedFiles[fileId].status = 'uploading';
    });
    setFiles(updatedFiles);

    // Create a results object to collect all upload results
    const results: Record<string, any> = { ...uploadResults };
    const uploadedFileIds: string[] = [];

    // Upload each file individually in sequence
    for (const [fileId, fileInfo] of filesToUpload) {
      try {
        // Reset Redux state for new upload
        dispatch(resetUploadState());
        dispatch(setUploadStatus('uploading'));

        // Set current file as active for progress tracking
        activeFileIdRef.current = fileId;

        // Create a controller for abort
        const controller = new AbortController();
        uploadPromiseRefs.current[fileId] = controller;

        // Upload the file
        const result = await uploadFile({
          bucket,
          files: [fileInfo.file],
        }).unwrap();

        // Update state on success
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: 100,
        }));

        setFiles((prev) => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: 'completed',
          },
        }));

        // Store the result
        results[fileId] = result;
        setUploadResults((prev) => ({
          ...prev,
          [fileId]: result,
        }));
        uploadedFileIds.push(fileId);

        // Call success callback if provided
        if (onUploadSuccess) {
          onUploadSuccess(fileId, result);
        }
      } catch (error: any) {
        // Check if this was canceled
        const errorMessage =
          error.status === 'aborted'
            ? 'Upload cancelled'
            : error.data || error.message || 'Upload failed';

        setUploadErrors((prev) => ({
          ...prev,
          [fileId]: errorMessage,
        }));

        setFiles((prev) => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: 'failed',
          },
        }));

        // Call error callback if provided
        if (onUploadError) {
          onUploadError(fileId, error);
        }
      } finally {
        // Clear the controller reference
        uploadPromiseRefs.current[fileId] = null;
      }
    }

    // Clear active file
    activeFileIdRef.current = null;

    // Check if all files have been processed
    const allCompleted = Object.values(files).every(
      (file) => file.status === 'completed' || file.status === 'failed',
    );

    if (allCompleted) {
      const anyFailed = Object.values(files).some((file) => file.status === 'failed');
      setOverallStatus(anyFailed ? 'failed' : 'completed');

      // Reset Redux state
      dispatch(resetUploadState());

      // Call completion callback if provided
      if (onAllUploadsComplete) {
        onAllUploadsComplete(results);
      }
    }

    return uploadedFileIds;
  };

  const handleUploadCancel = (fileId: string) => {
    const controller = uploadPromiseRefs.current[fileId];
    if (controller) {
      controller.abort();
      uploadPromiseRefs.current[fileId] = null;

      // Update file status
      setFiles((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'failed',
        },
      }));

      setUploadErrors((prev) => ({
        ...prev,
        [fileId]: 'Upload cancelled',
      }));

      // If this was the active file, update Redux state
      if (activeFileIdRef.current === fileId) {
        dispatch(setUploadStatus('failed'));
        dispatch(setUploadError('Upload cancelled'));
        activeFileIdRef.current = null;
      }
    }
  };

  const handleRemoveFile = (fileId: string) => {
    // Cancel upload if in progress
    if (files[fileId]?.status === 'uploading' && uploadPromiseRefs.current[fileId]) {
      handleUploadCancel(fileId);
    }

    // Remove file from state
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    // Remove progress and error data
    setUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    setUploadErrors((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    setUploadResults((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    // Update overall status if no files left
    if (Object.keys(files).length <= 1) {
      // We're removing the last file
      setOverallStatus('idle');
      dispatch(resetUploadState());
    } else {
      // Recalculate overall status based on remaining files
      const anyUploading = Object.entries(files)
        .filter(([id]) => id !== fileId)
        .some(([_, file]) => file.status === 'uploading');

      const anyFailed = Object.entries(files)
        .filter(([id]) => id !== fileId)
        .some(([_, file]) => file.status === 'failed');

      const anySelected = Object.entries(files)
        .filter(([id]) => id !== fileId)
        .some(([_, file]) => file.status === 'selected');

      if (anyUploading) {
        setOverallStatus('uploading');
      } else if (anyFailed) {
        setOverallStatus('failed');
      } else if (anySelected) {
        setOverallStatus('selected');
      } else {
        setOverallStatus('completed');
      }
    }
  };

  const handleRetryFile = (fileId: string) => {
    if (!files[fileId]) return;

    // Reset file status to 'selected'
    setFiles((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        status: 'selected',
      },
    }));

    // Clear error for this file
    setUploadErrors((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    // Reset progress
    setUploadProgress((prev) => ({
      ...prev,
      [fileId]: 0,
    }));

    // If we're not uploading anything else, set overall status to 'selected'
    const anyUploading = Object.values(files).some((fileInfo) => fileInfo.status === 'uploading');
    if (!anyUploading) {
      setOverallStatus('selected');
    }
  };

  return (
    <div data-upload-id={id}>
      <MultiFileUpload
        id={id}
        acceptedFileTypes={acceptedFileTypes}
        maxSizeMB={maxSizeMB}
        maxFiles={maxFiles}
        uploadingDependsToForm={uploadingDependsToForm}
        onFilesSelect={handleFilesSelect}
        onFileReject={handleFileReject}
        uploadStatus={overallStatus}
        uploadProgress={uploadProgress}
        uploadError={uploadErrors}
        onUploadStart={handleUploadStart}
        onUploadCancel={handleUploadCancel}
        onRemoveFile={handleRemoveFile}
        onRetryFile={handleRetryFile}
      />
    </div>
  );
};

export default MultiFileUploadWrapper;
