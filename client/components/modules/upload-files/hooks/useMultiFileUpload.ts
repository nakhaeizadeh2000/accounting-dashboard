'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  UseMultiFileUploadOptions,
  MultiFileUploadHookResult,
  FileUploadInfo,
  FileData,
  FileResponseData,
} from '../utils/file-types';
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
  removeFilesForComponent,
  FileMetadata,
  FileUploadInfo as StoreFileUploadInfo,
} from '@/store/features/files/progress-slice';
import {
  useUploadSingleFileMutation,
  selectFilesByOwnerId,
  selectQueueStatusByOwnerId,
  selectCurrentUploadingFileByOwnerId,
  selectAllFilesHandledByOwnerId,
  selectUploadedFilesByOwnerId,
  selectFailedFilesByOwnerId,
  cancelUploadRequest,
} from '@/store/features/files/files.api';

// Import these functions directly from the upload-utils.ts
import { clearUploadState } from '@/store/features/files/upload-utils';

// This map will store the actual File objects outside of Redux
// to prevent non-serializable objects in the Redux store
const fileObjectsMap = new Map<string, File>();

/**
 * Custom hook for managing multiple file uploads
 */
const useMultiFileUpload = (options: UseMultiFileUploadOptions = {}): MultiFileUploadHookResult => {
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
  const storeQueue = useSelector(selectFilesByOwnerId(componentIdRef.current));
  const queueStatus = useSelector(selectQueueStatusByOwnerId(componentIdRef.current));
  const storeCurrentUploadingFile = useSelector(
    selectCurrentUploadingFileByOwnerId(componentIdRef.current),
  );
  const allFilesHandled = useSelector(selectAllFilesHandledByOwnerId(componentIdRef.current));
  const storeUploadedFiles = useSelector(selectUploadedFilesByOwnerId(componentIdRef.current));
  const storeFailedFiles = useSelector(selectFailedFilesByOwnerId(componentIdRef.current));

  // Track processed upload callbacks to prevent duplicate callback handling
  const processedCallbacksRef = useRef<Set<string>>(new Set());
  // Track previously uploaded files to avoid duplicate processing
  const previouslyUploadedRef = useRef<Set<string>>(new Set());

  // Convert store types to our component types
  const convertStoreFileToComponentFile = (file: StoreFileUploadInfo): FileUploadInfo => {
    return {
      ...file,
      fileData: {
        id: file.id, // Add id to fileData to match our FileData type
        name: file.fileData.name,
        size: file.fileData.size,
        type: file.fileData.type,
      } as FileData,
    } as FileUploadInfo;
  };

  // Convert all files from store format to our component format
  const queue = storeQueue.map(convertStoreFileToComponentFile);
  const currentUploadingFile = storeCurrentUploadingFile
    ? convertStoreFileToComponentFile(storeCurrentUploadingFile)
    : null;
  const uploadedFiles = storeUploadedFiles.map(convertStoreFileToComponentFile);
  const failedFiles = storeFailedFiles.map(convertStoreFileToComponentFile);

  // Use RTK Query mutations
  const [uploadSingleFile] = useUploadSingleFileMutation();

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

        // Log files being added to the queue for debugging
        console.log(
          'Adding files to queue:',
          fileDataArray.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        );

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
    storeQueue.forEach((file) => {
      fileObjectsMap.delete(file.id);
      clearUploadState(file.id);
    });

    dispatch(clearComponentQueue(componentIdRef.current));

    // Reset callback flags
    setUploadCompleteCalled(false);
    setAllUploadsCompleteCalled(false);
    allFilesHandledProcessed.current = false;
    setCancelledUploads(new Set());
  }, [dispatch, storeQueue]);

  // Start uploading all files in the queue
  const startFileUpload = useCallback(() => {
    dispatch(startUpload(componentIdRef.current));

    // Reset callback flags
    setUploadCompleteCalled(false);
    setAllUploadsCompleteCalled(false);
    allFilesHandledProcessed.current = false;
    setCancelledUploads(new Set());

    // Also reset tracking of uploaded files
    previouslyUploadedRef.current = new Set();
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
    storeQueue.forEach((fileInfo) => {
      if (fileInfo.status === 'uploading' || fileInfo.status === 'waiting') {
        setCancelledUploads((prev) => {
          const newSet = new Set(prev);
          newSet.add(fileInfo.id);
          return newSet;
        });
      }
    });

    // Cancel all in-progress uploads for this component
    storeQueue.forEach((fileInfo) => {
      if (fileInfo.status === 'uploading' || fileInfo.status === 'waiting') {
        cancelUploadRequest(fileInfo.id);
      }
    });

    dispatch(cancelComponentUploads(componentIdRef.current));

    // Reset callback flags
    setUploadCompleteCalled(false);
    setAllUploadsCompleteCalled(false);
    allFilesHandledProcessed.current = false;
  }, [dispatch, storeQueue]);

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
      const file = storeQueue.find((item) => item.id === fileId);
      return file ? convertStoreFileToComponentFile(file) : undefined;
    },
    [storeQueue],
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
      storeCurrentUploadingFile &&
      storeCurrentUploadingFile.status === 'uploading' &&
      currentUploadingFileId.current !== storeCurrentUploadingFile.id
    ) {
      // Update our ref to avoid processing the same file multiple times
      currentUploadingFileId.current = storeCurrentUploadingFile.id;

      // Get the actual File object from our Map
      const fileObject = fileObjectsMap.get(storeCurrentUploadingFile.id);

      if (fileObject) {
        // Start the upload for this file
        uploadSingleFile({
          bucket,
          fileInfo: {
            ...storeCurrentUploadingFile,
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
              newSet.add(storeCurrentUploadingFile.id);
              return newSet;
            });
          }

          if (onError) {
            onError(error);
          }
        });
      } else {
        console.error(`File object not found for ID: ${storeCurrentUploadingFile.id}`);
      }
    } else if (!storeCurrentUploadingFile) {
      // Clear the ref when there's no file uploading
      currentUploadingFileId.current = null;
    }
  }, [storeCurrentUploadingFile, uploadSingleFile, bucket, onError]);

  // Effect to handle when all files are processed
  useEffect(() => {
    // Only call the callback once per set of uploads
    if (allFilesHandled && !allUploadsCompleteCalled && queue.length > 0) {
      if (onAllUploadsComplete) {
        // Process the uploaded files to extract metadata from the standardized response structure
        const processedUploadedFiles = uploadedFiles
          .filter((file) => {
            // Skip if we've already processed this file in a callback
            if (previouslyUploadedRef.current.has(file.id)) {
              return false;
            }

            // Mark this file as processed
            previouslyUploadedRef.current.add(file.id);
            return true;
          })
          .map((file) => {
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
            return file;
          });

        // Filtered failed files - exclude cancelled ones
        const actualFailedFiles = failedFiles.filter((file) => !cancelledUploads.has(file.id));

        // Report cancelled files separately with custom objects, not as failed
        const cancelledFiles = queue.filter((file) => cancelledUploads.has(file.id));

        // Log for debugging
        console.log(
          `All uploads complete: ${uploadedFiles.length} succeeded, ${actualFailedFiles.length} failed, ${cancelledFiles.length} cancelled`,
        );

        // Only trigger callback if there are new files processed
        if (processedUploadedFiles.length > 0) {
          onAllUploadsComplete(processedUploadedFiles, actualFailedFiles);
        }

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
    // Only call for completed files that we haven't processed yet
    const newlyCompletedFiles = uploadedFiles.filter((file) => {
      // Skip if we've already processed this file
      if (processedCallbacksRef.current.has(file.id)) {
        return false;
      }

      // Only include completed files
      return file.status === 'completed';
    });

    if (newlyCompletedFiles.length > 0 && onUploadComplete) {
      // Mark these files as processed
      newlyCompletedFiles.forEach((file) => {
        processedCallbacksRef.current.add(file.id);
      });

      // Process the files to extract metadata
      const processedUploadedFiles = newlyCompletedFiles.map((file) => {
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
        return file;
      });

      // Call the callback with newly processed files
      onUploadComplete(processedUploadedFiles);
    }
  }, [uploadedFiles, onUploadComplete]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up file objects for this component
      storeQueue.forEach((file) => {
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
    getFileObject,
  };
};

export default useMultiFileUpload;
