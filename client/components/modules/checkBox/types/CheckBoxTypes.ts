import { ChangeEvent, ReactNode } from 'react';

/**
 * Size options for the checkbox
 */
export type CheckboxSize = 'small' | 'medium' | 'large';

/**
 * Color options for the checkbox
 */
export type CheckboxColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'default'
  | 'inherit'
  | string;

/**
 * Position options for the checkbox label
 */
export type LabelPlacement = 'end' | 'start' | 'top' | 'bottom';

/**
 * Edge position options
 */
export type EdgePosition = 'start' | 'end' | false;

/**
 * Options for the CheckboxComponent
 */
export interface CheckboxOptions {
  /**
   * The checkbox label
   */
  label?: ReactNode;

  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean;

  /**
   * The size of the checkbox
   * @default 'medium'
   */
  size?: CheckboxSize;

  /**
   * The color of the checkbox
   * @default 'primary'
   */
  color?: CheckboxColor;

  /**
   * Where to place the label
   * @default 'end'
   */
  labelPlacement?: LabelPlacement;

  /**
   * Whether the checkbox is required
   */
  required?: boolean;

  /**
   * Whether the checkbox is in error state
   */
  error?: boolean;

  /**
   * Helper text to display under the checkbox
   */
  helperText?: ReactNode;

  /**
   * CSS classes for the checkbox root element
   */
  className?: string;

  /**
   * CSS classes for the checkbox input element
   */
  checkboxClassName?: string;

  /**
   * CSS classes for the label element
   */
  labelClassName?: string;

  /**
   * CSS classes for the helper text element
   */
  helperTextClassName?: string;

  /**
   * Whether the checkbox should be displayed at the edge
   * @default false
   */
  edge?: EdgePosition;

  /**
   * Whether the checkbox should be indeterminate
   * @default false
   */
  indeterminate?: boolean;

  /**
   * Custom icon to display when unchecked
   */
  icon?: ReactNode;

  /**
   * Custom icon to display when checked
   */
  checkedIcon?: ReactNode;

  /**
   * Custom icon to display when indeterminate
   */
  indeterminateIcon?: ReactNode;

  /**
   * Aria label for the checkbox
   */
  ariaLabel?: string;

  /**
   * The id of the element that labels the checkbox
   */
  ariaLabelledby?: string;

  /**
   * The id of the element that describes the checkbox
   */
  ariaDescribedby?: string;

  /**
   * Style to apply to the input element directly
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;

  /**
   * Custom styles for the root element
   */
  sx?: any;
}

/**
 * Props for the Checkbox component
 */
export interface CheckboxProps extends CheckboxOptions {
  /**
   * Checkbox name attribute
   */
  name?: string;

  /**
   * Checkbox value attribute
   */
  value?: string | number | readonly string[];

  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;

  /**
   * Default checked state (for uncontrolled component)
   */
  defaultChecked?: boolean;

  /**
   * Callback fired when the state changes
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;

  /**
   * The id to use for the checkbox
   */
  id?: string;
}

/**
 * Props for the CheckboxGroup component
 */
export interface CheckboxGroupProps {
  /**
   * Array of checkbox options to render
   */
  options: Array<{
    id: string;
    label: ReactNode;
    value: string | number;
    disabled?: boolean;
  }>;

  /**
   * The selected value(s)
   */
  value?: Array<string | number>;

  /**
   * Default value(s) (for uncontrolled component)
   */
  defaultValue?: Array<string | number>;

  /**
   * Callback fired when the state changes
   */
  onChange?: (values: Array<string | number>) => void;

  /**
   * Group name for form submission
   */
  name?: string;

  /**
   * Root component options and styling
   */
  rootOptions?: {
    className?: string;
    title?: string;
    orientation?: 'horizontal' | 'vertical';
  };

  /**
   * Options passed to each checkbox in the group
   */
  checkboxOptions?: Omit<CheckboxOptions, 'label'>;
}
