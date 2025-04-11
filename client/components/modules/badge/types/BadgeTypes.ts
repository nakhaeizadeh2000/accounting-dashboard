import { ComponentType } from 'react';
import { IconBaseProps, IconType } from 'react-icons';

/**
 * Badge content type - either a number or string
 */
export type BadgeContent = number | string;

/**
 * Badge anchor origin positions
 */
export interface BadgeAnchorOrigin {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'right';
}

/**
 * Common badge options
 */
export interface BadgeOptions {
  /**
   * Optional name for the badge
   */
  name?: string;

  /**
   * Badge position relative to the icon
   */
  anchorOriginBadge?: BadgeAnchorOrigin;

  /**
   * Additional class name for the badge wrapper
   */
  className?: string;

  /**
   * Tailwind CSS class for badge color
   */
  colorTypeBadge?: string;

  /**
   * How badge should overlap icon
   */
  overlap?: 'circular' | 'rectangular';

  /**
   * Maximum value to display before showing "+"
   */
  max?: number;

  /**
   * Whether to show zero values
   */
  showZero?: boolean;

  /**
   * Whether to enable animation effects
   */
  animateEnabled?: boolean;

  /**
   * Additional class name for the content
   */
  contentClass?: string;

  /**
   * Callback when badge is clicked
   */
  onClick?: () => void;
}

/**
 * Props for the BaseBadge component
 */
export interface BaseBadgeProps {
  Icon: IconType | ComponentType<IconBaseProps>;
  badgeContent: React.ReactNode;
  options: BadgeOptions;
}

/**
 * Props for the DotBadge component
 */
export interface DotBadgeProps {
  Icon: IconType | ComponentType<IconBaseProps>;
  options?: BadgeOptions;
}

/**
 * Props for the ContentBadge component
 */
export interface ContentBadgeProps {
  content: BadgeContent;
  Icon: IconType | ComponentType<IconBaseProps>;
  options?: BadgeOptions;
}

/**
 * Props for the unified BadgeProvider component
 */
export interface BadgeProviderProps {
  content?: BadgeContent;
  Icon: IconType | ComponentType<IconBaseProps>;
  options?: BadgeOptions;
}
