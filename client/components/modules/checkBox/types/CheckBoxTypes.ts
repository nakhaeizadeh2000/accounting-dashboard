// CheckboxTypes.ts - Improved but maintaining similar structure
import { ChangeEvent, ReactNode } from 'react';

// Size options for the checkbox
export type CheckboxSize = 'small' | 'medium' | 'large';

// Color options for the checkbox
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

// Position options for the checkbox label
export type LabelPlacement = 'end' | 'start' | 'top' | 'bottom';

// Edge position options
export type EdgePosition = 'start' | 'end' | false;

// Options for the CheckboxComponent
export interface CheckboxOptions {
  label?: ReactNode;
  disabled?: boolean;
  size?: CheckboxSize;
  color?: CheckboxColor;
  labelPlacement?: LabelPlacement;
  required?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  className?: string;
  checkboxClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
  edge?: EdgePosition;
  indeterminate?: boolean;
  icon?: ReactNode;
  checkedIcon?: ReactNode;
  indeterminateIcon?: ReactNode;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  sx?: any;
}

// Props for the Checkbox component
export interface CheckboxProps extends CheckboxOptions {
  name?: string;
  value?: string | number | readonly string[];
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  id?: string;
}

// Props for the CheckboxGroup component
export interface CheckboxGroupProps {
  options: Array<{
    id: string;
    label: ReactNode;
    value: string | number;
    disabled?: boolean;
  }>;
  value?: Array<string | number>;
  defaultValue?: Array<string | number>;
  onChange?: (values: Array<string | number>) => void;
  name?: string;
  rootOptions?: {
    className?: string;
    title?: string;
    orientation?: 'horizontal' | 'vertical';
  };
  checkboxOptions?: Omit<CheckboxOptions, 'label'>;
}

// Props for the AdvancedCheckbox component
export interface AdvancedCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
  rippleClassName?: string;
  enableRipple?: boolean;
  rippleDuration?: number;
  checkedContent?: ReactNode;
  uncheckedContent?: ReactNode;
  animated?: boolean;
  soundEffect?: boolean | string;
  onChange?: (checked: boolean, event?: ChangeEvent<HTMLInputElement>) => void;
}

// Props for the IndeterminateCheckbox component
export interface IndeterminateCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
  childOptions: Array<{
    id: string;
    label: ReactNode;
    value: string | number;
    disabled?: boolean;
  }>;
  selectedValues?: Array<string | number>;
  defaultSelectedValues?: Array<string | number>;
  onChange?: (values: Array<string | number>) => void;
  groupName?: string;
  groupOptions?: Omit<CheckboxGroupProps['rootOptions'], 'title'>;
  childCheckboxOptions?: Omit<CheckboxProps, 'label' | 'value' | 'checked' | 'onChange'>;
}
