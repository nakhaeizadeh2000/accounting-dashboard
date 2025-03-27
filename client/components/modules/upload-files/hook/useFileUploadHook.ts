import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useUploadFileMutation } from '@/store/features/files/files.api';
import { IRootState } from '@/store';
import {
  setUploadProgress,
  setUploadStatus,
  setUploadError,
  resetUploadState,
  UploadStatus,
} from '@/store/features/files/progress-slice';

type SingleUploadState = {
  file: File | null;
  status: UploadStatus;
  progress: number;
  error: string;
  result: any | null;
};

type MultiUploadState = {
  files: Record<
    string,
    {
      file: File;
      status: UploadStatus;
    }
  >;
  progress: Record<string, number>;
  errors: Record<string, string>;
  results: Record<string, any>;
  overallStatus: UploadStatus;
};

type SingleUploadOptions = {
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  resetAfterUpload?: boolean;
};

type MultiUploadOptions = {
  onFileSuccess?: (fileId: string, result: any) => void;
  onFileError?: (fileId: string, error: any) => void;
  onAllComplete?: (results: Record<string, any>) => void;
  resetAfterUpload?: boolean;
};

/**
 * Custom hook for managing single file uploads with Redux integration
 * @param bucket The bucket to upload files to
 */
export function useSingleFileUpload(bucket = 'default') {
  // Redux
  const dispatch = useDispatch();
  const uploadReduxState = useSelector((state: IRootState) => state.upload);

  // RTK Query hook for uploading
  const [uploadFileMutation] = useUploadFileMutation();

  // Single file state
  const [state, setState] = useState<SingleUploadState>({
    file: null,
    status: 'idle',
    progress: 0,
    error: '',
    result: null,
  });

  const uploadPromiseRef = useRef<AbortController | null>(null);

  // Sync with Redux state
  useEffect(() => {
    if (state.status === 'uploading') {
      setState((prev) => ({
        ...prev,
        progress: uploadReduxState.progress,
        status: uploadReduxState.status,
        error: uploadReduxState.errorMessage,
      }));
    }
  }, [uploadReduxState, state.status]);

  // Select a file for upload
  const selectFile = (file: File | null) => {
    setState((prev) => ({
      ...prev,
      file,
      status: file ? 'selected' : 'idle',
      progress: 0,
      error: '',
    }));
  };

  // Handle file rejection
  const rejectFile = (reason: string) => {
    setState({
      file: null,
      status: 'failed',
      progress: 0,
      error: reason,
      result: null,
    });
  };

  // Start the upload process
  const startUpload = async (options: SingleUploadOptions = {}) => {
    const { onSuccess, onError, resetAfterUpload = false } = options;

    if (!state.file) return null;

    // Reset the Redux state
    dispatch(resetUploadState());
    dispatch(setUploadStatus('uploading'));

    // Update local state
    setState((prev) => ({
      ...prev,
      status: 'uploading',
      progress: 0,
      error: '',
    }));

    try {
      // Create abort controller
      const controller = new AbortController();
      uploadPromiseRef.current = controller;

      // Call the RTK Query mutation
      const result = await uploadFileMutation({
        bucket,
        files: [state.file],
      }).unwrap();

      // Update local state with result
      setState((prev) => ({
        ...prev,
        result,
        status: 'completed',
      }));

      // Update Redux state
      dispatch(setUploadStatus('completed'));
      dispatch(setUploadProgress(100));

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

      // Reset after upload if requested
      if (resetAfterUpload) {
        setTimeout(() => {
          resetUpload();
        }, 2000);
      }

      return result;
    } catch (error: any) {
      const errorMessage =
        error.status === 'aborted'
          ? 'Upload cancelled'
          : error.data || error.message || 'Upload failed';

      // Update local state
      setState((prev) => ({
        ...prev,
        status: 'failed',
        error: errorMessage,
      }));

      // Update Redux state
      dispatch(setUploadStatus('failed'));
      dispatch(setUploadError(errorMessage));

      // Call error callback if provided
      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      uploadPromiseRef.current = null;
    }
  };

  // Cancel an in-progress upload
  const cancelUpload = () => {
    if (uploadPromiseRef.current) {
      uploadPromiseRef.current.abort();
      uploadPromiseRef.current = null;

      // Update local state
      setState((prev) => ({
        ...prev,
        status: 'failed',
        error: 'Upload cancelled',
      }));

      // Update Redux state
      dispatch(setUploadStatus('failed'));
      dispatch(setUploadError('Upload cancelled'));
    }
  };

  // Reset the upload state
  const resetUpload = () => {
    if (state.status === 'uploading') {
      cancelUpload();
    }

    setState({
      file: null,
      status: 'idle',
      progress: 0,
      error: '',
      result: null,
    });

    // Reset Redux state
    dispatch(resetUploadState());
  };

  // Return state and handlers
  return {
    ...state,
    selectFile,
    rejectFile,
    startUpload,
    cancelUpload,
    resetUpload,
    // Props object for easy integration with the SingleFileUpload component
    uploadProps: {
      onFileSelect: selectFile,
      onFileReject: rejectFile,
      uploadStatus: state.status,
      uploadProgress: state.progress,
      errorMessage: state.error,
      onUploadStart: async () => await startUpload(),
      onUploadCancel: cancelUpload,
      onRemoveFile: resetUpload,
    },
  };
}

/**
 * Custom hook for managing multiple file uploads with Redux integration
 * @param bucket The bucket to upload files to
 */
export function useMultiFileUpload(bucket = 'default') {
  // Redux
  const dispatch = useDispatch();
  const uploadReduxState = useSelector((state: IRootState) => state.upload);

  // RTK Query hook for uploading
  const [uploadFileMutation] = useUploadFileMutation();

  // Multiple files state
  const [state, setState] = useState<MultiUploadState>({
    files: {},
    progress: {},
    errors: {},
    results: {},
    overallStatus: 'idle',
  });

  const uploadPromiseRefs = useRef<Record<string, AbortController | null>>({});

  // Track which file is currently being uploaded
  const activeFileIdRef = useRef<string | null>(null);

  // Sync with Redux state for the active file
  useEffect(() => {
    const fileId = activeFileIdRef.current;

    if (fileId && state.overallStatus === 'uploading') {
      // Update progress for the active file
      setState((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          [fileId]: uploadReduxState.progress,
        },
      }));

      // Update file status based on Redux status
      if (uploadReduxState.status !== 'uploading' && state.files[fileId]?.status === 'uploading') {
        setState((prev) => ({
          ...prev,
          files: {
            ...prev.files,
            [fileId]: {
              ...prev.files[fileId],
              status: uploadReduxState.status,
            },
          },
          errors: {
            ...prev.errors,
            [fileId]: uploadReduxState.errorMessage,
          },
        }));
      }
    }
  }, [uploadReduxState, state.overallStatus]);

  // Generate a unique file ID
  const generateFileId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Add files for uploading
  const addFiles = (files: File[]) => {
    if (files.length === 0) return [];

    const newFiles: Record<string, { file: File; status: UploadStatus }> = {};
    const newFileIds: string[] = [];

    files.forEach((file) => {
      const fileId = generateFileId();
      newFiles[fileId] = {
        file,
        status: 'selected',
      };
      newFileIds.push(fileId);
    });

    setState((prev) => ({
      ...prev,
      files: { ...prev.files, ...newFiles },
      overallStatus: 'selected',
    }));

    return newFileIds;
  };

  // Handle file rejection
  const rejectFile = (reason: string) => {
    console.warn('File rejected:', reason);
  };

  // Start uploading all selected files
  const startUploadAll = async (options: MultiUploadOptions = {}) => {
    const { onFileSuccess, onFileError, onAllComplete } = options;

    // Only proceed if we have files in 'selected' state
    const filesToUpload = Object.entries(state.files).filter(
      ([_, fileInfo]) => fileInfo.status === 'selected',
    );

    if (filesToUpload.length === 0) return [];

    // Update overall status
    setState((prev) => ({
      ...prev,
      overallStatus: 'uploading',
    }));

    // Initialize progress for files that are about to be uploaded
    const initialProgress: Record<string, number> = {};
    const updatedFiles = { ...state.files };

    filesToUpload.forEach(([fileId]) => {
      initialProgress[fileId] = 0;
      updatedFiles[fileId].status = 'uploading';
    });

    setState((prev) => ({
      ...prev,
      files: updatedFiles,
      progress: { ...prev.progress, ...initialProgress },
    }));

    // Results to collect
    const results: Record<string, any> = {};
    const uploadedFileIds: string[] = [];

    // Upload each file individually in sequence
    for (const [fileId, fileInfo] of filesToUpload) {
      try {
        // Reset Redux state for new upload
        dispatch(resetUploadState());
        dispatch(setUploadStatus('uploading'));

        // Set the active file ID for progress tracking
        activeFileIdRef.current = fileId;

        // Create abort controller
        const controller = new AbortController();
        uploadPromiseRefs.current[fileId] = controller;

        // Upload the file using RTK Query
        const result = await uploadFileMutation({
          bucket,
          files: [fileInfo.file],
        }).unwrap();

        // Store the result
        results[fileId] = result;
        uploadedFileIds.push(fileId);

        // Update the state
        setState((prev) => ({
          ...prev,
          results: {
            ...prev.results,
            [fileId]: result,
          },
          progress: {
            ...prev.progress,
            [fileId]: 100,
          },
          files: {
            ...prev.files,
            [fileId]: {
              ...prev.files[fileId],
              status: 'completed',
            },
          },
        }));

        // Call success callback if provided
        if (onFileSuccess) {
          onFileSuccess(fileId, result);
        }
      } catch (error: any) {
        const errorMessage =
          error.status === 'aborted'
            ? 'Upload cancelled'
            : error.data || error.message || 'Upload failed';

        // Update the state
        setState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [fileId]: errorMessage,
          },
          files: {
            ...prev.files,
            [fileId]: {
              ...prev.files[fileId],
              status: 'failed',
            },
          },
        }));

        // Call error callback if provided
        if (onFileError) {
          onFileError(fileId, error);
        }
      } finally {
        uploadPromiseRefs.current[fileId] = null;
      }
    }

    // Update overall status
    const allDone = Object.values(state.files).every(
      (fileInfo) => fileInfo.status === 'completed' || fileInfo.status === 'failed',
    );

    if (allDone) {
      const anyFailed = Object.values(state.files).some((fileInfo) => fileInfo.status === 'failed');

      setState((prev) => ({
        ...prev,
        overallStatus: anyFailed ? 'failed' : 'completed',
      }));

      // Reset Redux state when all complete
      dispatch(resetUploadState());

      // Call completion callback
      if (onAllComplete) {
        onAllComplete(results);
      }
    }

    // Clear active file ID
    activeFileIdRef.current = null;

    return uploadedFileIds;
  };

  // Upload a specific file
  const uploadSingleFile = async (fileId: string, options: MultiUploadOptions = {}) => {
    const { onFileSuccess, onFileError } = options;

    const fileInfo = state.files[fileId];
    if (!fileInfo || fileInfo.status !== 'selected') return null;

    // Reset Redux state
    dispatch(resetUploadState());
    dispatch(setUploadStatus('uploading'));

    // Set the active file ID for progress tracking
    activeFileIdRef.current = fileId;

    // Update file status
    setState((prev) => ({
      ...prev,
      files: {
        ...prev.files,
        [fileId]: {
          ...prev.files[fileId],
          status: 'uploading',
        },
      },
      progress: {
        ...prev.progress,
        [fileId]: 0,
      },
      overallStatus: 'uploading',
    }));

    try {
      // Create abort controller
      const controller = new AbortController();
      uploadPromiseRefs.current[fileId] = controller;

      // Upload the file using RTK Query
      const result = await uploadFileMutation({
        bucket,
        files: [fileInfo.file],
      }).unwrap();

      // Update the state
      setState((prev) => ({
        ...prev,
        results: {
          ...prev.results,
          [fileId]: result,
        },
        progress: {
          ...prev.progress,
          [fileId]: 100,
        },
        files: {
          ...prev.files,
          [fileId]: {
            ...prev.files[fileId],
            status: 'completed',
          },
        },
      }));

      // Call success callback if provided
      if (onFileSuccess) {
        onFileSuccess(fileId, result);
      }

      return result;
    } catch (error: any) {
      const errorMessage =
        error.status === 'aborted'
          ? 'Upload cancelled'
          : error.data || error.message || 'Upload failed';

      // Update the state
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fileId]: errorMessage,
        },
        files: {
          ...prev.files,
          [fileId]: {
            ...prev.files[fileId],
            status: 'failed',
          },
        },
      }));

      // Call error callback if provided
      if (onFileError) {
        onFileError(fileId, error);
      }

      return null;
    } finally {
      uploadPromiseRefs.current[fileId] = null;
      activeFileIdRef.current = null;

      // Reset Redux state
      dispatch(resetUploadState());
    }
  };

  // Cancel a specific file upload
  const cancelUpload = (fileId: string) => {
    const controller = uploadPromiseRefs.current[fileId];
    if (controller) {
      controller.abort();
      uploadPromiseRefs.current[fileId] = null;

      setState((prev) => ({
        ...prev,
        files: {
          ...prev.files,
          [fileId]: {
            ...prev.files[fileId],
            status: 'failed',
          },
        },
        errors: {
          ...prev.errors,
          [fileId]: 'Upload cancelled',
        },
      }));

      // If this was the active file, reset Redux state
      if (activeFileIdRef.current === fileId) {
        dispatch(setUploadStatus('failed'));
        dispatch(setUploadError('Upload cancelled'));
        activeFileIdRef.current = null;
      }
    }
  };

  // Cancel all in-progress uploads
  const cancelAllUploads = () => {
    Object.entries(uploadPromiseRefs.current).forEach(([fileId, controller]) => {
      if (controller) {
        controller.abort();
        uploadPromiseRefs.current[fileId] = null;
      }
    });

    // Update states for all uploading files
    const updatedFiles = { ...state.files };
    const updatedErrors = { ...state.errors };

    Object.keys(updatedFiles).forEach((fileId) => {
      if (updatedFiles[fileId].status === 'uploading') {
        updatedFiles[fileId].status = 'failed';
        updatedErrors[fileId] = 'Upload cancelled';
      }
    });

    setState((prev) => ({
      ...prev,
      files: updatedFiles,
      errors: updatedErrors,
      overallStatus: 'failed',
    }));

    // Reset Redux state
    dispatch(resetUploadState());

    // Clear active file ID
    activeFileIdRef.current = null;
  };

  // Remove a specific file
  const removeFile = (fileId: string) => {
    // If it's uploading, cancel first
    if (state.files[fileId]?.status === 'uploading') {
      cancelUpload(fileId);
    }

    // Remove from state
    setState((prev) => {
      const updatedFiles = { ...prev.files };
      const updatedProgress = { ...prev.progress };
      const updatedErrors = { ...prev.errors };
      const updatedResults = { ...prev.results };

      delete updatedFiles[fileId];
      delete updatedProgress[fileId];
      delete updatedErrors[fileId];
      delete updatedResults[fileId];

      // Determine new overall status
      let overallStatus: UploadStatus = 'idle';
      if (Object.keys(updatedFiles).length > 0) {
        const anyUploading = Object.values(updatedFiles).some((f) => f.status === 'uploading');
        const anyFailed = Object.values(updatedFiles).some((f) => f.status === 'failed');
        const anySelected = Object.values(updatedFiles).some((f) => f.status === 'selected');

        if (anyUploading) {
          overallStatus = 'uploading';
        } else if (anyFailed) {
          overallStatus = 'failed';
        } else if (anySelected) {
          overallStatus = 'selected';
        } else {
          overallStatus = 'completed';
        }
      }

      return {
        ...prev,
        files: updatedFiles,
        progress: updatedProgress,
        errors: updatedErrors,
        results: updatedResults,
        overallStatus,
      };
    });
  };

  // Reset all uploads
  const resetAllUploads = () => {
    // Cancel any in-progress uploads
    cancelAllUploads();

    // Reset state
    setState({
      files: {},
      progress: {},
      errors: {},
      results: {},
      overallStatus: 'idle',
    });
  };

  // Retry a failed file upload
  const retryFile = (fileId: string) => {
    if (state.files[fileId] && state.files[fileId].status === 'failed') {
      setState((prev) => ({
        ...prev,
        files: {
          ...prev.files,
          [fileId]: {
            ...prev.files[fileId],
            status: 'selected',
          },
        },
        errors: {
          ...prev.errors,
          [fileId]: '',
        },
        progress: {
          ...prev.progress,
          [fileId]: 0,
        },
      }));
    }
  };

  // Return state and handlers
  return {
    files: state.files,
    progress: state.progress,
    errors: state.errors,
    results: state.results,
    overallStatus: state.overallStatus,
    addFiles,
    rejectFile,
    uploadFile: uploadSingleFile,
    startUploadAll,
    cancelUpload,
    cancelAllUploads,
    removeFile,
    resetAllUploads,
    retryFile,
    // Props object for easy integration with the MultiFileUpload component
    uploadProps: {
      uploadStatus: state.overallStatus,
      uploadProgress: state.progress,
      uploadError: state.errors,
      onFilesSelect: (files: File[]) => {
        addFiles(files);
      },
      onFileReject: rejectFile,
      onUploadStart: async () => await startUploadAll(),
      onUploadCancel: cancelUpload,
      onRemoveFile: removeFile,
      onRetryFile: (fileId: string) => {
        retryFile(fileId);
      },
    },
  };
}
