/**
 * Common file operations built on top of the RTK Query API
 * This module provides simplified functions for common file operations
 */
import { v4 as uuidv4 } from 'uuid';
import {
  useUploadSingleFileMutation,
  useUploadMultipleFilesMutation,
  useGetFileDownloadUrlQuery,
  useGetBatchDownloadUrlsQuery,
  useGetFileMetadataQuery,
  useDeleteFileMutation,
  useListFilesQuery,
  useListBucketsQuery,
  selectFilesByOwnerId,
  selectQueueStatusByOwnerId,
  selectCurrentUploadingFileByOwnerId,
  selectAllFilesHandledByOwnerId,
  selectUploadedFilesByOwnerId,
  selectFailedFilesByOwnerId,
  selectFileById,
} from './files.api';
import { FileMetadata } from './progress-slice';
import * as utils from './file-helpers';

/**
 * Simplified hook for file uploads
 *
 * @param bucket - The bucket name to upload to
 * @returns Upload function and loading state
 */
export const useFileUpload = (bucket = 'default') => {
  const [uploadSingleFileMutation, { isLoading }] = useUploadSingleFileMutation();

  /**
   * Upload a file
   *
   * @param file - The file to upload
   * @returns Upload result
   */
  const uploadFile = async (file: File) => {
    // Generate a unique component ID for this upload
    const ownerId = `upload-${uuidv4()}`;
    // Generate a unique ID for this file
    const fileId = `${ownerId}-${uuidv4()}`;

    // Prepare file info with proper ownerId
    const fileInfo = {
      id: fileId,
      ownerId: ownerId,
      fileData: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      status: 'uploading' as const,
      progress: 0,
      bytesUploaded: 0,
      errorMessage: '',
      file,
    };

    try {
      const response = await uploadSingleFileMutation({
        bucket,
        fileInfo,
      }).unwrap();

      // Extract data from the standard response structure
      const result = response.data || { message: 'Upload completed', files: [] };
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  return { uploadFile, isLoading };
};

/**
 * Simplified hook for batch file uploads
 *
 * @param bucket - The bucket name to upload to
 * @returns Batch upload function and loading state
 */
export const useBatchFileUpload = (bucket = 'default') => {
  const [uploadMultipleFilesMutation, { isLoading }] = useUploadMultipleFilesMutation();

  /**
   * Upload multiple files at once
   *
   * @param files - The files to upload
   * @returns Upload result
   */
  const uploadFiles = async (files: File[]) => {
    // Generate a unique component ID for this batch upload
    const ownerId = `batch-upload-${uuidv4()}`;

    // Convert files array to the format expected by the API
    const fileInfos = files.map((file) => {
      const fileId = `${ownerId}-${uuidv4()}`;

      return {
        id: fileId,
        ownerId: ownerId,
        fileData: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        status: 'uploading' as const,
        progress: 0,
        bytesUploaded: 0,
        errorMessage: '',
        file,
      };
    });

    try {
      // Use common options for all files or let the backend determine per-file
      const response = await uploadMultipleFilesMutation({
        bucket,
        files: fileInfos,
      }).unwrap();

      // Extract data from the standard response structure
      const result = response.data || { message: 'Upload completed', files: [] };
      return result;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };

  return { uploadFiles, isLoading };
};

/**
 * Get a download URL or directly download a file
 *
 * @param metadata - File metadata
 * @param options - Download options
 */
export const downloadFile = async (metadata: FileMetadata, options?: { direct?: boolean }) => {
  // Determine if we should use direct download
  const useDirect = options?.direct ?? isDirectDownloadType(metadata.mimetype);

  if (useDirect) {
    // For direct download, navigate to the URL with direct=true
    const downloadUrl = `/api/files/download/${metadata.bucket}/${metadata.uniqueName}?direct=true`;
    window.location.href = downloadUrl;
  } else {
    // Use the pre-signed URL if available, otherwise fetch one
    if (metadata.url) {
      window.open(metadata.url, '_blank');
    } else {
      // We would fetch here, but we should always have a URL in the metadata
      console.warn('No URL available in metadata - unexpected state');
    }
  }
};

/**
 * Determine if this file type should use direct download
 */
export const isDirectDownloadType = (mimetype: string): boolean => {
  return ['image/', 'video/', 'audio/'].some((prefix) => mimetype.startsWith(prefix));
};

/**
 * Open a file's thumbnail for preview
 *
 * @param metadata - File metadata
 */
export const previewThumbnail = (metadata: FileMetadata) => {
  if (metadata.thumbnailUrl) {
    window.open(metadata.thumbnailUrl, '_blank');
  } else if (metadata.url && utils.isImageFile(metadata.mimetype)) {
    // If no thumbnail but it's an image, use the main URL
    window.open(metadata.url, '_blank');
  }
};

/**
 * Check if a file should have a thumbnail
 * With the new implementation, only images have thumbnails generated
 */
export const shouldHaveThumbnail = (metadata: FileMetadata): boolean => {
  return !!metadata.thumbnailUrl || utils.isImageFile(metadata.mimetype);
};

/**
 * Hook to get list of files with metadata from a bucket
 *
 * @param bucket - The bucket name
 * @param options - Query options
 * @returns Files and query state
 */
export const useFilesList = (
  bucket: string,
  options?: { prefix?: string; recursive?: boolean; skip?: boolean },
) => {
  const { prefix, recursive, skip } = options || {};

  const result = useListFilesQuery(
    {
      bucket,
      prefix,
      recursive,
    },
    { skip },
  );

  return {
    // Extract files from the nested data structure
    files: result.data?.data?.files || [],
    ...result,
  };
};

/**
 * Hook to delete a file with confirmation
 *
 * @returns Delete function and loading state
 */
export const useDeleteFile = () => {
  const [deleteFileMutation, { isLoading }] = useDeleteFileMutation();

  /**
   * Delete a file with confirmation
   *
   * @param metadata - File metadata
   * @param skipConfirmation - Whether to skip the confirmation dialog
   * @returns Delete result
   */
  const deleteFile = async (metadata: FileMetadata, skipConfirmation = false) => {
    // Ask for confirmation
    if (!skipConfirmation) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${metadata.originalName}"?`,
      );
      if (!confirmed) {
        return null;
      }
    }

    try {
      const response = await deleteFileMutation({
        bucket: metadata.bucket,
        filename: metadata.uniqueName,
      }).unwrap();

      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  };

  return { deleteFile, isDeleting: isLoading };
};

/**
 * Hook to get detailed file metadata
 *
 * @param bucket - The bucket name
 * @param filename - The filename
 * @param skip - Whether to skip the query
 * @returns File metadata and query state
 */
export const useFileMetadata = (bucket: string, filename: string, skip = false) => {
  const result = useGetFileMetadataQuery(
    {
      bucket,
      filename,
    },
    { skip },
  );

  return {
    // Extract metadata from the nested data structure
    metadata: result.data?.data?.metadata,
    ...result,
  };
};

/**
 * Hook to get a list of available buckets
 *
 * @returns Buckets and query state
 */
export const useBucketsList = () => {
  const result = useListBucketsQuery();

  return {
    // Extract buckets from the nested data structure
    buckets: result.data?.data?.buckets || [],
    ...result,
  };
};

/**
 * Hook to get batch download URLs
 */
export const useBatchDownloadUrls = (
  bucket: string,
  filenames: string[],
  options?: { skip?: boolean },
) => {
  const { skip } = options || {};

  const result = useGetBatchDownloadUrlsQuery(
    {
      bucket,
      filenames,
    },
    { skip },
  );

  return {
    // Extract URLs from the nested data structure
    urls: result.data?.data?.urls || {},
    ...result,
  };
};

// Export utility functions from the file-helpers
export const {
  formatFileSize,
  formatFileName,
  formatDate,
  getFileExtension,
  isImageFile,
  isVideoFile,
  isAudioFile,
  isDocumentFile,
  validateFile,
} = utils;
