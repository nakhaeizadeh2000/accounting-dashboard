/**
 * Helper functions for file operations
 */

/**
 * Format a file size for display
 *
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format a date for display
 *
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

/**
 * Get file extension from filename
 *
 * @param filename The filename
 * @returns The file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Truncate filename for better display
 *
 * @param filename The filename to truncate
 * @param maxLength Maximum length before truncating
 * @returns Truncated filename
 */
export function truncateFilename(filename: string, maxLength: number = 20): string {
  if (filename.length <= maxLength) return filename;

  const extension = getFileExtension(filename);
  const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));

  if (nameWithoutExtension.length <= maxLength - 3 - extension.length) {
    return filename;
  }

  return `${nameWithoutExtension.substring(0, maxLength - 3 - extension.length)}...${extension}`;
}

/**
 * Determine the general category of a file based on its MIME type
 *
 * @param fileType The file's MIME type
 * @returns The category of the file
 */
export function getFileTypeCategory(
  fileType: string,
): 'image' | 'audio' | 'video' | 'document' | 'compressed' | 'folder' | 'other' {
  if (fileType === 'directory' || fileType === 'folder') {
    return 'folder';
  } else if (fileType.startsWith('image/')) {
    return 'image';
  } else if (fileType.startsWith('audio/')) {
    return 'audio';
  } else if (fileType.startsWith('video/')) {
    return 'video';
  } else if (
    fileType.includes('pdf') ||
    fileType.includes('document') ||
    fileType.includes('text/') ||
    fileType.includes('spreadsheet') ||
    fileType.includes('presentation') ||
    fileType.includes('excel') ||
    fileType.includes('word') ||
    fileType.includes('powerpoint')
  ) {
    return 'document';
  } else if (
    fileType.includes('zip') ||
    fileType.includes('rar') ||
    fileType.includes('tar') ||
    fileType.includes('7z') ||
    fileType.includes('compressed')
  ) {
    return 'compressed';
  } else {
    return 'other';
  }
}

/**
 * Get MIME type from file extension
 *
 * @param filename The file to get the MIME type for
 * @returns Best guess at the MIME type
 */
export function getMimeTypeFromExtension(filename: string): string {
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
}

/**
 * Check if a file should have a thumbnail
 *
 * @param file The file to check
 * @returns True if the file should have a thumbnail
 */
export function shouldHaveThumbnail(file: { type: string; thumbnailUrl?: string }): boolean {
  return !!file.thumbnailUrl || file.type.startsWith('image/') || file.type.startsWith('video/');
}

/**
 * Check if a file is an image
 *
 * @param fileType The MIME type to check
 * @returns True if the file is an image
 */
export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/');
}

/**
 * Check if a file is a video
 *
 * @param fileType The MIME type to check
 * @returns True if the file is a video
 */
export function isVideoFile(fileType: string): boolean {
  return fileType.startsWith('video/');
}

/**
 * Check if a file is an audio file
 *
 * @param fileType The MIME type to check
 * @returns True if the file is an audio file
 */
export function isAudioFile(fileType: string): boolean {
  return fileType.startsWith('audio/');
}

/**
 * Check if a file is a document
 *
 * @param fileType The MIME type to check
 * @returns True if the file is a document
 */
export function isDocumentFile(fileType: string): boolean {
  return (
    fileType.includes('pdf') ||
    fileType.includes('document') ||
    fileType.includes('text/') ||
    fileType.includes('msword') ||
    fileType.includes('excel') ||
    fileType.includes('powerpoint') ||
    fileType.includes('spreadsheet') ||
    fileType.includes('presentation')
  );
}

/**
 * Get appropriate download options based on file type
 *
 * @param fileType The MIME type of the file
 * @returns Download options
 */
export function getDownloadOptionsForFileType(fileType: string): {
  direct: boolean;
  expiry: number;
} {
  // For images, videos, and audio, use direct streaming with a shorter expiry
  if (isImageFile(fileType) || isVideoFile(fileType) || isAudioFile(fileType)) {
    return {
      direct: true,
      expiry: 3600, // 1 hour
    };
  }

  // For other files, use presigned URLs with longer expiry
  return {
    direct: false,
    expiry: 86400, // 24 hours
  };
}

/**
 * Get file type based on extension (add this to your fileHelpers.ts)
 * Useful when mimetype is not correctly determined (e.g., application/octet-stream)
 *
 * @param filename The filename to get the type for
 * @returns The proper mimetype based on file extension
 */
export function getFileTypeFromExtension(filename: string): string {
  const extension = getFileExtension(filename).toLowerCase();

  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif'].includes(extension)) {
    return extension === 'svg'
      ? 'image/svg+xml'
      : `image/${extension === 'jpg' ? 'jpeg' : extension}`;
  }

  // Video files
  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv', '3gp'].includes(extension)) {
    return `video/${extension === 'mov' ? 'quicktime' : extension}`;
  }

  // Audio files
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(extension)) {
    return `audio/${extension}`;
  }

  // Document files
  const documentTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    rtf: 'application/rtf',
    csv: 'text/csv',
    html: 'text/html',
    htm: 'text/html',
    xml: 'application/xml',
    json: 'application/json',
  };

  if (extension in documentTypes) {
    return documentTypes[extension];
  }

  // Compressed files
  const archiveTypes: Record<string, string> = {
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
  };

  if (extension in archiveTypes) {
    return archiveTypes[extension];
  }

  // Default to the original type if we can't determine it
  return 'application/octet-stream';
}
