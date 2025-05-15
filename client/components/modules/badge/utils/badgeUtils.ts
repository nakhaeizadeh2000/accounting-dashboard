import { BadgeContent, BadgeOptions } from '../types/BadgeTypes';

/**
 * Format content based on max value
 * @param content Content to format
 * @param max Maximum value before adding "+"
 * @returns Formatted content
 */
export const formatBadgeContent = (content: BadgeContent, max: number = 99): string => {
  if (typeof content === 'number' && content > max) {
    return `${max}+`;
  }
  return String(content);
};

/**
 * Get default badge options with sensible defaults
 * @returns Default badge options
 */
export const getDefaultBadgeOptions = (): BadgeOptions => {
  return {
    anchorOriginBadge: { vertical: 'top', horizontal: 'right' },
    overlap: 'circular',
    max: 99,
    showZero: false,
    animateEnabled: false,
    colorTypeBadge: 'bg-red-500 text-white',
    contentClass: 'text-xs',
  };
};

/**
 * Merge user options with default options
 * @param options User-provided options
 * @returns Merged options
 */
export const mergeBadgeOptions = (options?: BadgeOptions): BadgeOptions => {
  return {
    ...getDefaultBadgeOptions(),
    ...options,
  };
};
