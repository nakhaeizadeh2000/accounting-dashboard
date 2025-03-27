'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IRootState } from '@/store';
import SingleFileUpload from '@/components/modules/upload-files/SingleFileUpload';
import MultiFileUpload from '@/components/modules/upload-files/MultiFileUpload';
import { useUploadFileMutation } from '@/store/features/files/files.api';
import {
  setUploadProgress,
  setUploadStatus,
  setUploadError,
  resetUploadState,
  UploadStatus,
} from '@/store/features/files/progress-slice';

export type FileUploadProps = {
  id: string; // Unique identifier for this upload component
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  maxFiles?: number; // Only applicable for multiple mode
  mode: 'single' | 'multiple';
  uploadingDependsToForm?: boolean;
  // Single mode callbacks
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: any) => void;
  onFileSelect?: (file: File | null) => void;
  // Multiple mode callbacks
  onFilesSelect?: (files: File[]) => void;
  onFileUploadSuccess?: (fileId: string, result: any) => void;
  onFileUploadError?: (fileId: string, error: any) => void;
  onAllUploadsComplete?: (results: Record<string, any>) => void;
};

// Type for tracking file details in multiple mode
type FileEntry = {
  id: string;
  file: File;
  status: UploadStatus;
};

/**
 * A unified file upload component that supports both single and multiple file uploads
 * with proper Redux integration
 */
const FileUpload = ({
  id,
  bucket = 'default',
  acceptedFileTypes = 'image/jpeg,image/png,application/pdf',
  maxSizeMB = 5,
  maxFiles = 10,
  mode = 'single',
  uploadingDependsToForm = false,
  // Single mode callbacks
  onUploadSuccess,
  onUploadError,
  onFileSelect,
  // Multiple mode callbacks
  onFilesSelect,
  onFileUploadSuccess,
  onFileUploadError,
  onAllUploadsComplete,
}: FileUploadProps) => {
  // Redux
  const dispatch = useDispatch();
  const uploadReduxState = useSelector((state: IRootState) => state.upload);
  const [uploadFile] = useUploadFileMutation();

  // ========== SINGLE FILE UPLOAD STATE ==========
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [singleUploadStatus, setSingleUploadStatus] = useState<UploadStatus>('idle');
  const [singleUploadProgress, setSingleUploadProgress] = useState(0);
  const [singleErrorMessage, setSingleErrorMessage] = useState('');
  const [singleUploadResult, setSingleUploadResult] = useState<any>(null);
  const singleUploadRef = useRef<AbortController | null>(null);

  // ========== MULTIPLE FILE UPLOAD STATE ==========
  const [files, setFiles] = useState<Record<string, FileEntry>>({});
  const [multiUploadProgress, setMultiUploadProgress] = useState<Record<string, number>>({});
  const [multiUploadErrors, setMultiUploadErrors] = useState<Record<string, string>>({});
  const [multiUploadResults, setMultiUploadResults] = useState<Record<string, any>>({});
  const [overallStatus, setOverallStatus] = useState<UploadStatus>('idle');
  const multiUploadRefs = useRef<Record<string, AbortController | null>>({});
  const activeFileIdRef = useRef<string | null>(null);

  // ========== SYNC WITH REDUX STATE ==========
  useEffect(() => {
    if (mode === 'single' && singleUploadStatus === 'uploading') {
      // Update local state from Redux
      setSingleUploadProgress(uploadReduxState.progress);

      // Update status if needed
      if (uploadReduxState.status !== 'uploading' && singleUploadStatus === 'uploading') {
        setSingleUploadStatus(uploadReduxState.status);
        setSingleErrorMessage(uploadReduxState.errorMessage);
      }
    } else if (mode === 'multiple' && overallStatus === 'uploading' && activeFileIdRef.current) {
      // Update progress for the active file
      const fileId = activeFileIdRef.current;

      setMultiUploadProgress((prev) => ({
        ...prev,
        [fileId]: uploadReduxState.progress,
      }));

      // Update file status if needed
      if (uploadReduxState.status !== 'uploading' && files[fileId]?.status === 'uploading') {
        setFiles((prev) => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: uploadReduxState.status,
          },
        }));

        if (uploadReduxState.status === 'failed') {
          setMultiUploadErrors((prev) => ({
            ...prev,
            [fileId]: uploadReduxState.errorMessage,
          }));
        }
      }
    }
  }, [uploadReduxState, mode, singleUploadStatus, overallStatus, files]);

  // ========== SINGLE FILE UPLOAD HANDLERS ==========
  const handleSingleFileSelect = (file: File | null) => {
    setSelectedFile(file);

    if (file) {
      setSingleUploadStatus('selected');
      setSingleErrorMessage('');
    } else {
      resetSingleUploadState();
    }

    // Call external handler if provided
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleSingleFileReject = (reason: string) => {
    setSelectedFile(null);
    setSingleUploadStatus('failed');
    setSingleErrorMessage(reason);
  };

  const handleSingleUploadStart = async () => {
    if (!selectedFile) return null;

    // Reset Redux state
    dispatch(resetUploadState());
    dispatch(setUploadStatus('uploading'));

    // Update local state
    setSingleUploadStatus('uploading');
    setSingleUploadProgress(0);
    setSingleErrorMessage('');

    try {
      // Create abort controller
      const controller = new AbortController();
      singleUploadRef.current = controller;

      // Upload the file using RTK Query
      const result = await uploadFile({
        bucket,
        files: [selectedFile],
      }).unwrap();

      // Update local state
      setSingleUploadProgress(100);
      setSingleUploadStatus('completed');
      setSingleUploadResult(result);

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      return result;
    } catch (error: any) {
      // Check if this was canceled
      const errorMessage =
        error.status === 'aborted'
          ? 'Upload cancelled'
          : error.data || error.message || 'Upload failed';

      setSingleUploadStatus('failed');
      setSingleErrorMessage(errorMessage);

      // Call error callback if provided
      if (onUploadError) {
        onUploadError(error);
      }

      return null;
    } finally {
      // Clear the promise reference
      singleUploadRef.current = null;
    }
  };

  const handleSingleUploadCancel = () => {
    if (singleUploadRef.current) {
      singleUploadRef.current.abort();
      singleUploadRef.current = null;
      setSingleUploadStatus('failed');
      setSingleErrorMessage('Upload cancelled');

      // Update Redux state
      dispatch(setUploadStatus('failed'));
      dispatch(setUploadError('Upload cancelled'));
    }
  };

  const handleSingleRemoveFile = () => {
    resetSingleUploadState();
  };

  const resetSingleUploadState = () => {
    if (singleUploadStatus === 'uploading') {
      handleSingleUploadCancel();
    }

    setSelectedFile(null);
    setSingleUploadStatus('idle');
    setSingleUploadProgress(0);
    setSingleErrorMessage('');
    setSingleUploadResult(null);

    // Reset Redux state
    dispatch(resetUploadState());
  };

  // ========== MULTIPLE FILE UPLOAD HANDLERS ==========
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

  const handleMultiFileReject = (reason: string) => {
    console.warn('File rejected:', reason);
  };

  const handleMultiUploadStart = async () => {
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
    const initialProgress = { ...multiUploadProgress };
    filesToUpload.forEach(([fileId]) => {
      initialProgress[fileId] = 0;
    });
    setMultiUploadProgress(initialProgress);

    // Update file statuses to 'uploading'
    const updatedFiles = { ...files };
    filesToUpload.forEach(([fileId]) => {
      updatedFiles[fileId].status = 'uploading';
    });
    setFiles(updatedFiles);

    // Create a results object to collect all upload results
    const results: Record<string, any> = { ...multiUploadResults };
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
        multiUploadRefs.current[fileId] = controller;

        // Upload the file
        const result = await uploadFile({
          bucket,
          files: [fileInfo.file],
        }).unwrap();

        // Update state on success
        setMultiUploadProgress((prev) => ({
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
        setMultiUploadResults((prev) => ({
          ...prev,
          [fileId]: result,
        }));
        uploadedFileIds.push(fileId);

        // Call success callback if provided
        if (onFileUploadSuccess) {
          onFileUploadSuccess(fileId, result);
        }
      } catch (error: any) {
        // Check if this was canceled
        const errorMessage =
          error.status === 'aborted'
            ? 'Upload cancelled'
            : error.data || error.message || 'Upload failed';

        setMultiUploadErrors((prev) => ({
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
        if (onFileUploadError) {
          onFileUploadError(fileId, error);
        }
      } finally {
        // Clear the controller reference
        multiUploadRefs.current[fileId] = null;
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

  const handleMultiUploadCancel = (fileId: string) => {
    const controller = multiUploadRefs.current[fileId];
    if (controller) {
      controller.abort();
      multiUploadRefs.current[fileId] = null;

      // Update file status
      setFiles((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'failed',
        },
      }));

      setMultiUploadErrors((prev) => ({
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

  const handleMultiRemoveFile = (fileId: string) => {
    // Cancel upload if in progress
    if (files[fileId]?.status === 'uploading' && multiUploadRefs.current[fileId]) {
      handleMultiUploadCancel(fileId);
    }

    // Remove file from state
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    // Remove progress and error data
    setMultiUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    setMultiUploadErrors((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    setMultiUploadResults((prev) => {
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
    setMultiUploadErrors((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    // Reset progress
    setMultiUploadProgress((prev) => ({
      ...prev,
      [fileId]: 0,
    }));

    // If we're not uploading anything else, set overall status to 'selected'
    const anyUploading = Object.values(files).some((fileInfo) => fileInfo.status === 'uploading');
    if (!anyUploading) {
      setOverallStatus('selected');
    }
  };

  // Render the appropriate component based on mode
  return (
    <div data-upload-id={id}>
      {mode === 'single' ? (
        <SingleFileUpload
          acceptedFileTypes={acceptedFileTypes}
          maxSizeMB={maxSizeMB}
          uploadingDependsToForm={uploadingDependsToForm}
          onFileSelect={handleSingleFileSelect}
          onFileReject={handleSingleFileReject}
          uploadStatus={singleUploadStatus}
          uploadProgress={singleUploadProgress}
          errorMessage={singleErrorMessage}
          onUploadStart={handleSingleUploadStart}
          onUploadCancel={handleSingleUploadCancel}
          onRemoveFile={handleSingleRemoveFile}
        />
      ) : (
        <MultiFileUpload
          id={id}
          acceptedFileTypes={acceptedFileTypes}
          maxSizeMB={maxSizeMB}
          maxFiles={maxFiles}
          uploadingDependsToForm={uploadingDependsToForm}
          onFilesSelect={handleFilesSelect}
          onFileReject={handleMultiFileReject}
          uploadStatus={overallStatus}
          uploadProgress={multiUploadProgress}
          uploadError={multiUploadErrors}
          onUploadStart={handleMultiUploadStart}
          onUploadCancel={handleMultiUploadCancel}
          onRemoveFile={handleMultiRemoveFile}
          onRetryFile={handleRetryFile}
        />
      )}
    </div>
  );
};

export default FileUpload;
