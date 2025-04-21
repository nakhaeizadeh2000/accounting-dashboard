/**
 * Utility functions for file uploads
 */
import { formatFileSize } from './file-helpers';

// Map to keep track of throttled uploads
const throttledUploads = new Map<string, boolean>();
// Map to keep track of in-progress uploads
const activeUploads = new Map<string, boolean>();

/**
 * Throttle an upload to prevent multiple simultaneous uploads of the same file
 *
 * @param fileId The ID of the file being uploaded
 * @param uploadFn The function to execute for uploading
 * @returns The result of the upload function
 */
export const throttleUpload = async <T>(fileId: string, uploadFn: () => Promise<T>): Promise<T> => {
  // If this file is already being throttled, wait for it to complete
  if (isUploadThrottled(fileId)) {
    throw new Error(`Upload for file ${fileId} is already in progress`);
  }

  try {
    // Mark this file as throttled
    throttledUploads.set(fileId, true);
    // Mark this file as actively uploading
    activeUploads.set(fileId, true);

    // Execute the upload function
    return await uploadFn();
  } finally {
    // Always clean up, even on error
    throttledUploads.delete(fileId);
  }
};

/**
 * Check if an upload is currently being throttled
 *
 * @param fileId The ID of the file to check
 * @returns True if the upload is throttled
 */
export const isUploadThrottled = (fileId: string): boolean => {
  return throttledUploads.has(fileId);
};

/**
 * Check if a file is currently being uploaded
 *
 * @param fileId The ID of the file to check
 * @returns True if the file is being uploaded
 */
export const isUploadInProgress = (fileId: string): boolean => {
  return activeUploads.has(fileId);
};

/**
 * Clear the upload state for a file
 *
 * @param fileId The ID of the file to clear
 */
export const clearUploadState = (fileId: string): void => {
  throttledUploads.delete(fileId);
  activeUploads.delete(fileId);
};

/**
 * Clear all upload states
 */
export const clearAllUploadStates = (): void => {
  throttledUploads.clear();
  activeUploads.clear();
};

/**
 * Create file info object for the upload API
 *
 * @param file The file to create info for
 * @param ownerId The ID of the component that owns this file
 * @returns File info object
 */
export const createFileInfo = (file: File, ownerId: string): any => {
  return {
    id: `${ownerId}-${generateUniqueId()}`,
    ownerId,
    fileData: {
      name: file.name,
      size: file.size,
      type: file.type,
    },
    status: 'selected' as const,
    progress: 0,
    bytesUploaded: 0,
    errorMessage: '',
  };
};

/**
 * Generate a unique identifier
 *
 * @returns A unique string ID
 */
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export { formatFileSize };
