/**
 * Validation utilities for file uploads
 */

/**
 * Validates a file against size and type restrictions
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in megabytes
 * @param acceptedFileTypes Comma-separated string of accepted MIME types (e.g. "image/*,application/pdf")
 * @returns Object with validation result and error message
 */
export const validateFile = (
  file: File,
  maxSizeMB?: number,
  acceptedFileTypes?: string,
): { valid: boolean; error?: string } => {
  // Check for empty files
  if (file.size === 0) {
    return {
      valid: false,
      error: `File "${file.name}" is empty and cannot be uploaded`,
    };
  }

  // Check file size
  if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the size limit of ${maxSizeMB}MB`,
    };
  }

  // Check file type
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
      return {
        valid: false,
        error: `File "${file.name}" type ${file.type} is not accepted`,
      };
    }
  }

  // All validations passed
  return { valid: true };
};

/**
 * Validates multiple files against size and type restrictions
 * @param files Array of files to validate
 * @param maxSizeMB Maximum file size in megabytes
 * @param acceptedFileTypes Comma-separated string of accepted MIME types
 * @returns Object with valid files array and error message
 */
export const validateFiles = (
  files: File[],
  maxSizeMB?: number,
  acceptedFileTypes?: string,
): { validFiles: File[]; error?: string } => {
  const validFiles: File[] = [];
  let errorMessage: string | undefined;

  for (const file of files) {
    const validation = validateFile(file, maxSizeMB, acceptedFileTypes);

    if (validation.valid) {
      validFiles.push(file);
    } else if (!errorMessage) {
      // Store the first error message
      errorMessage = validation.error;
    }
  }

  // Special case: if we had files but none passed validation
  if (files.length > 0 && validFiles.length === 0 && !errorMessage) {
    errorMessage = 'None of the selected files could be uploaded due to validation errors.';
  }

  return { validFiles, error: errorMessage };
};

/**
 * Checks if a file should be treated as direct download
 * @param mimetype MIME type of the file
 * @param directDownloadTypes Comma-separated list of MIME type patterns for direct download
 * @returns Boolean indicating if the file should be streamed directly
 */
export const shouldStreamDirectly = (
  mimetype: string,
  directDownloadTypes: string = 'image/,video/,audio/',
): boolean => {
  if (!directDownloadTypes) return false;

  return directDownloadTypes.split(',').some((type) => mimetype.startsWith(type.trim()));
};
