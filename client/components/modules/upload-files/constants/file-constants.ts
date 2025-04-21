/**
 * Constants used throughout the file upload components
 */

// Default bucket name
export const DEFAULT_BUCKET = 'default';

// Default maximum file size in MB
export const DEFAULT_MAX_FILE_SIZE_MB = 10;

// Default language
export const DEFAULT_LANGUAGE = 'fa' as const;

// Default accepted file types for single file upload
export const DEFAULT_SINGLE_ACCEPTED_FILE_TYPES = '';

// Default accepted file types for multi file upload
export const DEFAULT_MULTI_ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,application/pdf';

// MIME types that should be streamed directly rather than using presigned URLs
export const DIRECT_DOWNLOAD_MIME_TYPES = 'image/,video/,audio/';

// Default thumbnail size in pixels
export const DEFAULT_THUMBNAIL_SIZE = 300;

// Default thumbnail prefix
export const DEFAULT_THUMBNAIL_PREFIX = 'thumb_';

// Default expiry time for presigned URLs in seconds (24 hours)
export const DEFAULT_PRESIGNED_URL_EXPIRY = 86400;

// File type categories for icon mapping
export const FILE_TYPE_CATEGORIES = {
  IMAGE: 'image/',
  VIDEO: 'video/',
  AUDIO: 'audio/',
  COMPRESSED: ['zip', 'rar', 'compressed'],
  DOCUMENT: 'document', // Default
};

// Default pagination values
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Throttle values for uploads (ms)
export const UPLOAD_THROTTLE_INTERVAL = 100;

// Debounce time for user interactions (ms)
export const INPUT_DEBOUNCE_TIME = 300;

// Delay for auto-starting upload (ms)
export const AUTO_START_DELAY = 100;

// Cache duration for file information (ms)
export const FILE_CACHE_DURATION = 2000;

// Default constraints for files when none provided
export const DEFAULT_FILE_TYPES = ['PDF', 'DOCX', 'TXT'];
