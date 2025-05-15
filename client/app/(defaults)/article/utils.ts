// app/article/utils.ts
import { ResponseArticleDto } from '@/store/features/article/article.model';
import { format } from 'date-fns';

/**
 * Format date string for display
 * @param dateString Date string to format
 * @param formatStr Format string (default: 'yyyy/MM/dd HH:mm')
 * @returns Formatted date string
 */
export const formatArticleDate = (
  dateString: string | Date,
  formatStr: string = 'yyyy/MM/dd HH:mm',
): string => {
  try {
    const date = new Date(dateString);
    return format(date, formatStr);
  } catch (err) {
    console.error('Invalid date format:', err);
    return 'تاریخ نامعتبر';
  }
};

/**
 * Truncate text to a specific length and add ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Get article title or a fallback if empty
 * @param article Article object
 * @returns Article title or fallback
 */
export const getArticleTitle = (article: ResponseArticleDto): string => {
  return article.title || 'مقاله بدون عنوان';
};

/**
 * Extract text content from HTML string
 * @param htmlString HTML string to convert to plain text
 * @returns Plain text without HTML tags
 */
export const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return '';

  // Create a temporary element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // Extract text content
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Count words in a text
 * @param text Text to count words in
 * @returns Word count
 */
export const countWords = (text: string): number => {
  if (!text) return 0;

  // Remove HTML tags if present
  const plainText = htmlToPlainText(text);

  // Split by whitespace and filter out empty strings
  return plainText
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

/**
 * Estimate reading time for article content
 * @param content Article content
 * @param wordsPerMinute Reading speed (default: 200)
 * @returns Reading time in minutes
 */
export const calculateReadingTime = (content: string, wordsPerMinute: number = 200): number => {
  const wordCount = countWords(content);
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // Minimum 1 minute
};

/**
 * Check if an article has file attachments
 * @param article Article to check
 * @returns Boolean indicating if article has files
 */
export const hasAttachments = (article: ResponseArticleDto): boolean => {
  return Boolean(article.files && article.files.length > 0);
};
