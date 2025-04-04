/**
 * File system API module entry point.
 * This file exports all necessary API functions, hooks, and types for the file system.
 */

// Export types from the progress slice
export * from './progress-slice';

// Export all API hooks and types
export {
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
  cancelUploadRequest,
  // Selectors
  selectFilesByOwnerId,
  selectQueueStatusByOwnerId,
  selectCurrentUploadingFileByOwnerId,
  selectAllFilesHandledByOwnerId,
  selectUploadedFilesByOwnerId,
  selectFailedFilesByOwnerId,
  selectFileById,
  // Response types
  type UploadFileResponse,
  type DownloadUrlResponse,
  type BatchDownloadUrlResponse,
  type FileMetadataResponse,
  type ListFilesResponse,
  type MessageResponse,
  type BucketInfo,
  type BucketsResponse,
  type FileUploadOptions,
} from './files.api';

// Export the simplified file operation hooks
export {
  useFileUpload,
  useBatchFileUpload,
  downloadFile,
  previewThumbnail,
  useFilesList,
  useDeleteFile,
  useFileMetadata,
  useBucketsList,
  useBatchDownloadUrls,
  shouldHaveThumbnail,
  getDownloadOptionsForMimeType,
  // Utility functions
  formatFileSize,
  formatFileName,
  formatDate,
  getFileExtension,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isDocumentFile,
  validateFile,
} from './file-operations';

// Export the custom upload hooks for components
export { default as useSingleFileUpload } from '@/components/modules/upload-files/hook/useSingleFileUpload';
export { default as useMultiFileUpload } from '@/components/modules/upload-files/hook/useMultiFileUpload';

// Export from upload-utils
export {
  throttleUpload,
  isUploadThrottled,
  isUploadInProgress,
  clearUploadState,
  clearAllUploadStates,
  DEFAULT_UPLOAD_OPTIONS,
  getUploadOptionsForFile,
  createFileInfo,
  generateUniqueId,
} from './upload-utils';
