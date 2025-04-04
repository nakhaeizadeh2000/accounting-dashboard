/**
 * Helper functions for file operations
 */
import { FileMetadata } from './progress-slice';

/**
 * Gets appropriate file icon component based on MIME type
 *
 * @param mimetype The MIME type of the file
 * @returns Component name to use for the file icon
 */
export const getFileIconComponent = (mimetype: string): string => {
  if (mimetype.startsWith('image/')) {
    return 'ImageFileIcon';
  } else if (mimetype.startsWith('video/')) {
    return 'VideoFileIcon';
  } else if (mimetype.startsWith('audio/')) {
    return 'AudioFileIcon';
  } else if (mimetype.includes('pdf')) {
    return 'PDFFileIcon';
  } else if (
    mimetype.includes('zip') ||
    mimetype.includes('rar') ||
    mimetype.includes('tar') ||
    mimetype.includes('compressed')
  ) {
    return 'CompressedFileIcon';
  } else if (
    mimetype.includes('word') ||
    mimetype.includes('document') ||
    mimetype.includes('text/')
  ) {
    return 'DocumentFileIcon';
  } else if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) {
    return 'SpreadsheetFileIcon';
  } else if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) {
    return 'PresentationFileIcon';
  }

  return 'DocumentFileIcon'; // Default icon
};

/**
 * Format a file size for display
 *
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format a filename for display by truncating if too long
 *
 * @param name Original filename
 * @param maxLength Maximum length before truncating
 * @returns Truncated filename
 */
export const formatFileName = (name: string, maxLength: number = 20): string => {
  if (!name) return '';

  const extension = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  const baseName = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;

  // If the name is too long, truncate it and add ellipsis
  if (baseName.length > maxLength) {
    return `${baseName.slice(0, maxLength)}...${extension}`;
  }

  return name;
};

/**
 * Get file extension from filename
 *
 * @param filename The filename
 * @returns The file extension (without the dot)
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Format a date for display
 *
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Check if file is an image
 *
 * @param mimetype The MIME type of the file
 * @returns True if file is an image
 */
export const isImageFile = (mimetype: string): boolean => {
  return mimetype.startsWith('image/');
};

/**
 * Check if file is a video
 *
 * @param mimetype The MIME type of the file
 * @returns True if file is a video
 */
export const isVideoFile = (mimetype: string): boolean => {
  return mimetype.startsWith('video/');
};

/**
 * Check if file is an audio file
 *
 * @param mimetype The MIME type of the file
 * @returns True if file is an audio file
 */
export const isAudioFile = (mimetype: string): boolean => {
  return mimetype.startsWith('audio/');
};

/**
 * Check if file is a document
 *
 * @param mimetype The MIME type of the file
 * @returns True if file is a document
 */
export const isDocumentFile = (mimetype: string): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/html',
    'text/csv',
  ];

  return documentTypes.includes(mimetype);
};

/**
 * Get file type category
 *
 * @param mimetype The MIME type of the file
 * @returns Category of the file
 */
export const getFileTypeCategory = (
  mimetype: string,
): 'image' | 'audio' | 'video' | 'document' | 'compressed' | 'other' => {
  if (isImageFile(mimetype)) {
    return 'image';
  } else if (isAudioFile(mimetype)) {
    return 'audio';
  } else if (isVideoFile(mimetype)) {
    return 'video';
  } else if (
    mimetype.includes('pdf') ||
    mimetype.includes('document') ||
    mimetype.includes('text/') ||
    mimetype.includes('spreadsheet') ||
    mimetype.includes('presentation') ||
    mimetype.includes('excel') ||
    mimetype.includes('word') ||
    mimetype.includes('powerpoint')
  ) {
    return 'document';
  } else if (
    mimetype.includes('zip') ||
    mimetype.includes('rar') ||
    mimetype.includes('tar') ||
    mimetype.includes('compressed')
  ) {
    return 'compressed';
  } else {
    return 'other';
  }
};

/**
 * Get a human-readable file type name
 *
 * @param mimetype The MIME type of the file
 * @returns Human-readable file type name
 */
export const getReadableFileType = (mimetype: string): string => {
  const category = getFileTypeCategory(mimetype);

  if (category === 'image') {
    return mimetype.split('/')[1].toUpperCase() + ' Image';
  } else if (category === 'audio') {
    return mimetype.split('/')[1].toUpperCase() + ' Audio';
  } else if (category === 'video') {
    return mimetype.split('/')[1].toUpperCase() + ' Video';
  } else if (mimetype.includes('pdf')) {
    return 'PDF Document';
  } else if (mimetype.includes('word')) {
    return 'Word Document';
  } else if (mimetype.includes('excel')) {
    return 'Excel Spreadsheet';
  } else if (mimetype.includes('powerpoint')) {
    return 'PowerPoint Presentation';
  } else if (mimetype.includes('zip')) {
    return 'ZIP Archive';
  } else if (mimetype.includes('rar')) {
    return 'RAR Archive';
  }

  return mimetype.split('/')[1] || 'File';
};

/**
 * Check if a file should have a thumbnail
 *
 * @param metadata File metadata
 * @returns True if the file should have a thumbnail
 */
export const shouldHaveThumbnail = (metadata: FileMetadata): boolean => {
  return (
    !!metadata.thumbnailUrl || isImageFile(metadata.mimetype) || isVideoFile(metadata.mimetype)
  );
};

/**
 * Create appropriate download URL parameters for a file
 *
 * @param fileMetadata File metadata
 * @param options Additional options
 * @returns URL parameters for download
 */
export const createDownloadParams = (
  fileMetadata: FileMetadata,
  options?: { expiry?: number; direct?: boolean },
): string => {
  const params = new URLSearchParams();

  if (options?.expiry) {
    params.append('expiry', options.expiry.toString());
  }

  if (options?.direct !== undefined) {
    params.append('direct', options.direct.toString());
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Validate a file meets the requirements
 *
 * @param file The file to validate
 * @param options Validation options
 * @returns Error message if invalid, null if valid
 */
export const validateFile = (
  file: File,
  options: { maxSizeMB?: number; acceptedFileTypes?: string },
): string | null => {
  // Check file size
  if (options.maxSizeMB && file.size > options.maxSizeMB * 1024 * 1024) {
    return `File exceeds maximum size of ${options.maxSizeMB}MB`;
  }

  // Check file type
  if (options.acceptedFileTypes && options.acceptedFileTypes.trim() !== '') {
    const fileTypeAccepted = options.acceptedFileTypes.split(',').some((type) => {
      const trimmedType = type.trim();
      if (trimmedType.includes('/*')) {
        const generalType = trimmedType.split('/')[0];
        return file.type.startsWith(`${generalType}/`);
      }
      return file.type === trimmedType;
    });

    if (!fileTypeAccepted) {
      return `File type "${file.type}" is not accepted`;
    }
  }

  return null;
};

/**
 * Get MIME type based on file extension
 *
 * @param filename The filename to get MIME type for
 * @returns Best guess at the MIME type
 */
export const getMimeTypeFromFilename = (filename: string): string => {
  const extension = getFileExtension(filename).toLowerCase();

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    tar: 'application/x-tar',
    '7z': 'application/x-7z-compressed',
    txt: 'text/plain',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    xml: 'application/xml',
  };

  return mimeTypes[extension] || 'application/octet-stream';
};
