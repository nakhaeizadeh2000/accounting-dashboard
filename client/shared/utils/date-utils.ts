import { format } from 'date-fns';
import { format as formatJalali } from 'date-fns-jalali';

/**
 * Format date string for display
 * @param dateString Date string to format
 * @param formatStr Format string (default: 'yyyy/MM/dd HH:mm')
 * @param useJalali Whether to use Jalali calendar (default: true)
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date,
  formatStr: string = 'yyyy/MM/dd HH:mm',
  useJalali: boolean = true
): string => {
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date detected:', dateString);
      return 'تاریخ نامعتبر';
    }

    // Use Jalali or Gregorian calendar based on the parameter
    return useJalali ? formatJalali(date, formatStr) : format(date, formatStr);
  } catch (err) {
    console.error('Date formatting error:', err, 'for date string:', dateString);
    return 'تاریخ نامعتبر';
  }
};

/**
 * Check if a date is valid
 * @param dateString Date string to check
 * @returns Boolean indicating if the date is valid
 */
export const isValidDate = (dateString: string | Date): boolean => {
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Get current date in ISO format
 * @returns Current date in ISO format
 */
export const getCurrentISODate = (): string => {
  return new Date().toISOString();
};

/**
 * Calculate difference between two dates in days
 * @param date1 First date
 * @param date2 Second date (defaults to current date)
 * @returns Number of days between dates
 */
export const getDaysDifference = (date1: Date | string, date2: Date | string = new Date()): number => {
  const firstDate = date1 instanceof Date ? date1 : new Date(date1);
  const secondDate = date2 instanceof Date ? date2 : new Date(date2);

  const diffTime = Math.abs(secondDate.getTime() - firstDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};