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

  // Helper function to update overall status based on all files
  const updateOverallStatus = () => {
    if (Object.keys(files).length === 0) {
      setOverallStatus('idle');

      // Update Redux state to match
      dispatch(setUploadStatus('idle' as UploadStatus));
      return;
    }

    const hasUploading = Object.values(files).some((file) => file.status === 'uploading');
    const hasSelected = Object.values(files).some((file) => file.status === 'selected');
    const hasFailed = Object.values(files).some((file) => file.status === 'failed');
    const hasCompleted = Object.values(files).some((file) => file.status === 'completed');

    let newStatus: UploadStatus = 'idle';

    if (hasUploading) {
      newStatus = 'uploading';
    } else if (hasSelected) {
      newStatus = 'selected';
    } else if (hasFailed) {
      // If we have both completed and failed files, prioritize the failed status
      newStatus = 'failed';
    } else if (hasCompleted) {
      newStatus = 'completed';
    }

    if (newStatus !== overallStatus) {
      setOverallStatus(newStatus);

      // Update Redux state to match the new overall status
      dispatch(setUploadStatus(newStatus));
    }
  };

  // ========== SYNC WITH REDUX STATE FOR SINGLE UPLOAD ==========
  useEffect(() => {
    if (mode !== 'single' || singleUploadStatus !== 'uploading') return;

    // Update progress from Redux state
    setSingleUploadProgress(uploadReduxState.progress);

    // Update status if needed
    if (uploadReduxState.status !== 'uploading' && singleUploadStatus === 'uploading') {
      setSingleUploadStatus(uploadReduxState.status);
      setSingleErrorMessage(uploadReduxState.errorMessage);
    }
  }, [uploadReduxState, mode, singleUploadStatus]);

  // ========== SYNC WITH REDUX STATE FOR MULTI UPLOAD ==========
  useEffect(() => {
    // Only proceed if we're in multiple mode
    if (mode !== 'multiple') return;

    // Check if all uploads are complete and update status
    const areAllFilesComplete = () => {
      // If no files, consider it complete
      if (Object.keys(files).length === 0) return true;

      // Check if any file is still uploading
      const anyUploading = Object.values(files).some((file) => file.status === 'uploading');

      // If none are uploading, all are complete (or failed)
      return !anyUploading;
    };

    // If we're currently in uploading state but all files are done, update the status
    if (overallStatus === 'uploading' && areAllFilesComplete()) {
      updateOverallStatus();
    }

    // If we don't have an active file or no files at all, just return
    if (!activeFileIdRef.current || Object.keys(files).length === 0) {
      // But if we have files and overall status is 'uploading' and uploadReduxState.progress > 0
      if (
        Object.keys(files).length > 0 &&
        overallStatus === 'uploading' &&
        uploadReduxState.progress > 0
      ) {
        // Find files that are in uploading state
        const uploadingFiles = Object.entries(files).filter(
          ([_, file]) => file.status === 'uploading',
        );
        if (uploadingFiles.length > 0) {
          // Just update the first one we find
          const [fileIdToUpdate] = uploadingFiles[0];

          setMultiUploadProgress((prev) => ({
            ...prev,
            [fileIdToUpdate]: uploadReduxState.progress,
          }));
        }
      }
      return;
    }

    const fileId = activeFileIdRef.current;

    // Only update if the file exists in our state
    if (!files[fileId]) {
      return;
    }

    // Update progress for the active file regardless of uploadReduxState.status
    // This ensures progress updates even if the status remains 'idle'
    if (uploadReduxState.progress > 0) {
      console.log('Updating progress for active file:', fileId, uploadReduxState.progress);
      setMultiUploadProgress((prev) => {
        const newProgress = {
          ...prev,
          [fileId]: uploadReduxState.progress,
        };
        return newProgress;
      });
    }

    // Update file status if Redux status indicates completion or failure
    if (uploadReduxState.status === 'completed' || uploadReduxState.status === 'failed') {
      // Update the specific file status
      setFiles((prev) => {
        const updated = {
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: uploadReduxState.status as UploadStatus,
          },
        };
        return updated;
      });

      // Update the file-specific error if needed
      if (uploadReduxState.status === 'failed') {
        setMultiUploadErrors((prev) => {
          const updated = {
            ...prev,
            [fileId]: uploadReduxState.errorMessage,
          };
          return updated;
        });
      }

      // Clear active file ref since this file is done
      activeFileIdRef.current = null;

      // Check if this was the last file being uploaded
      const anyStillUploading = Object.values(files)
        .filter((f) => f.id !== fileId) // Exclude the current file
        .some((f) => f.status === 'uploading');

      if (!anyStillUploading) {
        updateOverallStatus();
      }
    }
  }, [uploadReduxState, mode, files, overallStatus]);

  // ========== SINGLE FILE UPLOAD HANDLERS ==========
  const handleSingleFileSelect = (file: File | null) => {
    setSelectedFile(file);

    if (file) {
      setSingleUploadStatus('selected');
      setSingleErrorMessage('');

      // Update Redux state to match
      dispatch(setUploadStatus('selected' as UploadStatus));
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

    // Update Redux state to match
    dispatch(setUploadStatus('failed' as UploadStatus));
    dispatch(setUploadError(reason));
  };

  const handleSingleUploadStart = async () => {
    if (!selectedFile) return null;

    // Reset Redux state
    dispatch(resetUploadState());
    dispatch(setUploadStatus('uploading' as UploadStatus));

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

      // Update Redux state to match
      dispatch(setUploadStatus('completed' as UploadStatus));
      dispatch(setUploadProgress(100));

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

      // Update Redux state to match
      dispatch(setUploadStatus('failed' as UploadStatus));
      dispatch(setUploadError(errorMessage));

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
      dispatch(setUploadStatus('failed' as UploadStatus));
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
    dispatch(setUploadStatus('idle' as UploadStatus));
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
    const fileList: File[] = [];

    selectedFiles.forEach((file) => {
      const fileId = generateFileId();
      newFiles[fileId] = {
        id: fileId,
        file,
        status: 'selected' as UploadStatus,
      };
      fileList.push(file);
    });

    // Update files state
    setFiles((prev) => {
      const updated = { ...prev, ...newFiles };
      return updated;
    });

    // Set the overall status to 'selected'
    setOverallStatus('selected');

    // Update Redux state to match
    dispatch(resetUploadState());
    dispatch(setUploadStatus('selected' as UploadStatus));

    // Call external handler if provided
    if (onFilesSelect) {
      onFilesSelect(fileList);
    }
  };

  const handleMultiFileReject = (reason: string) => {
    // Update Redux state to reflect the error
    dispatch(setUploadStatus('failed' as UploadStatus));
    dispatch(setUploadError(reason));
  };

  const handleMultiUploadStart = async () => {
    // Only proceed if we have files in 'selected' state
    const filesToUpload = Object.entries(files).filter(
      ([_, fileInfo]) => fileInfo.status === 'selected',
    );

    if (filesToUpload.length === 0) {
      console.log('No files to upload');
      return [];
    }

    // Update overall status immediately
    setOverallStatus('uploading');

    // Reset progress for files that are about to be uploaded
    const initialProgress = { ...multiUploadProgress };
    filesToUpload.forEach(([fileId]) => {
      initialProgress[fileId] = 0;
    });
    setMultiUploadProgress(initialProgress);

    // Update file statuses to 'uploading'
    setFiles((prev) => {
      const updated = { ...prev };
      filesToUpload.forEach(([fileId]) => {
        updated[fileId] = {
          ...updated[fileId],
          status: 'uploading' as UploadStatus,
        };
      });
      return updated;
    });

    // Create a results object to collect all upload results
    const results: Record<string, any> = { ...multiUploadResults };
    const uploadedFileIds: string[] = [];

    // We'll use this to track when all uploads are complete
    let completedCount = 0;
    const totalFiles = filesToUpload.length;

    // Create promises for all uploads
    const uploadPromises = filesToUpload.map(async ([fileId, fileInfo]) => {
      // Important: Set Redux state for this file upload to match our UploadStatus type
      dispatch(resetUploadState());
      dispatch(setUploadStatus('uploading' as UploadStatus));

      // Set this as the active file for Redux tracking
      activeFileIdRef.current = fileId;
      console.log(`Starting upload for file ${fileId}, set as active`);

      try {
        // Create a controller for abort
        const controller = new AbortController();
        multiUploadRefs.current[fileId] = controller;

        // Start the upload process
        const result = await uploadFile({
          bucket,
          files: [fileInfo.file],
        }).unwrap();

        // Update Redux state to completed (ensuring we use the correct UploadStatus value)
        dispatch(setUploadStatus('completed' as UploadStatus));
        dispatch(setUploadProgress(100));

        // Update file status to completed
        setFiles((prev) => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: 'completed' as UploadStatus,
          },
        }));

        // Set final progress for this file
        setMultiUploadProgress((prev) => ({
          ...prev,
          [fileId]: 100,
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

        return { fileId, success: true, result };
      } catch (error: any) {
        // Check if this was canceled
        const errorMessage =
          error.status === 'aborted'
            ? 'Upload cancelled'
            : error.data || error.message || 'Upload failed';

        // Update Redux state to failed (ensuring we use the correct UploadStatus value)
        dispatch(setUploadStatus('failed' as UploadStatus));
        dispatch(setUploadError(errorMessage));

        setMultiUploadErrors((prev) => ({
          ...prev,
          [fileId]: errorMessage,
        }));

        // Update file status to failed
        setFiles((prev) => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: 'failed' as UploadStatus,
          },
        }));

        // Call error callback if provided
        if (onFileUploadError) {
          onFileUploadError(fileId, error);
        }

        return { fileId, success: false, error };
      } finally {
        // Clear the controller reference
        multiUploadRefs.current[fileId] = null;

        // Increment completed count
        completedCount++;

        // Allow next file to become active by clearing this one
        // Only if this is the current active file
        if (activeFileIdRef.current === fileId) {
          activeFileIdRef.current = null;
        }

        // Check if this was the last file to complete
        if (completedCount === totalFiles) {
          // Update overall status to reflect the final state of all files
          setTimeout(() => {
            updateOverallStatus();
          }, 10);
        }
      }
    });

    try {
      // Wait for all uploads to complete (whether success or failure)
      await Promise.all(uploadPromises);
    } finally {
      // Reset Redux state when all uploads are done - set it to appropriate status
      dispatch(resetUploadState());

      // Clear active file (should already be null, but just to be safe)
      activeFileIdRef.current = null;

      // Update overall status based on current state of all files

      // Determine final status
      const anyFailed = Object.values(files).some((file) => file.status === 'failed');
      const allCompleted = Object.values(files).every(
        (file) => file.status === 'completed' || file.status === 'failed',
      );

      if (allCompleted) {
        if (anyFailed) {
          dispatch(setUploadStatus('failed' as UploadStatus));
          setOverallStatus('failed');
        } else {
          dispatch(setUploadStatus('completed' as UploadStatus));
          setOverallStatus('completed');
        }
      } else {
        // This is a fallback; we shouldn't reach here if uploads were processed correctly
        updateOverallStatus();
      }

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
          status: 'failed' as UploadStatus,
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

      // Update overall status
      updateOverallStatus();
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

    // We need to update this after the state has been updated
    // Using setTimeout ensures this runs after the state updates
    setTimeout(() => {
      updateOverallStatus();

      // Update Redux state based on remaining files
      if (Object.keys(files).length <= 1) {
        // We're removing the last file
        dispatch(setUploadStatus('idle' as UploadStatus));
      } else {
        // Determine the status based on remaining files
        const remainingFiles = Object.values(files).filter((f) => f.id !== fileId);

        if (remainingFiles.some((f) => f.status === 'uploading')) {
          dispatch(setUploadStatus('uploading' as UploadStatus));
        } else if (remainingFiles.some((f) => f.status === 'failed')) {
          dispatch(setUploadStatus('failed' as UploadStatus));
        } else if (remainingFiles.some((f) => f.status === 'selected')) {
          dispatch(setUploadStatus('selected' as UploadStatus));
        } else if (remainingFiles.some((f) => f.status === 'completed')) {
          dispatch(setUploadStatus('completed' as UploadStatus));
        } else {
          dispatch(setUploadStatus('idle' as UploadStatus));
        }
      }
    }, 0);
  };

  const handleRetryFile = (fileId: string) => {
    if (!files[fileId]) return;

    // Reset file status to 'selected'
    setFiles((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        status: 'selected' as UploadStatus,
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

    // Update the overall status based on the new state
    // Using setTimeout ensures this happens after state updates
    setTimeout(() => {
      updateOverallStatus();

      // Update Redux state to 'selected' since we now have a file ready to upload
      dispatch(setUploadStatus('selected' as UploadStatus));
    }, 0);
  };

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
        <>
          <MultiFileUpload
            key={`multi-upload-${id}`} // Force re-render on changes
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
        </>
      )}
    </div>
  );
};

export default FileUpload;
