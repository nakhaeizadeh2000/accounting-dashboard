/**
 * Utility functions for formatting file information
 */

/**
 * Format filename for better display by truncating if too long
 * @param name Original filename
 * @param maxLength Maximum length to allow before truncating
 * @returns Formatted filename
 */
export const formatFileName = (name: string, maxLength: number = 15): string => {
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
 * Format file size with appropriate units
 * @param bytes File size in bytes
 * @returns Formatted file size string
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
 * Format date for display
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get status text for display
 * @param status The current file status
 * @param isCancelled Whether the file was cancelled
 * @param language The current language setting
 * @param translations The translations object
 * @returns Localized status text
 */
export const getStatusText = (
  status: string,
  isCancelled: boolean,
  language: 'fa' | 'en',
  translations: Record<'fa' | 'en', Record<string, string>>,
): string => {
  const texts = translations[language];

  // Override status text for cancelled files
  if (isCancelled) {
    return texts.cancelled;
  }

  switch (status) {
    case 'uploading':
      return texts.uploading;
    case 'waiting':
      return texts.queued;
    case 'completed':
      return texts.completed;
    case 'failed':
      return texts.failed;
    case 'selected':
      return texts.ready;
    default:
      return status;
  }
};
