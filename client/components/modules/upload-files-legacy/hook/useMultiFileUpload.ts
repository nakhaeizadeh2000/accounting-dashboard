import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  addFiles,
  removeFile,
  clearComponentQueue,
  startUpload,
  cancelFileUpload,
  cancelComponentUploads,
  retryFileUpload,
  retryComponentFailedUploads,
  resetUploadUI,
  FileUploadInfo,
  QueueStatus,
  FileUploadStatus,
  removeFilesForComponent,
  FileMetadata,
} from '@/store/features/files/progress-slice';
import {
  useUploadSingleFileMutation,
  useUploadMultipleFilesMutation,
  selectFilesByOwnerId,
  selectQueueStatusByOwnerId,
  selectCurrentUploadingFileByOwnerId,
  selectAllFilesHandledByOwnerId,
  selectUploadedFilesByOwnerId,
  selectFailedFilesByOwnerId,
  cancelUploadRequest,
  UploadFileResponse,
} from '@/store/features/files/files.api';

// Import these functions directly from the upload-utils.ts
import { clearUploadState } from '@/store/features/files/upload-utils';

interface UseMultiFileUploadOptions {
  id?: string; // Unique ID for component instance
  bucket?: string;
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
  onUploadComplete?: (uploadedFiles: FileUploadInfo[]) => void;
  onAllUploadsComplete?: (succeeded: FileUploadInfo[], failed: FileUploadInfo[]) => void;
  onError?: (error: any) => void;
}

// Create an interface for the file response data
interface FileResponseData {
  originalName: string;
  uniqueName: string;
  size: number;
  mimetype: string;
  thumbnailName?: string;
  url: string; // Making url required to match FileMetadata
  thumbnailUrl?: string;
  bucket: string;
  uploadedAt: string | Date;
  [key: string]: any; // For any additional properties
}

// Extend the FileUploadInfo to include a properly typed response
interface FileUploadInfoWithResponse extends FileUploadInfo {
  response?: {
    success?: boolean;
    statusCode?: number;
    message?: string[];
    data?: {
      message?: string;
      files?: FileResponseData[];
    };
    files?: FileResponseData[]; // For backward compatibility
  };
}

// This map will store the actual File objects outside of Redux
// to prevent non-serializable objects in the Redux store
const fileObjectsMap = new Map<string, File>();

export const useMultiFileUpload = (options: UseMultiFileUploadOptions = {}) => {
  const {
    id: providedId,
    bucket = 'default',
    maxSizeMB,
    allowedMimeTypes,
    onUploadComplete,
    onAllUploadsComplete,
    onError,
  } = options;

  // Create a stable instance ID for this component
  const componentIdRef = useRef<string>(providedId || `multi-upload-${uuidv4()}`);

  const dispatch = useDispatch();
  const queue = useSelector(selectFilesByOwnerId(componentIdRef.current));
  const queueStatus = useSelector(selectQueueStatusByOwnerId(componentIdRef.current));
  const currentUploadingFile = useSelector(
    selectCurrentUploadingFileByOwnerId(componentIdRef.current),
  );
  const allFilesHandled = useSelector(selectAllFilesHandledByOwnerId(componentIdRef.current));
  const uploadedFiles = useSelector(
    selectUploadedFilesByOwnerId(componentIdRef.current),
  ) as FileUploadInfoWithResponse[];
  const failedFiles = useSelector(selectFailedFilesByOwnerId(componentIdRef.current));

  // Use RTK Query mutations
  const [uploadSingleFile] = useUploadSingleFileMutation();
  const [uploadMultipleFiles] = useUploadMultipleFilesMutation();

  // Reference to track if we've already processed the "all files handled" state
  const allFilesHandledProcessed = useRef(false);

  // Track if callbacks have been called to prevent infinite loops
  const [uploadCompleteCalled, setUploadCompleteCalled] = useState(false);
  const [allUploadsCompleteCalled, setAllUploadsCompleteCalled] = useState(false);

  // Track the current uploading file ID to prevent infinite loops
  const currentUploadingFileId = useRef<string | null>(null);

  // Track if any uploads were cancelled
  const [cancelledUploads, setCancelledUploads] = useState<Set<string>>(new Set());

  // Add files to the upload queue
  const addFilesToQueue = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        // Create serializable file data objects
        const fileDataArray = files.map((file) => {
          const id = `${componentIdRef.current}-${uuidv4()}`;
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

        dispatch(
          addFiles({
            ownerId: componentIdRef.current,
            files: fileDataArray,
          }),
        );

        // Reset callback flags when adding new files
        setUploadCompleteCalled(false);
        setAllUploadsCompleteCalled(false);
        allFilesHandledProcessed.current = false;
        setCancelledUploads(new Set()); // Reset cancelled uploads tracking
      }
    },
    [dispatch],
  );

  // Remove a file from the queue
  const removeFileFromQueue = useCallback(
    (fileId: string) => {
      // Also cancel any in-progress upload
      cancelUploadRequest(fileId);

      // Track if this was a cancelled upload
      if (currentUploadingFileId.current === fileId) {
        setCancelledUploads((prev) => {
          const newSet = new Set(prev);
          newSet.add(fileId);
          return newSet;
        });
      }

      // Remove from our Map
      fileObjectsMap.delete(fileId);
      dispatch(removeFile(fileId));

      // Reset callback flags
      setUploadCompleteCalled(false);
      setAllUploadsCompleteCalled(false);
      allFilesHandledProcessed.current = false;
    },
    [dispatch],
  );

  // Clear all files from the queue
  const clearFileQueue = useCallback(() => {
    // Clear the Map for this component's files
    queue.forEach((file) => {
      fileObjectsMap.delete(file.id);
      clearUploadState(file.id);
    });

    dispatch(clearComponentQueue(componentIdRef.current));

    // Reset callback flags
    setUploadCompleteCalled(false);
    setAllUploadsCompleteCalled(false);
    allFilesHandledProcessed.current = false;
    setCancelledUploads(new Set());
  }, [dispatch, queue]);

  // Start uploading all files in the queue
  const startFileUpload = useCallback(() => {
    dispatch(startUpload(componentIdRef.current));

    // Reset callback flags
    setUploadCompleteCalled(false);
    setAllUploadsCompleteCalled(false);
    allFilesHandledProcessed.current = false;
    setCancelledUploads(new Set());
  }, [dispatch]);

  // Cancel a specific file upload
  const cancelSingleUpload = useCallback(
    (fileId: string) => {
      // Track the cancellation
      setCancelledUploads((prev) => {
        const newSet = new Set(prev);
        newSet.add(fileId);
        return newSet;
      });

      dispatch(cancelFileUpload(fileId));

      // Reset callback flags
      setUploadCompleteCalled(false);
      setAllUploadsCompleteCalled(false);
      allFilesHandledProcessed.current = false;
    },
    [dispatch],
  );

  // Cancel all uploads
  const cancelAllFileUploads = useCallback(() => {
    // Track all uploading or waiting files as cancelled
    queue.forEach((fileInfo) => {
      if (fileInfo.status === 'uploading' || fileInfo.status === 'waiting') {
        setCancelledUploads((prev) => {
          const newSet = new Set(prev);
          newSet.add(fileInfo.id);
          return newSet;
        });
      }
    });

    // Cancel all in-progress uploads for this component
    queue.forEach((fileInfo) => {
      if (fileInfo.status === 'uploading' || fileInfo.status === 'waiting') {
        cancelUploadRequest(fileInfo.id);
      }
    });

    dispatch(cancelComponentUploads(componentIdRef.current));

    // Reset callback flags
    setUploadCompleteCalled(false);
    setAllUploadsCompleteCalled(false);
    allFilesHandledProcessed.current = false;
  }, [dispatch, queue]);

  // Retry a failed file upload
  const retryFailedUpload = useCallback(
    (fileId: string) => {
      // Remove this file from the cancelled tracking if it was cancelled before
      setCancelledUploads((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });

      dispatch(retryFileUpload(fileId));

      // Reset callback flags
      setUploadCompleteCalled(false);
      setAllUploadsCompleteCalled(false);
      allFilesHandledProcessed.current = false;
    },
    [dispatch],
  );

  // Retry all failed uploads
  const retryAllFailed = useCallback(() => {
    // Remove all cancelled files from tracking since we're retrying
    setCancelledUploads(new Set());

    dispatch(retryComponentFailedUploads(componentIdRef.current));

    // Reset callback flags
    setUploadCompleteCalled(false);
    setAllUploadsCompleteCalled(false);
    allFilesHandledProcessed.current = false;
  }, [dispatch]);

  // Reset UI to allow selecting more files
  const resetForMoreFiles = useCallback(() => {
    dispatch(resetUploadUI(componentIdRef.current));
    setCancelledUploads(new Set());

    // Reset callback flags
    setAllUploadsCompleteCalled(false);
  }, [dispatch]);

  // Get the current state of a specific file
  const getFileState = useCallback(
    (fileId: string) => {
      return queue.find((item) => item.id === fileId);
    },
    [queue],
  );

  // Check if a file was cancelled
  const wasFileCancelled = useCallback(
    (fileId: string) => {
      return cancelledUploads.has(fileId);
    },
    [cancelledUploads],
  );

  // Effect to monitor and upload current file
  useEffect(() => {
    // Only proceed if there's a file to upload and it's different from the last one we processed
    if (
      currentUploadingFile &&
      currentUploadingFile.status === 'uploading' &&
      currentUploadingFileId.current !== currentUploadingFile.id
    ) {
      // Update our ref to avoid processing the same file multiple times
      currentUploadingFileId.current = currentUploadingFile.id;

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
          // Handle upload failure and check if it was a cancellation
          const isCancelled =
            error?.message?.includes('cancelled') ||
            error?.status === 'cancelled' ||
            error?.status === 499;

          if (isCancelled) {
            // Track the cancellation
            setCancelledUploads((prev) => {
              const newSet = new Set(prev);
              newSet.add(currentUploadingFile.id);
              return newSet;
            });
          }

          if (onError) {
            onError(error);
          }
        });
      } else {
        console.error(`File object not found for ID: ${currentUploadingFile.id}`);
      }
    } else if (!currentUploadingFile) {
      // Clear the ref when there's no file uploading
      currentUploadingFileId.current = null;
    }
  }, [currentUploadingFile, uploadSingleFile, bucket, onError]);

  // Effect to handle when all files are processed
  useEffect(() => {
    // Only call the callback once per set of uploads
    if (allFilesHandled && !allUploadsCompleteCalled && queue.length > 0) {
      if (onAllUploadsComplete) {
        // Process the uploaded files to extract metadata from the standardized response structure if necessary
        const processedUploadedFiles = uploadedFiles.map((file) => {
          // If file has response with the new structure, extract the data
          if (file.response?.data?.files) {
            const fileData = file.response.data.files.find(
              (resFile: FileResponseData) => resFile.originalName === file.fileData.name,
            );

            if (fileData && fileData.url) {
              // Ensure url exists before applying
              // Ensure compatibility with FileMetadata by creating a properly typed object
              const compatibleMetadata: FileMetadata = {
                originalName: fileData.originalName,
                uniqueName: fileData.uniqueName,
                size: fileData.size,
                mimetype: fileData.mimetype,
                thumbnailName: fileData.thumbnailName,
                url: fileData.url,
                thumbnailUrl: fileData.thumbnailUrl,
                bucket: fileData.bucket,
                uploadedAt: new Date(fileData.uploadedAt),
              };

              return {
                ...file,
                metadata: compatibleMetadata,
              } as FileUploadInfo;
            }
          }
          return file as FileUploadInfo;
        });

        // Filtered failed files - exclude cancelled ones
        const actualFailedFiles = failedFiles.filter((file) => !cancelledUploads.has(file.id));

        // Report cancelled files separately with custom objects, not as failed
        const cancelledFiles = queue.filter((file) => cancelledUploads.has(file.id));

        // Log for debugging
        console.log(
          `All uploads complete: ${uploadedFiles.length} succeeded, ${actualFailedFiles.length} failed, ${cancelledFiles.length} cancelled`,
        );

        onAllUploadsComplete(processedUploadedFiles, actualFailedFiles);
        setAllUploadsCompleteCalled(true);
      }
    }
  }, [
    allFilesHandled,
    uploadedFiles,
    failedFiles,
    onAllUploadsComplete,
    queue.length,
    allUploadsCompleteCalled,
    cancelledUploads,
    queue,
  ]);

  // Effect to call onUploadComplete when files are uploaded
  useEffect(() => {
    // Only call if we have completed files and haven't called the callback yet
    if (uploadedFiles.length > 0 && !uploadCompleteCalled && onUploadComplete) {
      // Process the uploaded files to extract metadata from the standardized response structure if necessary
      const processedUploadedFiles = uploadedFiles.map((file) => {
        // If file has response with the new structure, extract the data
        if (file.response?.data?.files) {
          const fileData = file.response.data.files.find(
            (resFile: FileResponseData) => resFile.originalName === file.fileData.name,
          );

          if (fileData && fileData.url) {
            // Ensure url exists before applying
            // Ensure compatibility with FileMetadata by creating a properly typed object
            const compatibleMetadata: FileMetadata = {
              originalName: fileData.originalName,
              uniqueName: fileData.uniqueName,
              size: fileData.size,
              mimetype: fileData.mimetype,
              thumbnailName: fileData.thumbnailName,
              url: fileData.url,
              thumbnailUrl: fileData.thumbnailUrl,
              bucket: fileData.bucket,
              uploadedAt: new Date(fileData.uploadedAt),
            };

            return {
              ...file,
              metadata: compatibleMetadata,
            } as FileUploadInfo;
          }
        }
        return file as FileUploadInfo;
      });

      onUploadComplete(processedUploadedFiles);
      setUploadCompleteCalled(true);
    }
  }, [uploadedFiles, onUploadComplete, uploadCompleteCalled]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up file objects for this component
      queue.forEach((file) => {
        fileObjectsMap.delete(file.id);
        clearUploadState(file.id);
      });

      // Remove component's files from Redux
      dispatch(removeFilesForComponent(componentIdRef.current));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // Intentionally only depend on dispatch to avoid cleanup running too often

  // Get the actual File object for a given ID
  const getFileObject = useCallback((fileId: string) => {
    return fileObjectsMap.get(fileId);
  }, []);

  // Return all the necessary state and functions
  return {
    // State
    componentId: componentIdRef.current,
    queue,
    queueStatus,
    currentUploadingFile,
    allFilesHandled,
    uploadedFiles,
    failedFiles,
    isUploading: !!currentUploadingFile,
    cancelledUploads: Array.from(cancelledUploads),
    wasCancelled: wasFileCancelled,

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
    getFileObject, // Function to get the actual File object
  };
};

export default useMultiFileUpload;
