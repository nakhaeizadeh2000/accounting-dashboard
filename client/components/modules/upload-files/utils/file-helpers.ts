/**
 * Utility functions for file operations
 */
import { FileMetadata, FileUploadInfo } from './file-types';

/**
 * Determines if a file should have a thumbnail based on its MIME type
 * @param file File metadata or MIME type string
 * @returns Boolean indicating if the file should have a thumbnail
 */
export const shouldHaveThumbnail = (file: FileMetadata | string): boolean => {
  const mimetype = typeof file === 'string' ? file : file.mimetype;
  return mimetype.startsWith('image/');
};

/**
 * Maps file extensions to appropriate icons
 * @param fileType MIME type of the file
 * @returns Icon component to use for the file type
 */
export const getFileIconType = (fileType: string): string => {
  if (fileType.startsWith('image/')) {
    return 'image';
  } else if (fileType.startsWith('video/')) {
    return 'video';
  } else if (fileType.startsWith('audio/')) {
    return 'audio';
  } else if (
    fileType.includes('zip') ||
    fileType.includes('rar') ||
    fileType.includes('compressed')
  ) {
    return 'compressed';
  } else {
    return 'document'; // Default icon
  }
};

/**
 * Creates a unique filename to prevent collisions
 * @param originalName Original file name
 * @returns Unique filename based on original name plus timestamp and random string
 */
export const createUniqueFilename = (originalName: string): string => {
  const extension = originalName.includes('.')
    ? originalName.slice(originalName.lastIndexOf('.'))
    : '';

  const baseName = originalName.includes('.')
    ? originalName.slice(0, originalName.lastIndexOf('.'))
    : originalName;

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);

  return `${baseName}-${timestamp}-${randomStr}${extension}`;
};

/**
 * Checks if a MIME type is allowed based on acceptedFileTypes string
 * @param mimetype MIME type to check
 * @param acceptedFileTypes Comma-separated list of allowed types (e.g. "image/*,application/pdf")
 * @returns Boolean indicating if the MIME type is allowed
 */
export const isMimeTypeAllowed = (mimetype: string, acceptedFileTypes?: string): boolean => {
  if (!acceptedFileTypes || acceptedFileTypes.trim() === '') {
    return true; // No restrictions
  }

  return acceptedFileTypes.split(',').some((type) => {
    const trimmedType = type.trim();
    if (trimmedType.includes('/*')) {
      const generalType = trimmedType.split('/')[0];
      return mimetype.startsWith(`${generalType}/`);
    }
    return mimetype === trimmedType;
  });
};

/**
 * Downloads a file using its metadata
 * @param file File metadata containing URL
 */
export const downloadFile = (file: FileMetadata): void => {
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.originalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Opens a thumbnail preview in a new tab
 * @param file File metadata containing thumbnail URL
 */
export const previewThumbnail = (file: FileMetadata): void => {
  if (file.thumbnailUrl) {
    window.open(file.thumbnailUrl, '_blank');
  } else if (file.url) {
    window.open(file.url, '_blank');
  }
};

/**
 * Generates an array of display constraints from accepted file types and max size
 * @param acceptedFileTypes Comma-separated list of allowed MIME types
 * @param maxSizeMB Maximum file size in MB
 * @returns Array of formatted constraints for display
 */
export const generateDisplayConstraints = (
  acceptedFileTypes?: string,
  maxSizeMB?: number,
): string[] => {
  // Parse allowed file types if provided
  const allowedTypes = acceptedFileTypes
    ? acceptedFileTypes
      .split(',')
      .map((type) =>
        type.includes('/*')
          ? type.split('/')[0].toUpperCase()
          : `.${type.split('/')[1].toUpperCase()}`,
      )
    : ['PDF', 'DOCX', 'TXT'];

  // Add max size to displayed constraints
  const displayConstraints = [...allowedTypes];
  if (maxSizeMB) {
    displayConstraints.push(`< ${maxSizeMB}MB`);
  }

  return displayConstraints;
};
