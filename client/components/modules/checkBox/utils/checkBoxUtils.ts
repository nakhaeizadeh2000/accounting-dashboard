// checkboxUtils.ts - Improved but maintaining similar structure
import {
  CheckboxColor,
  CheckboxOptions,
  CheckboxSize,
  EdgePosition,
  LabelPlacement,
} from './CheckboxTypes';

// Get default checkbox options
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

// Merge user options with default options
export const mergeCheckboxOptions = (options?: CheckboxOptions): CheckboxOptions => {
  return {
    ...getDefaultCheckboxOptions(),
    ...options,
  };
};

// Get the appropriate Tailwind classes for a checkbox based on color
export const getColorClasses = (color: CheckboxColor): string => {
  const colorMap: Record<string, string> = {
    primary: 'text-blue-600 hover:text-blue-700 focus:ring-blue-500',
    secondary: 'text-purple-600 hover:text-purple-700 focus:ring-purple-500',
    success: 'text-green-600 hover:text-green-700 focus:ring-green-500',
    error: 'text-red-600 hover:text-red-700 focus:ring-red-500',
    warning: 'text-amber-600 hover:text-amber-700 focus:ring-amber-500',
    info: 'text-sky-600 hover:text-sky-700 focus:ring-sky-500',
    default: 'text-gray-600 hover:text-gray-700 focus:ring-gray-500',
    inherit: '',
  };

  return colorMap[color] || color; // Fallback to the color as a custom class
};

// Get size classes for the checkbox
export const getSizeClasses = (size: CheckboxSize): string => {
  const sizeMap: Record<CheckboxSize, string> = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return sizeMap[size] || sizeMap.medium;
};

// Get classes for label placement
export const getLabelPlacementClasses = (labelPlacement: LabelPlacement): string => {
  const placementMap: Record<LabelPlacement, string> = {
    end: 'flex-row',
    start: 'flex-row-reverse',
    top: 'flex-col-reverse items-center',
    bottom: 'flex-col items-center',
  };

  return placementMap[labelPlacement] || placementMap.end;
};

// Get spacing classes based on label placement
export const getLabelSpacingClasses = (labelPlacement: LabelPlacement): string => {
  const spacingMap: Record<LabelPlacement, string> = {
    end: 'ml-2',
    start: 'mr-2',
    top: 'mb-1',
    bottom: 'mt-1',
  };

  return spacingMap[labelPlacement] || spacingMap.end;
};

// Get edge positioning classes
export const getEdgeClasses = (edge: EdgePosition): string => {
  if (edge === false) return '';

  const edgeMap: Record<string, string> = {
    start: '-ml-2',
    end: '-mr-2',
  };

  return edgeMap[edge as string] || '';
};

// Generate a unique ID for accessibility
export const generateId = (prefix: string = 'checkbox'): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};
