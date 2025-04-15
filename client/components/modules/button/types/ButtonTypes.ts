import { ReactNode } from 'react';

// Base props shared by all button types
export interface BaseButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  onClick?: () => void;
  label?: string;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
  disabled?: boolean;
  href?: string;
  size?: 'small' | 'medium' | 'large';
}

// Simple button props
export type SimpleButtonProps = BaseButtonProps;

// Icon button props
export interface IconButtonProps extends Omit<BaseButtonProps, 'variant' | 'endIcon' | 'startIcon'> {
  icon?: ReactNode;
}

// Loading button props
export interface LoadingButtonProps extends BaseButtonProps {
  loading?: boolean;
  loadingPosition?: 'start' | 'end';
}

// Button type discriminator
export type ButtonType = 'simple' | 'icon' | 'loading';

// Bridge props combining all button types
export interface ButtonBridgeProps {
  type: ButtonType;
  props: SimpleButtonProps | IconButtonProps | LoadingButtonProps;
}