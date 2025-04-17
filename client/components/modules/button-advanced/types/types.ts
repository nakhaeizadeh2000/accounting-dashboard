import { ReactNode, MouseEvent, CSSProperties } from 'react';
import { SxProps, Theme } from '@mui/material/styles';

// Base props shared by all button types
export interface BaseButtonProps {
  // Core props
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  label: string;
  disabled?: boolean;

  // Event handlers
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLButtonElement>) => void;

  // Styling
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  className?: string;
  style?: CSSProperties;

  // Icons
  endIcon?: ReactNode;
  startIcon?: ReactNode;

  // Links
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;

  // Form related
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  name?: string;
  value?: string;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;

  // Advanced
  component?: React.ElementType;
  id?: string;
  dataTestId?: string;
}

// Simple button props
export type SimpleButtonProps = BaseButtonProps;

// Icon button props
export interface IconButtonProps
  extends Omit<BaseButtonProps, 'variant' | 'endIcon' | 'startIcon' | 'label'> {
  icon: ReactNode;
  label: string; // For aria-label
  edge?: 'start' | 'end' | false;
  iconSize?: string | number;
}

// Loading button props
export interface LoadingButtonProps extends BaseButtonProps {
  loading?: boolean;
  loadingPosition?: 'start' | 'end' | 'center';
  loadingIndicator?: ReactNode;
}

// Advanced button with tooltip and ripple effects
export interface AdvancedButtonProps extends BaseButtonProps {
  tooltip?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  disableRipple?: boolean;
  disableElevation?: boolean;
}

// Button types supported by the bridge
export type ButtonType = 'simple' | 'icon' | 'loading' | 'advanced';

// Bridge props combining all button types
export interface ButtonBridgeProps {
  type: ButtonType;
  props: SimpleButtonProps | IconButtonProps | LoadingButtonProps | AdvancedButtonProps;
}
