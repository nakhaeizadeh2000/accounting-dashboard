import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Define types
export type FileUploadStatus =
  | 'idle'
  | 'selected'
  | 'waiting'
  | 'uploading'
  | 'completed'
  | 'failed';
export type QueueStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';

export interface FileUploadInfo {
  id: string;
  fileData: {
    name: string;
    size: number;
    type: string;
  };
  status: FileUploadStatus;
  progress: number;
  bytesUploaded: number;
  errorMessage: string;
  response?: any;
  isUploading?: boolean; // Track if a file is actively being uploaded
}

interface UploadState {
  queue: FileUploadInfo[];
  queueStatus: QueueStatus;
  allFilesHandled: boolean;
  currentUploadIndex: number | null;
}

const initialState: UploadState = {
  queue: [],
  queueStatus: 'idle',
  allFilesHandled: false,
  currentUploadIndex: null,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    // Add files to the queue
    addFiles: (
      state,
      action: PayloadAction<{ name: string; size: number; type: string; id: string }[]>,
    ) => {
      const newFiles = action.payload.map((fileData) => ({
        id: fileData.id,
        fileData: {
          name: fileData.name,
          size: fileData.size,
          type: fileData.type,
        },
        status: 'selected' as FileUploadStatus,
        progress: 0,
        bytesUploaded: 0,
        errorMessage: '',
        isUploading: false,
      }));

      state.queue = [...state.queue, ...newFiles];

      if (
        state.queueStatus === 'idle' ||
        state.queueStatus === 'completed' ||
        state.queueStatus === 'failed'
      ) {
        state.queueStatus = 'selected';
      }

      state.allFilesHandled = false;
    },

    // Remove a file from the queue by ID
    removeFile: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter((item) => item.id !== action.payload);

      // Update queue status if empty
      if (state.queue.length === 0) {
        state.queueStatus = 'idle';
      } else {
        // Check if we need to update the queue status
        const hasIncomplete = state.queue.some(
          (item) => item.status !== 'completed' && item.status !== 'failed',
        );

        if (hasIncomplete) {
          state.queueStatus = 'selected';
          state.allFilesHandled = false;
        } else {
          // All files are either completed or failed
          const anyFailed = state.queue.some((item) => item.status === 'failed');
          state.queueStatus = anyFailed ? 'failed' : 'completed';
          state.allFilesHandled = true;
        }
      }
    },

    // Reset upload UI for selecting more files when all files are completed or failed
    resetUploadUI: (state) => {
      // Only change status to allow selecting more files
      // but keep existing files in the queue
      if (state.queueStatus === 'completed' || state.queueStatus === 'failed') {
        state.queueStatus = 'selected';
        state.allFilesHandled = false;
      }
    },

    // Clear all files from the queue
    clearQueue: (state) => {
      state.queue = [];
      state.queueStatus = 'idle';
      state.allFilesHandled = false;
      state.currentUploadIndex = null;
    },

    // Start the upload process
    startUpload: (state) => {
      if (state.queue.length === 0) return;

      // Mark all selected files as waiting
      state.queue = state.queue.map((item) =>
        item.status === 'selected' ? { ...item, status: 'waiting' } : item,
      );

      state.queueStatus = 'uploading';

      // Find the index of the first waiting file
      const nextIndex = state.queue.findIndex((item) => item.status === 'waiting');
      if (nextIndex !== -1) {
        state.currentUploadIndex = nextIndex;
        state.queue[nextIndex].status = 'uploading';
        state.queue[nextIndex].isUploading = true;
      }

      state.allFilesHandled = false;
    },

    // Update progress for the current file
    updateFileProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number; bytesUploaded: number }>,
    ) => {
      const { id, progress, bytesUploaded } = action.payload;
      const fileIndex = state.queue.findIndex((item) => item.id === id);

      if (fileIndex !== -1 && state.queue[fileIndex].isUploading) {
        state.queue[fileIndex].progress = progress;
        state.queue[fileIndex].bytesUploaded = bytesUploaded;
      }
    },

    // Set a file as actively uploading
    setFileUploading: (state, action: PayloadAction<string>) => {
      const fileIndex = state.queue.findIndex((item) => item.id === action.payload);
      if (fileIndex !== -1) {
        state.queue[fileIndex].isUploading = true;
      }
    },

    // Clear a file's uploading status
    clearFileUploading: (state, action: PayloadAction<string>) => {
      const fileIndex = state.queue.findIndex((item) => item.id === action.payload);
      if (fileIndex !== -1) {
        state.queue[fileIndex].isUploading = false;
      }
    },

    // Mark current file as completed and move to next
    fileUploadSuccess: (state, action: PayloadAction<{ id: string; response: any }>) => {
      const { id, response } = action.payload;
      const fileIndex = state.queue.findIndex((item) => item.id === id);

      if (fileIndex !== -1) {
        // Only update if the file is not already completed and is currently uploading
        // This prevents race conditions with multiple responses for the same file
        if (state.queue[fileIndex].status !== 'completed' && state.queue[fileIndex].isUploading) {
          state.queue[fileIndex].status = 'completed';
          state.queue[fileIndex].progress = 100;
          state.queue[fileIndex].response = response;
          state.queue[fileIndex].isUploading = false;

          // Only move to the next file if this was the current uploading file
          if (state.currentUploadIndex === fileIndex) {
            // Find next waiting file
            const nextIndex = state.queue.findIndex((item) => item.status === 'waiting');
            if (nextIndex !== -1) {
              state.currentUploadIndex = nextIndex;
              state.queue[nextIndex].status = 'uploading';
              state.queue[nextIndex].isUploading = true;
            } else {
              state.currentUploadIndex = null;

              // Check if all files are completed/failed
              const allHandled = state.queue.every(
                (item) => item.status === 'completed' || item.status === 'failed',
              );

              if (allHandled) {
                state.allFilesHandled = true;

                // Check if any files failed
                const anyFailed = state.queue.some((item) => item.status === 'failed');
                state.queueStatus = anyFailed ? 'failed' : 'completed';
              }
            }
          }
        }
      }
    },

    // Mark current file as failed and move to next
    fileUploadFailure: (state, action: PayloadAction<{ id: string; errorMessage: string }>) => {
      const { id, errorMessage } = action.payload;
      const fileIndex = state.queue.findIndex((item) => item.id === id);

      if (fileIndex !== -1) {
        // Don't mark a file as failed if it's already successfully completed
        // This prevents race conditions with multiple responses
        if (state.queue[fileIndex].status !== 'completed' && state.queue[fileIndex].isUploading) {
          state.queue[fileIndex].status = 'failed';
          state.queue[fileIndex].errorMessage = errorMessage;
          state.queue[fileIndex].isUploading = false;

          // Only move to the next file if this was the current uploading file
          if (state.currentUploadIndex === fileIndex) {
            // Find next waiting file
            const nextIndex = state.queue.findIndex((item) => item.status === 'waiting');
            if (nextIndex !== -1) {
              state.currentUploadIndex = nextIndex;
              state.queue[nextIndex].status = 'uploading';
              state.queue[nextIndex].isUploading = true;
            } else {
              state.currentUploadIndex = null;

              // Check if all files are completed/failed
              const allHandled = state.queue.every(
                (item) => item.status === 'completed' || item.status === 'failed',
              );

              if (allHandled) {
                state.allFilesHandled = true;

                // Check if any files failed
                const anyFailed = state.queue.some((item) => item.status === 'failed');
                state.queueStatus = anyFailed ? 'failed' : 'completed';
              }
            }
          }
        }
      }
    },

    // Cancel specific file upload
    cancelFileUpload: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      const fileIndex = state.queue.findIndex((item) => item.id === fileId);

      if (fileIndex !== -1) {
        // Don't cancel a file that's already successfully completed
        if (state.queue[fileIndex].status !== 'completed') {
          // If this is the currently uploading file
          if (state.currentUploadIndex === fileIndex) {
            state.queue[fileIndex].status = 'failed';
            state.queue[fileIndex].errorMessage = 'Upload cancelled';
            state.queue[fileIndex].isUploading = false;

            // Find next waiting file
            const nextIndex = state.queue.findIndex((item) => item.status === 'waiting');
            if (nextIndex !== -1) {
              state.currentUploadIndex = nextIndex;
              state.queue[nextIndex].status = 'uploading';
              state.queue[nextIndex].isUploading = true;
            } else {
              state.currentUploadIndex = null;

              // Check if all files are completed/failed
              const allHandled = state.queue.every(
                (item) => item.status === 'completed' || item.status === 'failed',
              );

              if (allHandled) {
                state.allFilesHandled = true;

                // Check if any files failed
                const anyFailed = state.queue.some((item) => item.status === 'failed');
                state.queueStatus = anyFailed ? 'failed' : 'completed';
              }
            }
          }
          // If it's a waiting file, just mark it as failed
          else if (state.queue[fileIndex].status === 'waiting') {
            state.queue[fileIndex].status = 'failed';
            state.queue[fileIndex].errorMessage = 'Upload cancelled';
            state.queue[fileIndex].isUploading = false;
          }
        }
      }
    },

    // Cancel all uploads
    cancelAllUploads: (state) => {
      state.queue = state.queue.map((item) => {
        if (item.status === 'uploading' || item.status === 'waiting') {
          return {
            ...item,
            status: 'failed',
            errorMessage: 'Upload cancelled',
            isUploading: false,
          };
        }
        return item;
      });

      state.queueStatus = 'failed';
      state.currentUploadIndex = null;
      state.allFilesHandled = true;
    },

    // Retry uploading a failed file
    retryFileUpload: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      const fileIndex = state.queue.findIndex((item) => item.id === fileId);

      if (
        fileIndex !== -1 &&
        state.queue[fileIndex].status === 'failed' &&
        !state.queue[fileIndex].isUploading
      ) {
        state.queue[fileIndex].status = 'waiting';
        state.queue[fileIndex].progress = 0;
        state.queue[fileIndex].bytesUploaded = 0;
        state.queue[fileIndex].errorMessage = '';

        // If no file is currently uploading, start this one
        if (state.currentUploadIndex === null) {
          state.currentUploadIndex = fileIndex;
          state.queue[fileIndex].status = 'uploading';
          state.queue[fileIndex].isUploading = true;
          state.queueStatus = 'uploading';
        }

        state.allFilesHandled = false;
      }
    },

    // Retry all failed uploads
    retryAllFailedUploads: (state) => {
      let foundWaiting = false;

      state.queue = state.queue.map((item) => {
        if (item.status === 'failed' && !item.isUploading) {
          return {
            ...item,
            status: 'waiting',
            progress: 0,
            bytesUploaded: 0,
            errorMessage: '',
          };
        }
        return item;
      });

      // Find first waiting file and start it
      const nextIndex = state.queue.findIndex((item) => item.status === 'waiting');
      if (nextIndex !== -1) {
        state.currentUploadIndex = nextIndex;
        state.queue[nextIndex].status = 'uploading';
        state.queue[nextIndex].isUploading = true;
        state.queueStatus = 'uploading';
        foundWaiting = true;
      }

      if (foundWaiting) {
        state.allFilesHandled = false;
      }
    },
  },
});

export const {
  addFiles,
  removeFile,
  resetUploadUI,
  clearQueue,
  startUpload,
  updateFileProgress,
  setFileUploading,
  clearFileUploading,
  fileUploadSuccess,
  fileUploadFailure,
  cancelFileUpload,
  cancelAllUploads,
  retryFileUpload,
  retryAllFailedUploads,
} = uploadSlice.actions;

export default uploadSlice.reducer;
