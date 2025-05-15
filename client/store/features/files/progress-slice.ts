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

// File metadata from the API response
export interface FileMetadata {
  originalName: string;
  uniqueName: string;
  size: number;
  mimetype: string;
  thumbnailName?: string;
  url: string;
  thumbnailUrl?: string;
  bucket: string;
  uploadedAt: Date;
}

// Our local file tracking data
export interface FileUploadInfo {
  id: string; // Unique ID for the file
  ownerId: string; // Component ID that owns this file
  fileData: {
    name: string;
    size: number;
    type: string;
  };
  status: FileUploadStatus;
  progress: number;
  bytesUploaded: number;
  errorMessage: string;
  response?: any; // API response data
  metadata?: FileMetadata; // Structured metadata from the server
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
    // Add files to the queue with a specific component owner
    addFiles: (
      state,
      action: PayloadAction<{
        ownerId: string;
        files: { name: string; size: number; type: string; id: string }[];
      }>,
    ) => {
      const { ownerId, files } = action.payload;

      const newFiles = files.map((fileData) => ({
        id: fileData.id,
        ownerId: ownerId, // Associate files with their owner component
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
    },

    // Remove a file from the queue by ID
    removeFile: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter((item) => item.id !== action.payload);
    },

    // Remove all files for a specific component
    removeFilesForComponent: (state, action: PayloadAction<string>) => {
      const ownerId = action.payload;
      state.queue = state.queue.filter((item) => item.ownerId !== ownerId);
    },

    // Reset upload UI for a specific component
    resetUploadUI: (state, action: PayloadAction<string>) => {
      // This doesn't affect the files themselves, just enables selecting more
      // We'll handle this at the component level
    },

    // Clear all files from the queue for a specific component
    clearComponentQueue: (state, action: PayloadAction<string>) => {
      const ownerId = action.payload;
      state.queue = state.queue.filter((item) => item.ownerId !== ownerId);
    },

    // Start the upload process for a specific component
    startUpload: (state, action: PayloadAction<string>) => {
      const ownerId = action.payload;
      const componentFiles = state.queue.filter((item) => item.ownerId === ownerId);

      if (componentFiles.length === 0) return;

      // Mark all selected files as waiting for this component
      state.queue = state.queue.map((item) =>
        item.ownerId === ownerId && item.status === 'selected'
          ? { ...item, status: 'waiting' }
          : item,
      );

      // Find the index of the first waiting file for this component
      const fileIndex = state.queue.findIndex(
        (item) => item.ownerId === ownerId && item.status === 'waiting',
      );

      if (fileIndex !== -1) {
        state.queue[fileIndex].status = 'uploading';
        state.queue[fileIndex].isUploading = true;
      }
    },

    // Update progress for a file
    updateFileProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number; bytesUploaded: number }>,
    ) => {
      const { id, progress, bytesUploaded } = action.payload;
      const fileIndex = state.queue.findIndex((item) => item.id === id);

      if (fileIndex !== -1) {
        // Always maintain 'uploading' status during progress updates
        state.queue[fileIndex].progress = progress;
        state.queue[fileIndex].bytesUploaded = bytesUploaded;

        // Ensure status remains 'uploading' during progress updates
        if (state.queue[fileIndex].isUploading && state.queue[fileIndex].status !== 'uploading') {
          state.queue[fileIndex].status = 'uploading';
        }
      }
    },

    // Set a file as actively uploading
    setFileUploading: (state, action: PayloadAction<string>) => {
      const fileIndex = state.queue.findIndex((item) => item.id === action.payload);
      if (fileIndex !== -1) {
        state.queue[fileIndex].isUploading = true;
        state.queue[fileIndex].status = 'uploading';
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
        // Only update if the file is not already completed
        if (state.queue[fileIndex].status !== 'completed') {
          const ownerId = state.queue[fileIndex].ownerId;

          // Important: ensure these fields are set correctly
          state.queue[fileIndex].status = 'completed';
          state.queue[fileIndex].progress = 100; // Always set to 100% when completed
          state.queue[fileIndex].response = response;
          state.queue[fileIndex].isUploading = false;

          // Extract file metadata from the response if available
          if (response.files && response.files.length > 0) {
            // Try to find the matching file in the response by comparing names
            const fileData = state.queue[fileIndex].fileData;
            const matchingFile = response.files.find(
              (file: FileMetadata) => file.originalName === fileData.name,
            );

            if (matchingFile) {
              state.queue[fileIndex].metadata = matchingFile;
            } else {
              // If no exact match, just use the first file from the response
              state.queue[fileIndex].metadata = response.files[0];
            }
          }

          // Find next waiting file for the same component
          const nextIndex = state.queue.findIndex(
            (item) => item.ownerId === ownerId && item.status === 'waiting',
          );

          if (nextIndex !== -1) {
            state.queue[nextIndex].status = 'uploading';
            state.queue[nextIndex].isUploading = true;
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
        if (state.queue[fileIndex].status !== 'completed') {
          const ownerId = state.queue[fileIndex].ownerId;
          state.queue[fileIndex].status = 'failed';
          state.queue[fileIndex].errorMessage = errorMessage;
          state.queue[fileIndex].isUploading = false;

          // Find next waiting file for the same component
          const nextIndex = state.queue.findIndex(
            (item) => item.ownerId === ownerId && item.status === 'waiting',
          );

          if (nextIndex !== -1) {
            state.queue[nextIndex].status = 'uploading';
            state.queue[nextIndex].isUploading = true;
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
          const ownerId = state.queue[fileIndex].ownerId;

          // Mark this file as failed
          state.queue[fileIndex].status = 'failed';
          state.queue[fileIndex].errorMessage = 'Upload cancelled';
          state.queue[fileIndex].isUploading = false;

          // Find next waiting file for the same component
          const nextIndex = state.queue.findIndex(
            (item) => item.ownerId === ownerId && item.status === 'waiting',
          );

          if (nextIndex !== -1) {
            state.queue[nextIndex].status = 'uploading';
            state.queue[nextIndex].isUploading = true;
          }
        }
      }
    },

    // Cancel all uploads for a specific component
    cancelComponentUploads: (state, action: PayloadAction<string>) => {
      const ownerId = action.payload;

      state.queue = state.queue.map((item) => {
        if (
          item.ownerId === ownerId &&
          (item.status === 'uploading' || item.status === 'waiting')
        ) {
          return {
            ...item,
            status: 'failed',
            errorMessage: 'Upload cancelled',
            isUploading: false,
          };
        }
        return item;
      });
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
        const ownerId = state.queue[fileIndex].ownerId;
        state.queue[fileIndex].status = 'waiting';
        state.queue[fileIndex].progress = 0;
        state.queue[fileIndex].bytesUploaded = 0;
        state.queue[fileIndex].errorMessage = '';

        // Check if any file from this component is currently uploading
        const isAnyUploading = state.queue.some(
          (item) => item.ownerId === ownerId && item.status === 'uploading',
        );

        // If no file is currently uploading, start this one
        if (!isAnyUploading) {
          state.queue[fileIndex].status = 'uploading';
          state.queue[fileIndex].isUploading = true;
        }
      }
    },

    // Retry all failed uploads for a specific component
    retryComponentFailedUploads: (state, action: PayloadAction<string>) => {
      const ownerId = action.payload;
      let hasStartedOne = false;

      // Check if any file from this component is already uploading
      const isAnyUploading = state.queue.some(
        (item) => item.ownerId === ownerId && item.status === 'uploading',
      );

      state.queue = state.queue.map((item) => {
        if (item.ownerId === ownerId && item.status === 'failed' && !item.isUploading) {
          // If no file is uploading and we haven't started one yet, make this one uploading
          if (!isAnyUploading && !hasStartedOne) {
            hasStartedOne = true;
            return {
              ...item,
              status: 'uploading',
              progress: 0,
              bytesUploaded: 0,
              errorMessage: '',
              isUploading: true,
            };
          } else {
            // Otherwise, mark it as waiting
            return {
              ...item,
              status: 'waiting',
              progress: 0,
              bytesUploaded: 0,
              errorMessage: '',
              isUploading: false,
            };
          }
        }
        return item;
      });
    },
  },
});

export const {
  addFiles,
  removeFile,
  removeFilesForComponent,
  resetUploadUI,
  clearComponentQueue,
  startUpload,
  updateFileProgress,
  setFileUploading,
  clearFileUploading,
  fileUploadSuccess,
  fileUploadFailure,
  cancelFileUpload,
  cancelComponentUploads,
  retryFileUpload,
  retryComponentFailedUploads,
} = uploadSlice.actions;

export default uploadSlice.reducer;
