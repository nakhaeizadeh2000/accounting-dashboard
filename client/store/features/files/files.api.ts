import { baseApi, baseUrl } from '@/store/api';
import {
  updateFileProgress,
  fileUploadSuccess,
  fileUploadFailure,
  FileUploadInfo,
  setFileUploading,
  clearFileUploading,
} from './progress-slice';
import { createSelector } from '@reduxjs/toolkit';
import { IRootState } from '@/store';
import { throttleUpload, clearUploadState, isUploadInProgress } from './upload-utils';

// Add this line to ensure the Files tag is registered with RTK Query
// This will fix the "Tag type 'Files' was used, but not specified in `tagTypes`!" error
baseApi.enhanceEndpoints({ addTagTypes: ['Files'] });

// Add type declaration for global window object
declare global {
  interface Window {
    activeUploads?: Map<string, AbortController>;
    xhrRequests?: Map<string, XMLHttpRequest>;
  }
}

// Ensure we have a single instance of the activeUploads map
const getActiveUploads = (): Map<string, AbortController> => {
  if (!window.activeUploads) {
    window.activeUploads = new Map<string, AbortController>();
  }
  return window.activeUploads;
};

// Ensure we have a single instance of the xhrRequests map
const getXhrRequests = (): Map<string, XMLHttpRequest> => {
  if (!window.xhrRequests) {
    window.xhrRequests = new Map<string, XMLHttpRequest>();
  }
  return window.xhrRequests;
};

// Helper function to safely check if a file is active with the given controller
const isActiveController = (fileId: string, controller: AbortController): boolean => {
  const uploads = getActiveUploads();
  return uploads.get(fileId) === controller;
};

// Helper function to cancel an upload by fileId
export const cancelUploadRequest = (fileId: string): void => {
  const uploads = getActiveUploads();
  const requests = getXhrRequests();

  // Abort the controller if it exists
  const controller = uploads.get(fileId);
  if (controller) {
    controller.abort();
  }

  // Also directly abort the XHR request if it exists
  const xhr = requests.get(fileId);
  if (xhr) {
    xhr.abort();
    requests.delete(fileId);
  }
};

// Selectors for accessing upload state
const selectUploadState = (state: IRootState) => state.upload;

export const selectUploadQueue = createSelector(
  [selectUploadState],
  (uploadState) => uploadState.queue,
);

export const selectQueueStatus = createSelector(
  [selectUploadState],
  (uploadState) => uploadState.queueStatus,
);

export const selectCurrentUploadingFile = createSelector([selectUploadState], (uploadState) => {
  if (uploadState.currentUploadIndex !== null) {
    return uploadState.queue[uploadState.currentUploadIndex];
  }
  return null;
});

export const selectAllFilesHandled = createSelector(
  [selectUploadState],
  (uploadState) => uploadState.allFilesHandled,
);

export const selectFileById = (fileId: string) =>
  createSelector([selectUploadState], (uploadState) =>
    uploadState.queue.find((item) => item.id === fileId),
  );

export const selectUploadedFiles = createSelector([selectUploadState], (uploadState) =>
  uploadState.queue.filter((item) => item.status === 'completed'),
);

export const selectFailedFiles = createSelector([selectUploadState], (uploadState) =>
  uploadState.queue.filter((item) => item.status === 'failed'),
);

// API endpoints
const filesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Upload a single file from the queue
    uploadSingleFile: builder.mutation<
      any,
      { bucket: string; fileInfo: FileUploadInfo & { file?: File } }
    >({
      queryFn: async ({ bucket, fileInfo }, { signal, dispatch }) => {
        // Check if this file is already being uploaded
        if (isUploadInProgress(fileInfo.id)) {
          console.log(`Upload already in progress for file ${fileInfo.id}, skipping`);
          return { data: { skipped: true, reason: 'already-in-progress' } };
        }

        // If there's already an active controller for this file, abort it
        const activeUploads = getActiveUploads();
        const previousController = activeUploads.get(fileInfo.id);
        if (previousController) {
          previousController.abort();
        }

        // Create a new AbortController for this upload
        const controller = new AbortController();
        activeUploads.set(fileInfo.id, controller);

        // Mark the file as uploading in the Redux state
        dispatch(setFileUploading(fileInfo.id));

        // Ensure we clean up when we're done
        const cleanup = () => {
          const uploads = getActiveUploads();
          uploads.delete(fileInfo.id);

          const requests = getXhrRequests();
          requests.delete(fileInfo.id);

          clearUploadState(fileInfo.id);
          dispatch(clearFileUploading(fileInfo.id));
        };

        // Use throttling to prevent rapid successive requests
        return await throttleUpload(fileInfo.id, async () => {
          try {
            return await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();

              // Store the xhr request in the global map
              const requests = getXhrRequests();
              requests.set(fileInfo.id, xhr);

              xhr.open('POST', `${baseUrl}files/upload/${bucket}`, true);

              // Track upload progress
              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const percentComplete = Math.floor((event.loaded / event.total) * 100);
                  dispatch(
                    updateFileProgress({
                      id: fileInfo.id,
                      progress: percentComplete,
                      bytesUploaded: event.loaded,
                    }),
                  );
                }
              };

              // Handle successful upload
              xhr.onload = () => {
                // If this request has been superseded by another, ignore the response
                if (!isActiveController(fileInfo.id, controller)) {
                  console.log('Ignoring response for outdated request for file', fileInfo.id);
                  return;
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const response = JSON.parse(xhr.responseText);
                    dispatch(
                      fileUploadSuccess({
                        id: fileInfo.id,
                        response,
                      }),
                    );
                    cleanup();
                    resolve({ data: response });
                  } catch (error) {
                    const errorMsg = 'Invalid server response format';
                    dispatch(
                      fileUploadFailure({
                        id: fileInfo.id,
                        errorMessage: errorMsg,
                      }),
                    );
                    cleanup();
                    reject({ status: xhr.status, data: errorMsg });
                  }
                } else {
                  let errorMsg;
                  try {
                    errorMsg = JSON.parse(xhr.responseText).message || 'Upload failed';
                  } catch (e) {
                    errorMsg = 'Upload failed';
                  }

                  dispatch(
                    fileUploadFailure({
                      id: fileInfo.id,
                      errorMessage: errorMsg,
                    }),
                  );
                  cleanup();
                  reject({ status: xhr.status, data: errorMsg });
                }
              };

              // Handle network errors
              xhr.onerror = () => {
                // Only process if this is still the active request
                if (isActiveController(fileInfo.id, controller)) {
                  const errorMsg = 'Network error occurred';
                  dispatch(
                    fileUploadFailure({
                      id: fileInfo.id,
                      errorMessage: errorMsg,
                    }),
                  );
                  cleanup();
                  reject({ status: xhr.status, data: errorMsg });
                }
              };

              // Handle abort
              xhr.onabort = () => {
                // Don't report error if it's aborted due to a new request taking over
                if (isActiveController(fileInfo.id, controller)) {
                  const errorMsg = 'Upload cancelled';
                  dispatch(
                    fileUploadFailure({
                      id: fileInfo.id,
                      errorMessage: errorMsg,
                    }),
                  );
                  cleanup();
                  reject({ status: 'aborted', data: errorMsg });
                }
              };

              // Tie the AbortSignal from RTK Query to xhr.abort()
              signal?.addEventListener('abort', () => {
                xhr.abort();
              });

              // Also tie our controller's signal to xhr.abort()
              controller.signal.addEventListener('abort', () => {
                xhr.abort();
              });

              // Prepare and send FormData
              const formData = new FormData();
              if (fileInfo.file) {
                formData.append('file', fileInfo.file);
              } else {
                cleanup();
                throw new Error('File object not provided for upload');
              }

              xhr.send(formData);
            });
          } catch (error: any) {
            cleanup();

            // Don't report as error if it was aborted
            if (error.status === 'aborted' || controller.signal.aborted) {
              console.log('Upload aborted:', fileInfo.id);
              return { data: { aborted: true } };
            }

            return {
              error: {
                status: error.status || 'error',
                data: error.data || 'Unknown error occurred',
              },
            };
          }
        });
      },
      invalidatesTags: ['Files'],
    }),

    // Get a file download URL
    getFileDownloadUrl: builder.query<{ url: string }, { bucket: string; filename: string }>({
      query: ({ bucket, filename }) => ({
        url: `files/download/${bucket}/${filename}`,
        method: 'GET',
      }),
      providesTags: ['Files'],
    }),

    // Get file metadata
    getFileMetadata: builder.query<any, { bucket: string; filename: string }>({
      query: ({ bucket, filename }) => ({
        url: `files/metadata/${bucket}/${filename}`,
        method: 'GET',
      }),
      providesTags: ['Files'],
    }),

    // Delete a file
    deleteFile: builder.mutation<any, { bucket: string; filename: string }>({
      query: ({ bucket, filename }) => ({
        url: `files/delete/${bucket}/${filename}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Files'],
    }),
  }),
});

export const {
  useUploadSingleFileMutation,
  useGetFileDownloadUrlQuery,
  useGetFileMetadataQuery,
  useDeleteFileMutation,
} = filesApi;
