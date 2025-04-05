/**
 * Utilities for file upload management
 */

// Minimum time (in ms) between upload attempts for the same file
// This helps prevent rapid repeated requests for small files
export const UPLOAD_THROTTLE_TIME = 1000;

// Map to track the last time a file was uploaded by its ID
const lastUploadTimeMap = new Map<string, number>();

// Map to track currently in-progress uploads
const inProgressUploads = new Map<string, boolean>();

/**
 * Throttles a file upload to prevent too many requests in a short time
 *
 * @param fileId The unique identifier for the file
 * @param callback The function to call if the upload should proceed
 * @returns A promise that resolves after the upload is complete or throttled
 */
export const throttleUpload = async (
  fileId: string,
  callback: () => Promise<any>,
): Promise<any> => {
  const now = Date.now();
  const lastUploadTime = lastUploadTimeMap.get(fileId) || 0;
  const timeSinceLastUpload = now - lastUploadTime;

  // If this file is already being uploaded, don't start another upload
  if (inProgressUploads.get(fileId)) {
    console.log(`Upload already in progress for file ${fileId}, skipping`);
    return { data: { skipped: true, reason: 'already-in-progress' } };
  }

  // If not enough time has passed since the last upload attempt, wait
  if (timeSinceLastUpload < UPLOAD_THROTTLE_TIME) {
    // Wait until enough time has passed
    const waitTime = UPLOAD_THROTTLE_TIME - timeSinceLastUpload;

    console.log(`Throttling upload of file ${fileId} for ${waitTime}ms`);

    return new Promise((resolve) => {
      setTimeout(async () => {
        // Check again if it's already in progress
        if (inProgressUploads.get(fileId)) {
          console.log(`Upload already in progress for file ${fileId} after throttling, skipping`);
          resolve({ data: { skipped: true, reason: 'already-in-progress-after-throttle' } });
          return;
        }

        // Set last upload time and mark as in progress
        lastUploadTimeMap.set(fileId, Date.now());
        inProgressUploads.set(fileId, true);

        try {
          const result = await callback();
          resolve(result);
        } finally {
          // Always mark as no longer in progress
          inProgressUploads.set(fileId, false);
        }
      }, waitTime);
    });
  }

  // If enough time has passed, update the last upload time and proceed
  lastUploadTimeMap.set(fileId, now);
  inProgressUploads.set(fileId, true);

  try {
    return await callback();
  } finally {
    // Always mark as no longer in progress
    inProgressUploads.set(fileId, false);
  }
};

/**
 * Returns true if an upload for the specified file ID is currently being throttled
 *
 * @param fileId The unique identifier for the file
 * @returns True if the upload is being throttled
 */
export const isUploadThrottled = (fileId: string): boolean => {
  const lastUploadTime = lastUploadTimeMap.get(fileId) || 0;
  const timeSinceLastUpload = Date.now() - lastUploadTime;
  return timeSinceLastUpload < UPLOAD_THROTTLE_TIME;
};

/**
 * Returns true if an upload for the specified file ID is currently in progress
 *
 * @param fileId The unique identifier for the file
 * @returns True if the upload is in progress
 */
export const isUploadInProgress = (fileId: string): boolean => {
  return !!inProgressUploads.get(fileId);
};

/**
 * Clear throttling and in-progress information for a specific file
 *
 * @param fileId The unique identifier for the file
 */
export const clearUploadState = (fileId: string): void => {
  lastUploadTimeMap.delete(fileId);
  inProgressUploads.delete(fileId);
};

/**
 * Clear all throttling and in-progress information
 */
export const clearAllUploadStates = (): void => {
  lastUploadTimeMap.clear();
  inProgressUploads.clear();
};
