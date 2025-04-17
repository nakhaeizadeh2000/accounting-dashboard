// components/SwitchButton/types.ts
import { SwitchProps } from '@mui/material';
import React from 'react';

export type SwitchButtonColor =
  | 'error'
  | 'primary'
  | 'secondary'
  | 'default'
  | 'info'
  | 'success'
  | 'warning';

export type SwitchButtonSize = 'small' | 'medium';

export type LabelPlacement = 'top' | 'bottom' | 'start' | 'end';

export type SwitchButtonStyle = 'material' | 'ios' | 'android';

export interface IconProps {
  checkedIcon?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

// Base properties for all switch variants
export interface SwitchButtonBaseProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  defaultChecked?: boolean;
  checked?: boolean;
  color?: SwitchButtonColor;
  size?: SwitchButtonSize;
  'aria-label'?: string;
  switchStyle?: SwitchButtonStyle;
  checkedIcon?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

// Props for a switch with label
export interface SwitchButtonWithLabelProps extends SwitchButtonBaseProps {
  label: string;
  labelPlacement?: LabelPlacement;
}

// Combined type for all switch props
export type SwitchButtonProps = SwitchButtonBaseProps | SwitchButtonWithLabelProps;

// Type guard to determine if props include a label
export const isSwitchButtonWithLabelProps = (
  props: SwitchButtonProps,
): props is SwitchButtonWithLabelProps => {
  return 'label' in props && !!props.label;
};
