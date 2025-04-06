import { baseApi, baseUrl } from '@/store/api';
import {
  updateFileProgress,
  fileUploadSuccess,
  fileUploadFailure,
  FileUploadInfo,
  setFileUploading,
  clearFileUploading,
  QueueStatus,
  FileMetadata,
} from './progress-slice';
import { createSelector } from '@reduxjs/toolkit';
import { IRootState } from '@/store';
import {
  throttleUpload,
  clearUploadState,
  isUploadInProgress,
  isUploadThrottled,
  clearAllUploadStates,
} from './upload-utils';

// Add this line to ensure the Files tag is registered with RTK Query
baseApi.enhanceEndpoints({ addTagTypes: ['Files'] });

// Add type declaration for global window object
declare global {
  interface Window {
    activeUploads?: Map<string, AbortController>;
    xhrRequests?: Map<string, XMLHttpRequest>;
  }
}

// API response types from your backend
export interface UploadFileResponse {
  message: string;
  files: FileMetadata[];
}

export interface DownloadUrlResponse {
  url: string;
}

export interface BatchDownloadUrlResponse {
  urls: Record<string, string>;
}

export interface FileMetadataResponse {
  metadata: FileMetadata;
}

export interface ListFilesResponse {
  files: FileMetadata[];
}

export interface MessageResponse {
  message: string;
}

export interface BucketInfo {
  name: string;
  creationDate: Date;
}

export interface BucketsResponse {
  buckets: BucketInfo[];
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

// Base selector for accessing upload state
const selectUploadState = (state: IRootState) => state.upload;

// Generic selector for all files (not recommended to use directly)
export const selectAllFiles = createSelector(
  [selectUploadState],
  (uploadState) => uploadState.queue,
);

// Get files for a specific component by owner ID
export const selectFilesByOwnerId = (ownerId: string) =>
  createSelector([selectUploadState], (uploadState) =>
    uploadState.queue.filter((item) => item.ownerId === ownerId),
  );

// Get queue status for a specific component
export const selectQueueStatusByOwnerId = (ownerId: string) =>
  createSelector([selectUploadState], (uploadState) => {
    const componentFiles = uploadState.queue.filter((item) => item.ownerId === ownerId);

    // If no files for this component, it's idle
    if (componentFiles.length === 0) {
      return 'idle' as QueueStatus;
    }

    // Check if all files are completed or failed
    const allHandled = componentFiles.every(
      (item) => item.status === 'completed' || item.status === 'failed',
    );

    if (allHandled) {
      const anyFailed = componentFiles.some((item) => item.status === 'failed');
      return anyFailed ? ('failed' as QueueStatus) : ('completed' as QueueStatus);
    }

    // If any file is uploading, the queue is uploading
    const anyUploading = componentFiles.some((item) => item.status === 'uploading');
    if (anyUploading) {
      return 'uploading' as QueueStatus;
    }

    return 'selected' as QueueStatus;
  });

// Get current uploading file for a specific component
export const selectCurrentUploadingFileByOwnerId = (ownerId: string) =>
  createSelector([selectUploadState], (uploadState) => {
    return (
      uploadState.queue.find((item) => item.ownerId === ownerId && item.status === 'uploading') ||
      null
    );
  });

// Check if all files for a component have been handled (completed or failed)
export const selectAllFilesHandledByOwnerId = (ownerId: string) =>
  createSelector([selectUploadState], (uploadState) => {
    const componentFiles = uploadState.queue.filter((item) => item.ownerId === ownerId);

    // If no files, consider them "handled"
    if (componentFiles.length === 0) {
      return true;
    }

    // Check if all files are either completed or failed
    return componentFiles.every((item) => item.status === 'completed' || item.status === 'failed');
  });

// Get all uploaded files for a component
export const selectUploadedFilesByOwnerId = (ownerId: string) =>
  createSelector([selectUploadState], (uploadState) =>
    uploadState.queue.filter((item) => item.ownerId === ownerId && item.status === 'completed'),
  );

// Get all failed files for a component
export const selectFailedFilesByOwnerId = (ownerId: string) =>
  createSelector([selectUploadState], (uploadState) =>
    uploadState.queue.filter((item) => item.ownerId === ownerId && item.status === 'failed'),
  );

// Get a specific file by ID
export const selectFileById = (fileId: string) =>
  createSelector([selectUploadState], (uploadState) =>
    uploadState.queue.find((item) => item.id === fileId),
  );

// API endpoints
const filesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Upload a single file from the queue
    uploadSingleFile: builder.mutation<
      UploadFileResponse,
      {
        bucket: string;
        fileInfo: FileUploadInfo & { file?: File };
      }
    >({
      queryFn: async ({ bucket, fileInfo }, { signal, dispatch }) => {
        // Check if this file is already being uploaded
        if (isUploadInProgress(fileInfo.id)) {
          console.log(`Upload already in progress for file ${fileInfo.id}, skipping`);
          return { data: { message: 'Upload already in progress', files: [] } };
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

              // Prepare URL for upload
              const uploadUrl = `${baseUrl}files/upload/${bucket}`;

              xhr.open('POST', uploadUrl, true);

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
                // Validate file before uploading
                if (!fileInfo.file || fileInfo.file.size === 0) {
                  const errorMsg = 'Cannot upload empty file';
                  dispatch(
                    fileUploadFailure({
                      id: fileInfo.id,
                      errorMessage: errorMsg,
                    }),
                  );
                  cleanup();
                  reject({ status: 400, data: errorMsg });
                  return;
                }

                // Log the file details for debugging
                console.log('Uploading file:', {
                  name: fileInfo.file.name,
                  size: fileInfo.file.size,
                  type: fileInfo.file.type,
                });

                // Add file to form data
                formData.append('file', fileInfo.file);

                // Log form data entries for debugging
                for (const pair of formData.entries()) {
                  console.log(
                    pair[0],
                    pair[1] instanceof File
                      ? `File: ${pair[1].name}, ${pair[1].size} bytes`
                      : pair[1],
                  );
                }
              } else {
                const errorMsg = 'File object not provided for upload';
                dispatch(
                  fileUploadFailure({
                    id: fileInfo.id,
                    errorMessage: errorMsg,
                  }),
                );
                cleanup();
                reject({ status: 400, data: errorMsg });
                return;
              }

              xhr.send(formData);
            });
          } catch (error: any) {
            cleanup();

            // Don't report as error if it was aborted
            if (error.status === 'aborted' || controller.signal.aborted) {
              console.log('Upload aborted:', fileInfo.id);
              return { data: { message: 'Upload aborted', files: [] } };
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

    // Upload multiple files at once
    uploadMultipleFiles: builder.mutation<
      UploadFileResponse,
      { bucket: string; files: Array<FileUploadInfo & { file: File }> }
    >({
      queryFn: async ({ bucket, files }, { dispatch }) => {
        try {
          const results: FileMetadata[] = [];
          const errors: any[] = [];

          // Process files sequentially to avoid overwhelming the server
          for (const fileInfo of files) {
            try {
              const result = await dispatch(
                filesApi.endpoints.uploadSingleFile.initiate({
                  bucket,
                  fileInfo,
                }),
              ).unwrap();

              if (result.files && result.files.length > 0) {
                results.push(...result.files);
              }
            } catch (error) {
              errors.push(error);
              console.error(`Failed to upload file ${fileInfo.fileData.name}:`, error);
            }
          }

          if (errors.length > 0 && results.length === 0) {
            // If all uploads failed, throw the first error
            throw errors[0];
          }

          return { data: { message: 'Files uploaded successfully', files: results } };
        } catch (error: any) {
          return {
            error: {
              status: error.status || 500,
              data: error.data || 'Failed to upload files',
            },
          };
        }
      },
      invalidatesTags: ['Files'],
    }),

    // Get a file download URL
    getFileDownloadUrl: builder.query<
      DownloadUrlResponse,
      { bucket: string; filename: string; direct?: boolean }
    >({
      query: ({ bucket, filename, direct }) => {
        let url = `files/download/${bucket}/${filename}`;
        if (direct) {
          url += `?direct=true`;
        }
        return { url, method: 'GET' };
      },
      providesTags: ['Files'],
    }),

    // Get batch download URLs
    getBatchDownloadUrls: builder.query<
      BatchDownloadUrlResponse,
      { bucket: string; filenames: string[] }
    >({
      query: ({ bucket, filenames }) => {
        const url = `files/batch-download?bucket=${bucket}&filenames=${filenames.join(',')}`;
        return { url, method: 'GET' };
      },
      providesTags: ['Files'],
    }),

    // Get file metadata
    getFileMetadata: builder.query<FileMetadataResponse, { bucket: string; filename: string }>({
      query: ({ bucket, filename }) => ({
        url: `files/metadata/${bucket}/${filename}`,
        method: 'GET',
      }),
      providesTags: ['Files'],
    }),

    // List files in a bucket
    listFiles: builder.query<
      ListFilesResponse,
      { bucket: string; prefix?: string; recursive?: boolean }
    >({
      query: ({ bucket, prefix, recursive }) => {
        let url = `files/list/${bucket}`;
        const params = new URLSearchParams();

        if (prefix) params.append('prefix', prefix);
        if (recursive !== undefined) params.append('recursive', recursive.toString());

        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        return { url, method: 'GET' };
      },
      providesTags: ['Files'],
    }),

    // Delete a file
    deleteFile: builder.mutation<MessageResponse, { bucket: string; filename: string }>({
      query: ({ bucket, filename }) => ({
        url: `files/delete/${bucket}/${filename}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Files'],
    }),

    // List all buckets
    listBuckets: builder.query<BucketsResponse, void>({
      query: () => ({
        url: 'files/buckets',
        method: 'GET',
      }),
      providesTags: ['Files'],
    }),

    // Create a bucket
    createBucket: builder.mutation<
      MessageResponse,
      { name: string; region?: string; publicPolicy?: boolean }
    >({
      query: ({ name, region, publicPolicy }) => {
        let url = `files/buckets/${name}`;
        const params = new URLSearchParams();

        if (region) params.append('region', region);
        if (publicPolicy !== undefined) params.append('publicPolicy', publicPolicy.toString());

        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        return { url, method: 'POST' };
      },
      invalidatesTags: ['Files'],
    }),

    // Delete a bucket
    deleteBucket: builder.mutation<MessageResponse, { name: string; force?: boolean }>({
      query: ({ name, force }) => {
        let url = `files/buckets/${name}`;
        if (force !== undefined) {
          url += `?force=${force}`;
        }
        return { url, method: 'DELETE' };
      },
      invalidatesTags: ['Files'],
    }),
  }),
});

export const {
  useUploadSingleFileMutation,
  useUploadMultipleFilesMutation,
  useGetFileDownloadUrlQuery,
  useGetBatchDownloadUrlsQuery,
  useGetFileMetadataQuery,
  useListFilesQuery,
  useDeleteFileMutation,
  useListBucketsQuery,
  useCreateBucketMutation,
  useDeleteBucketMutation,
} = filesApi;
