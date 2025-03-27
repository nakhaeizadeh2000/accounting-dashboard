/**
 * Utility functions for file uploads
 */

/**
 * Format file size with appropriate units
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Round to 2 decimal places for precision
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${formattedSize} ${sizes[i]}`;
};

/**
 * Validate a file against size and type constraints
 */
export const validateFile = (
  file: File,
  acceptedFileTypes?: string,
  maxSizeMB?: number,
): { valid: boolean; reason?: string } => {
  // Validate file size
  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, reason: `${file.name}: File size exceeds ${maxSizeMB}MB limit` };
  }

  // Validate file type if acceptedFileTypes is specified
  if (acceptedFileTypes && acceptedFileTypes.trim() !== '') {
    const fileTypeAccepted = acceptedFileTypes.split(',').some((type) => {
      const trimmedType = type.trim();
      if (trimmedType.includes('/*')) {
        const generalType = trimmedType.split('/')[0];
        return file.type.startsWith(`${generalType}/`);
      }
      return file.type === trimmedType;
    });

    if (!fileTypeAccepted) {
      return { valid: false, reason: `${file.name}: File type is not accepted` };
    }
  }

  return { valid: true };
};

/**
 * Parse accepted file types into a user-friendly display format
 */
export const parseAcceptedTypes = (acceptedFileTypes?: string): string[] => {
  if (!acceptedFileTypes) return ['All Files'];

  return acceptedFileTypes.split(',').map((type) => {
    const trimmedType = type.trim();
    if (trimmedType.includes('/*')) {
      return `${trimmedType.split('/')[0].toUpperCase()} Files`;
    } else if (trimmedType.includes('/')) {
      return `.${trimmedType.split('/')[1].toUpperCase()}`;
    }
    return trimmedType.toUpperCase();
  });
};

/**
 * Generate a unique ID for a file
 */
export const generateFileId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};
