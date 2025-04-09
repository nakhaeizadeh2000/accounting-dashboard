import { CheckboxColor, CheckboxOptions } from '../types/CheckBoxTypes';

/**
 * Get default checkbox options
 * @returns Default options for the checkbox component
 */
export const getDefaultCheckboxOptions = (): CheckboxOptions => {
  return {
    size: 'medium',
    color: 'primary',
    labelPlacement: 'end',
    disabled: false,
    required: false,
    error: false,
    edge: false,
    indeterminate: false,
  };
};

/**
 * Merge user options with default options
 * @param options User-provided options
 * @returns Merged options
 */
export const mergeCheckboxOptions = (options?: CheckboxOptions): CheckboxOptions => {
  return {
    ...getDefaultCheckboxOptions(),
    ...options,
  };
};

/**
 * Get the appropriate Tailwind classes for a checkbox based on color
 * @param color MUI color or custom color string
 * @returns Tailwind classes for the specified color
 */
export const getColorClasses = (color: CheckboxColor): string => {
  switch (color) {
    case 'primary':
      return 'text-blue-600 hover:text-blue-700 focus:ring-blue-500';
    case 'secondary':
      return 'text-purple-600 hover:text-purple-700 focus:ring-purple-500';
    case 'success':
      return 'text-green-600 hover:text-green-700 focus:ring-green-500';
    case 'error':
      return 'text-red-600 hover:text-red-700 focus:ring-red-500';
    case 'warning':
      return 'text-amber-600 hover:text-amber-700 focus:ring-amber-500';
    case 'info':
      return 'text-sky-600 hover:text-sky-700 focus:ring-sky-500';
    case 'default':
      return 'text-gray-600 hover:text-gray-700 focus:ring-gray-500';
    case 'inherit':
      return '';
    default:
      // For custom colors, assume it's a valid Tailwind class
      return color;
  }
};

/**
 * Get size classes for the checkbox
 * @param size Size of the checkbox
 * @returns Tailwind classes for the specified size
 */
export const getSizeClasses = (size: 'small' | 'medium' | 'large'): string => {
  switch (size) {
    case 'small':
      return 'w-4 h-4';
    case 'medium':
      return 'w-5 h-5';
    case 'large':
      return 'w-6 h-6';
    default:
      return 'w-5 h-5';
  }
};

/**
 * Get classes for label placement
 * @param labelPlacement Position of the label
 * @returns Tailwind classes for label placement
 */
export const getLabelPlacementClasses = (
  labelPlacement: 'end' | 'start' | 'top' | 'bottom',
): string => {
  switch (labelPlacement) {
    case 'start':
      return 'flex-row-reverse';
    case 'top':
      return 'flex-col-reverse items-center';
    case 'bottom':
      return 'flex-col items-center';
    case 'end':
    default:
      return 'flex-row';
  }
};

/**
 * Get spacing classes based on label placement
 * @param labelPlacement Position of the label
 * @returns Tailwind classes for spacing
 */
export const getLabelSpacingClasses = (
  labelPlacement: 'end' | 'start' | 'top' | 'bottom',
): string => {
  switch (labelPlacement) {
    case 'start':
      return 'mr-2';
    case 'top':
      return 'mb-1';
    case 'bottom':
      return 'mt-1';
    case 'end':
    default:
      return 'ml-2';
  }
};

/**
 * Get edge positioning classes
 * @param edge Edge position
 * @returns Tailwind classes for edge positioning
 */
export const getEdgeClasses = (edge: 'start' | 'end' | false): string => {
  if (edge === false) return '';

  return edge === 'start' ? '-ml-2' : '-mr-2';
};
