import React, { useState, useEffect, useRef } from 'react';
import { useUploadFileMutation } from '@/store/features/files/files.api';
import {
  resetUploadState,
  setUploadProgress,
  setUploadStatus,
  setUploadError,
  UploadStatus,
} from '@/store/features/files/progress-slice';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import SingleFileUpload from './SingleFileUpload';
import MultiFileUpload from './MultiFileUpload';
import { generateFileId } from '../utils/file-upload.utils';

type FileUploadWrapperProps = {
  id: string;
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  maxFiles?: number;
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

/**
 * FileUpload Component
 *
 * A unified component that wraps SingleFileUpload and MultiFileUpload
 * with Redux integration for progress tracking
 */
const FileUpload: React.FC<FileUploadWrapperProps> = ({
  id,
  bucket = 'default',
  acceptedFileTypes,
  maxSizeMB = 10,
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
}) => {
  // Redux state and actions
  const dispatch = useDispatch();
  const uploadState = useSelector((state: IRootState) => state.upload);
  const [uploadFile] = useUploadFileMutation();

  // Local state for single file upload
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleUploadStatus, setSingleUploadStatus] = useState<UploadStatus>('idle');
  const [singleUploadProgress, setSingleUploadProgress] = useState(0);
  const [singleUploadError, setSingleUploadError] = useState('');

  // Local state for multi file upload
  const [multiFiles, setMultiFiles] = useState<Record<string, File>>({});
  const [multiUploadStatus, setMultiUploadStatus] = useState<UploadStatus>('idle');
  const [multiUploadProgress, setMultiUploadProgress] = useState<Record<string, number>>({});
  const [multiUploadErrors, setMultiUploadErrors] = useState<Record<string, string>>({});
  const [multiUploadResults, setMultiUploadResults] = useState<Record<string, any>>({});

  // Track active file ID for Redux updates
  const activeFileIdRef = useRef<string | null>(null);

  // Track uploads with AbortControllers
  const uploadControllerRef = useRef<AbortController | null>(null);
  const multiUploadControllersRef = useRef<Record<string, AbortController | null>>({});

  // Sync Redux state with local state for single file upload
  useEffect(() => {
    if (mode === 'single' && singleUploadStatus === 'uploading') {
      // Update progress
      setSingleUploadProgress(uploadState.progress);

      // Update status if changed
      if (uploadState.status !== 'uploading') {
        setSingleUploadStatus(uploadState.status);
        setSingleUploadError(uploadState.errorMessage);
      }
    }
  }, [uploadState, mode, singleUploadStatus]);

  // Sync Redux state with local state for multi file upload
  useEffect(() => {
    if (mode === 'multiple' && multiUploadStatus === 'uploading' && activeFileIdRef.current) {
      const fileId = activeFileIdRef.current;

      // Update progress for active file
      setMultiUploadProgress((prev) => ({
        ...prev,
        [fileId]: uploadState.progress,
      }));

      // Update file status if upload status changed in Redux
      if (uploadState.status !== 'uploading') {
        if (uploadState.status === 'failed') {
          setMultiUploadErrors((prev) => ({
            ...prev,
            [fileId]: uploadState.errorMessage,
          }));
        }

        // Clear active file ref once it's completed/failed
        activeFileIdRef.current = null;
      }
    }
  }, [uploadState, mode, multiUploadStatus]);

  // ========== SINGLE FILE HANDLERS ==========

  const handleSingleFileSelect = (file: File | null) => {
    setSingleFile(file);

    if (file) {
      setSingleUploadStatus('selected');
      setSingleUploadError('');
    } else {
      setSingleUploadStatus('idle');
      setSingleUploadProgress(0);
      setSingleUploadError('');
    }

    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleSingleUploadStart = async () => {
    if (!singleFile) return null;

    // Reset Redux state
    dispatch(resetUploadState());
    dispatch(setUploadStatus('uploading'));

    // Update local state
    setSingleUploadStatus('uploading');
    setSingleUploadProgress(0);
    setSingleUploadError('');

    try {
      // Create abort controller
      const controller = new AbortController();
      uploadControllerRef.current = controller;

      // Upload the file
      const result = await uploadFile({
        bucket,
        files: [singleFile],
      }).unwrap();

      // Update local state
      setSingleUploadProgress(100);
      setSingleUploadStatus('completed');

      // Update Redux state
      dispatch(setUploadStatus('completed'));
      dispatch(setUploadProgress(100));

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }

      return result;
    } catch (error: any) {
      // Get error message
      const errorMessage =
        error.status === 'aborted'
          ? 'Upload cancelled'
          : error.data || error.message || 'Upload failed';

      // Update local state
      setSingleUploadStatus('failed');
      setSingleUploadError(errorMessage);

      // Update Redux state
      dispatch(setUploadStatus('failed'));
      dispatch(setUploadError(errorMessage));

      // Call error callback
      if (onUploadError) {
        onUploadError(error);
      }

      return null;
    } finally {
      uploadControllerRef.current = null;
    }
  };

  const handleSingleUploadCancel = () => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
      uploadControllerRef.current = null;

      // Update states
      setSingleUploadStatus('failed');
      setSingleUploadError('Upload cancelled');
      dispatch(setUploadStatus('failed'));
      dispatch(setUploadError('Upload cancelled'));
    }
  };

  // ========== MULTI FILE HANDLERS ==========

  const handleMultiFilesSelect = (files: File[]) => {
    if (files.length === 0) return;

    // Convert to record with unique IDs
    const newFiles: Record<string, File> = {};
    files.forEach((file) => {
      const fileId = generateFileId();
      newFiles[fileId] = file;
    });

    // Update state
    setMultiFiles((prev) => ({
      ...prev,
      ...newFiles,
    }));

    setMultiUploadStatus('selected');

    // Call callback
    if (onFilesSelect) {
      onFilesSelect(files);
    }
  };

  const handleMultiUploadStart = async () => {
    // Only proceed if we have files
    if (Object.keys(multiFiles).length === 0) return [];

    // Reset Redux state
    dispatch(resetUploadState());

    // Update local state
    setMultiUploadStatus('uploading');

    // Reset progress for all files
    const initialProgress: Record<string, number> = {};
    Object.keys(multiFiles).forEach((fileId) => {
      initialProgress[fileId] = 0;
    });
    setMultiUploadProgress(initialProgress);

    // Store results
    const results: Record<string, any> = {};
    const uploadedFileIds: string[] = [];

    // Upload each file in sequence
    for (const fileId of Object.keys(multiFiles)) {
      // Reset Redux state for new upload
      dispatch(resetUploadState());
      dispatch(setUploadStatus('uploading'));

      // Set current file as active
      activeFileIdRef.current = fileId;

      try {
        // Create abort controller
        const controller = new AbortController();
        multiUploadControllersRef.current[fileId] = controller;

        // Upload the file
        const result = await uploadFile({
          bucket,
          files: [multiFiles[fileId]],
        }).unwrap();

        // Store result
        results[fileId] = result;
        uploadedFileIds.push(fileId);

        // Update progress
        setMultiUploadProgress((prev) => ({
          ...prev,
          [fileId]: 100,
        }));

        // Call success callback
        if (onFileUploadSuccess) {
          onFileUploadSuccess(fileId, result);
        }
      } catch (error: any) {
        // Get error message
        const errorMessage =
          error.status === 'aborted'
            ? 'Upload cancelled'
            : error.data || error.message || 'Upload failed';

        // Store error
        setMultiUploadErrors((prev) => ({
          ...prev,
          [fileId]: errorMessage,
        }));

        // Call error callback
        if (onFileUploadError) {
          onFileUploadError(fileId, error);
        }
      } finally {
        // Clear controller
        multiUploadControllersRef.current[fileId] = null;
      }
    }

    // Clear active file ID
    activeFileIdRef.current = null;

    // Reset Redux state
    dispatch(resetUploadState());

    // Update overall status
    setMultiUploadStatus(Object.keys(multiUploadErrors).length > 0 ? 'failed' : 'completed');

    // Call completion callback
    if (onAllUploadsComplete && Object.keys(results).length > 0) {
      onAllUploadsComplete(results);
    }

    return results;
  };

  const handleMultiUploadCancel = (fileId: string) => {
    const controller = multiUploadControllersRef.current[fileId];
    if (controller) {
      controller.abort();
      multiUploadControllersRef.current[fileId] = null;

      // Update error state
      setMultiUploadErrors((prev) => ({
        ...prev,
        [fileId]: 'Upload cancelled',
      }));

      // Update Redux state if this was the active file
      if (activeFileIdRef.current === fileId) {
        dispatch(setUploadStatus('failed'));
        dispatch(setUploadError('Upload cancelled'));
        activeFileIdRef.current = null;
      }
    }
  };

  const handleMultiRemoveFile = (fileId: string) => {
    // Cancel upload if in progress
    if (multiUploadControllersRef.current[fileId]) {
      handleMultiUploadCancel(fileId);
    }

    // Remove from states
    setMultiFiles((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

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

    // Call callback
    if (onFilesSelect) {
      const updatedFiles = Object.values(multiFiles).filter(
        (_, index) => Object.keys(multiFiles)[index] !== fileId,
      );
      onFilesSelect(updatedFiles);
    }
  };

  const handleMultiRetryFile = (fileId: string) => {
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
  };

  // Render appropriate component based on mode
  return (
    <div data-upload-id={id}>
      {mode === 'single' ? (
        <SingleFileUpload
          acceptedFileTypes={acceptedFileTypes}
          maxSizeMB={maxSizeMB}
          uploadingDependsToForm={uploadingDependsToForm}
          onFileSelect={handleSingleFileSelect}
          onFileReject={onUploadError}
          onUploadStart={handleSingleUploadStart}
          onUploadCancel={handleSingleUploadCancel}
          onRemoveFile={() => handleSingleFileSelect(null)}
          status={singleUploadStatus}
          progress={singleUploadProgress}
          errorMessage={singleUploadError}
        />
      ) : (
        <MultiFileUpload
          acceptedFileTypes={acceptedFileTypes}
          maxSizeMB={maxSizeMB}
          maxFiles={maxFiles}
          uploadingDependsToForm={uploadingDependsToForm}
          onFilesSelect={handleMultiFilesSelect}
          onFileReject={(error) => onFileUploadError && onFileUploadError('', error)}
          onUploadStart={handleMultiUploadStart}
          onUploadCancel={handleMultiUploadCancel}
          onRemoveFile={handleMultiRemoveFile}
          onRetryFile={handleMultiRetryFile}
          overallStatus={multiUploadStatus}
          fileProgress={multiUploadProgress}
          fileErrors={multiUploadErrors}
        />
      )}
    </div>
  );
};

export default FileUpload;
