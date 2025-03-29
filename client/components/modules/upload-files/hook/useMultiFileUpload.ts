import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  addFiles,
  removeFile,
  clearQueue,
  startUpload,
  cancelFileUpload,
  cancelAllUploads,
  retryFileUpload,
  retryAllFailedUploads,
  resetUploadUI,
  FileUploadInfo,
  QueueStatus,
  FileUploadStatus,
} from '@/store/features/files/progress-slice';
import {
  useUploadSingleFileMutation,
  selectUploadQueue,
  selectQueueStatus,
  selectCurrentUploadingFile,
  selectAllFilesHandled,
  selectUploadedFiles,
  selectFailedFiles,
  cancelUploadRequest,
} from '@/store/features/files/files.api';
import { clearAllUploadStates } from '@/store/features/files/upload-utils';

interface UseMultiFileUploadOptions {
  bucket?: string;
  onUploadComplete?: (uploadedFiles: FileUploadInfo[]) => void;
  onAllUploadsComplete?: (succeeded: FileUploadInfo[], failed: FileUploadInfo[]) => void;
  onError?: (error: any) => void;
}

// This map will store the actual File objects outside of Redux
// to prevent non-serializable objects in the Redux store
const fileObjectsMap = new Map<string, File>();

export const useMultiFileUpload = (options: UseMultiFileUploadOptions = {}) => {
  const { bucket = 'default', onUploadComplete, onAllUploadsComplete, onError } = options;

  const dispatch = useDispatch();
  const queue = useSelector(selectUploadQueue);
  const queueStatus = useSelector(selectQueueStatus);
  const currentUploadingFile = useSelector(selectCurrentUploadingFile);
  const allFilesHandled = useSelector(selectAllFilesHandled);
  const uploadedFiles = useSelector(selectUploadedFiles);
  const failedFiles = useSelector(selectFailedFiles);

  // Use RTK Query mutation hook
  const [uploadSingleFile, { isLoading }] = useUploadSingleFileMutation();

  // Reference to track if we've already processed the "all files handled" state
  const allFilesHandledProcessed = useRef(false);

  // Add files to the upload queue
  const addFilesToQueue = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        // Create serializable file data objects
        const fileDataArray = files.map((file) => {
          const id = uuidv4();
          // Store the actual File object in our Map
          fileObjectsMap.set(id, file);

          // Return only serializable data for Redux
          return {
            id,
            name: file.name,
            size: file.size,
            type: file.type,
          };
        });

        dispatch(addFiles(fileDataArray));
      }
    },
    [dispatch],
  );

  // Remove a file from the queue
  const removeFileFromQueue = useCallback(
    (fileId: string) => {
      // Also cancel any in-progress upload
      cancelUploadRequest(fileId);

      // Remove from our Map
      fileObjectsMap.delete(fileId);
      dispatch(removeFile(fileId));
    },
    [dispatch],
  );

  // Clear all files from the queue
  const clearFileQueue = useCallback(() => {
    // Clear the Map
    fileObjectsMap.clear();
    clearAllUploadStates();
    dispatch(clearQueue());
  }, [dispatch]);

  // Start uploading all files in the queue
  const startFileUpload = useCallback(() => {
    dispatch(startUpload());
  }, [dispatch]);

  // Cancel a specific file upload
  const cancelSingleUpload = useCallback(
    (fileId: string) => {
      dispatch(cancelFileUpload(fileId));
    },
    [dispatch],
  );

  // Cancel all uploads
  const cancelAllFileUploads = useCallback(() => {
    // Cancel all in-progress uploads
    queue.forEach((fileInfo) => {
      if (fileInfo.status === 'uploading' || fileInfo.status === 'waiting') {
        cancelUploadRequest(fileInfo.id);
      }
    });

    dispatch(cancelAllUploads());
  }, [dispatch, queue]);

  // Retry a failed file upload
  const retryFailedUpload = useCallback(
    (fileId: string) => {
      dispatch(retryFileUpload(fileId));
    },
    [dispatch],
  );

  // Retry all failed uploads
  const retryAllFailed = useCallback(() => {
    dispatch(retryAllFailedUploads());
  }, [dispatch]);

  // Reset UI to allow selecting more files
  const resetForMoreFiles = useCallback(() => {
    dispatch(resetUploadUI());
  }, [dispatch]);

  // Get the current state of a specific file
  const getFileState = useCallback(
    (fileId: string) => {
      return queue.find((item) => item.id === fileId);
    },
    [queue],
  );

  // Effect to monitor and upload current file
  useEffect(() => {
    if (currentUploadingFile && currentUploadingFile.status === 'uploading') {
      // Get the actual File object from our Map
      const fileObject = fileObjectsMap.get(currentUploadingFile.id);

      if (fileObject) {
        // Start the upload for this file
        uploadSingleFile({
          bucket,
          fileInfo: {
            ...currentUploadingFile,
            // This is only for the API call and won't go into Redux
            file: fileObject,
          },
        }).catch((error) => {
          if (onError) {
            onError(error);
          }
        });
      } else {
        console.error(`File object not found for ID: ${currentUploadingFile.id}`);
      }
    }
  }, [currentUploadingFile, uploadSingleFile, bucket, onError]);

  // Effect to handle when all files are processed
  useEffect(() => {
    if (allFilesHandled && !allFilesHandledProcessed.current) {
      allFilesHandledProcessed.current = true;

      if (onAllUploadsComplete) {
        onAllUploadsComplete(uploadedFiles, failedFiles);
      }
    } else if (!allFilesHandled) {
      allFilesHandledProcessed.current = false;
    }
  }, [allFilesHandled, uploadedFiles, failedFiles, onAllUploadsComplete]);

  // Effect to call onUploadComplete when a file is uploaded
  useEffect(() => {
    if (uploadedFiles.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedFiles);
    }
  }, [uploadedFiles.length, onUploadComplete, uploadedFiles]);

  // Get the actual File object for a given ID
  const getFileObject = useCallback((fileId: string) => {
    return fileObjectsMap.get(fileId);
  }, []);

  // Return all the necessary state and functions
  return {
    // State
    queue,
    queueStatus,
    currentUploadingFile,
    allFilesHandled,
    uploadedFiles,
    failedFiles,
    isUploading: isLoading,

    // Actions
    addFilesToQueue,
    removeFileFromQueue,
    clearFileQueue,
    startFileUpload,
    cancelSingleUpload,
    cancelAllFileUploads,
    retryFailedUpload,
    retryAllFailed,
    resetForMoreFiles,
    getFileState,
    getFileObject, // New function to get the actual File object
  };
};

export interface MultiFileUploadProps {
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  onUploadComplete?: (uploadedFiles: FileUploadInfo[]) => void;
  onAllUploadsComplete?: (succeeded: FileUploadInfo[], failed: FileUploadInfo[]) => void;
  onError?: (error: any) => void;
}

export default useMultiFileUpload;
