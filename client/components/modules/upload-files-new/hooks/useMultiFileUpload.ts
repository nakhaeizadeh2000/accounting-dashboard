import { useState, useRef, useCallback, useEffect } from 'react';
import { FileItem, FileUploadStatus } from '../types/file-upload.types';
import { formatFileSize, validateFile, generateFileId } from '../utils/file-upload.utils';

type UseMultiFileUploadOptions = {
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  onUpload?: (file: File, fileId: string) => Promise<any>;
  onChange?: (files: File[]) => void;
  onError?: (error: string, fileId?: string) => void;
  onComplete?: (results: Record<string, any>) => void;
};

type UseMultiFileUploadResult = {
  files: Record<string, FileItem>;
  fileCount: number;
  hasSelectedFiles: boolean;
  hasUploadingFiles: boolean;
  overallStatus: FileUploadStatus;

  addFiles: (newFiles: FileList) => string[];
  removeFile: (fileId: string) => void;
  retryFile: (fileId: string) => void;
  startUpload: (fileId: string) => Promise<any | null>;
  startAllUploads: () => Promise<Record<string, any>>;
  cancelUpload: (fileId: string) => void;
  cancelAllUploads: () => void;
  clearFiles: () => void;
  getSelectedFiles: () => File[];
};

/**
 * Custom hook for managing multiple file uploads
 */
export function useMultiFileUpload(
  options: UseMultiFileUploadOptions = {},
): UseMultiFileUploadResult {
  const { acceptedFileTypes, maxSizeMB, maxFiles, onUpload, onChange, onError, onComplete } =
    options;

  // State for files and upload status
  const [files, setFiles] = useState<Record<string, FileItem>>({});
  const [overallStatus, setOverallStatus] = useState<FileUploadStatus>('idle');
  const [results, setResults] = useState<Record<string, any>>({});

  // Reference to track upload controllers for cancellation
  const uploadControllersRef = useRef<Record<string, AbortController | null>>({});

  // Calculate derived values
  const fileCount = Object.keys(files).length;
  const hasSelectedFiles = fileCount > 0;
  const hasUploadingFiles = Object.values(files).some((file) => file.status === 'uploading');

  // Update overall status based on file statuses
  const updateOverallStatus = useCallback(() => {
    if (fileCount === 0) {
      setOverallStatus('idle');
      return;
    }

    const statuses = Object.values(files).map((file) => file.status);

    if (statuses.includes('uploading')) {
      setOverallStatus('uploading');
    } else if (statuses.includes('failed')) {
      setOverallStatus('failed');
    } else if (statuses.includes('selected')) {
      setOverallStatus('selected');
    } else if (statuses.every((status) => status === 'completed')) {
      setOverallStatus('completed');
    } else {
      setOverallStatus('selected');
    }
  }, [files, fileCount]);

  // Call updateOverallStatus when files change
  useEffect(() => {
    updateOverallStatus();
  }, [files, updateOverallStatus]);

  // Get all selected files as an array
  const getSelectedFiles = useCallback(() => {
    return Object.values(files).map((file) => file.file);
  }, [files]);

  // Add files to the list
  const addFiles = (newFiles: FileList): string[] => {
    if (newFiles.length === 0) return [];

    // Check for max files limit
    if (maxFiles && fileCount + newFiles.length > maxFiles) {
      if (onError) {
        onError(`Cannot add more than ${maxFiles} files`);
      }
      return [];
    }

    const filesArray = Array.from(newFiles);
    const newFileIds: string[] = [];
    const newFilesMap: Record<string, FileItem> = {};
    const newActualFiles: File[] = [];

    // Process each file
    filesArray.forEach((file) => {
      // Validate file
      const validation = validateFile(file, acceptedFileTypes, maxSizeMB);
      if (!validation.valid) {
        if (onError) {
          onError(validation.reason || 'Invalid file');
        }
        return;
      }

      // Create file item
      const fileId = generateFileId();
      newFileIds.push(fileId);
      newActualFiles.push(file);

      newFilesMap[fileId] = {
        id: fileId,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        status: 'selected',
        progress: 0,
      };
    });

    // Update state
    if (newFileIds.length > 0) {
      setFiles((prev) => ({ ...prev, ...newFilesMap }));

      if (onChange) {
        onChange([...getSelectedFiles(), ...newActualFiles]);
      }
    }

    return newFileIds;
  };

  // Remove a file from the list
  const removeFile = (fileId: string) => {
    // Cancel upload if in progress
    if (files[fileId]?.status === 'uploading') {
      cancelUpload(fileId);
    }

    // Update state
    setFiles((prev) => {
      const updatedFiles = { ...prev };
      delete updatedFiles[fileId];
      return updatedFiles;
    });

    // Remove from results if present
    if (results[fileId]) {
      setResults((prev) => {
        const updatedResults = { ...prev };
        delete updatedResults[fileId];
        return updatedResults;
      });
    }

    // Update file selection
    if (onChange) {
      const updatedFiles = getSelectedFiles().filter((file) =>
        Object.values(files).some((f) => f.file === file && f.id !== fileId),
      );
      onChange(updatedFiles);
    }
  };

  // Retry a failed upload
  const retryFile = (fileId: string) => {
    if (files[fileId] && files[fileId].status === 'failed') {
      setFiles((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'selected',
          progress: 0,
          error: undefined,
        },
      }));
    }
  };

  // Start uploading a specific file
  const startUpload = async (fileId: string): Promise<any | null> => {
    const fileItem = files[fileId];
    if (!fileItem || fileItem.status !== 'selected' || !onUpload) return null;

    // Update file status
    setFiles((prev) => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        status: 'uploading',
        progress: 0,
        error: undefined,
      },
    }));

    try {
      // Create AbortController for cancellation
      const controller = new AbortController();
      uploadControllersRef.current[fileId] = controller;

      // Simulated progress interval (remove in production)
      const progressInterval = setInterval(() => {
        setFiles((prev) => {
          if (!prev[fileId] || prev[fileId].status !== 'uploading') {
            clearInterval(progressInterval);
            return prev;
          }

          const newProgress = Math.min(prev[fileId].progress + 5, 99);
          return {
            ...prev,
            [fileId]: {
              ...prev[fileId],
              progress: newProgress,
            },
          };
        });
      }, 200);

      // Call upload function
      const result = await onUpload(fileItem.file, fileId);

      // Clear interval and update status
      clearInterval(progressInterval);

      // Update file status
      setFiles((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'completed',
          progress: 100,
        },
      }));

      // Store result
      setResults((prev) => ({
        ...prev,
        [fileId]: result,
      }));

      return result;
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';

      // Update file status
      setFiles((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'failed',
          error: errorMessage,
        },
      }));

      if (onError) {
        onError(errorMessage, fileId);
      }

      return null;
    } finally {
      uploadControllersRef.current[fileId] = null;
    }
  };

  // Start uploading all selected files
  const startAllUploads = async (): Promise<Record<string, any>> => {
    // Get all files with 'selected' status
    const selectedFileIds = Object.keys(files).filter(
      (fileId) => files[fileId].status === 'selected',
    );

    if (selectedFileIds.length === 0) return {};

    const uploadResults: Record<string, any> = {};

    // Upload files one by one to avoid overloading
    for (const fileId of selectedFileIds) {
      const result = await startUpload(fileId);
      if (result) {
        uploadResults[fileId] = result;
      }
    }

    // Notify onComplete if all files processed
    if (onComplete && Object.keys(uploadResults).length > 0) {
      onComplete(uploadResults);
    }

    return uploadResults;
  };

  // Cancel a specific upload
  const cancelUpload = (fileId: string) => {
    const controller = uploadControllersRef.current[fileId];
    if (controller) {
      controller.abort();
      uploadControllersRef.current[fileId] = null;

      // Update file status
      setFiles((prev) => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'failed',
          error: 'Upload cancelled',
        },
      }));
    }
  };

  // Cancel all uploads
  const cancelAllUploads = () => {
    // Get all files with 'uploading' status
    const uploadingFileIds = Object.keys(files).filter(
      (fileId) => files[fileId].status === 'uploading',
    );

    // Cancel each upload
    uploadingFileIds.forEach((fileId) => {
      cancelUpload(fileId);
    });
  };

  // Clear all files
  const clearFiles = () => {
    // Cancel any in-progress uploads
    cancelAllUploads();

    // Clear state
    setFiles({});
    setResults({});
  };

  return {
    files,
    fileCount,
    hasSelectedFiles,
    hasUploadingFiles,
    overallStatus,
    addFiles,
    removeFile,
    retryFile,
    startUpload,
    startAllUploads,
    cancelUpload,
    cancelAllUploads,
    clearFiles,
    getSelectedFiles,
  };
}
