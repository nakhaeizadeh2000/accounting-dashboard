import LoadingButton from '@mui/lab/LoadingButton';
import { LoadingButtonProps } from './types';
import React, { forwardRef } from 'react';

const LoadingButtonComponent = forwardRef<HTMLButtonElement, LoadingButtonProps>(({
  // Core props
  variant = 'contained',
  color = 'primary',
  label,
  disabled = false,
  
  // Loading specific
  loading = false,
  loadingPosition = 'center',
  loadingIndicator,
  
  // Event handlers
  onClick,
  onMouseEnter,
  onMouseLeave,
  
  // Styling
  size = 'medium',
  fullWidth = false,
  sx,
  className,
  style,
  
  // Icons
  endIcon,
  startIcon,
  
  // Links
  href,
  target,
  rel,
  
  // Form related
  type = 'button',
  form,
  name,
  value,
  
  // Accessibility
  ariaLabel,
  ariaDescribedBy,
  tabIndex,
  
  // Advanced
  component,
  id,
  dataTestId,
}, ref) => {
  return (
    <LoadingButton
      ref={ref}
      loading={loading}
      loadingPosition={loadingPosition}
      loadingIndicator={loadingIndicator}
      variant={variant}
      color={color}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      size={size}
      fullWidth={fullWidth}
      sx={sx}
      className={className}
      style={style}
      startIcon={startIcon}
      endIcon={endIcon}
      href={href}
      target={target}
      rel={rel}
      type={type}
      form={form}
      name={name}
      value={value}
      aria-label={ariaLabel || label}
      aria-describedby={ariaDescribedBy}
      tabIndex={tabIndex}
      component={component as any}
      id={id}
      data-testid={dataTestId}
    >
      {label}
    </LoadingButton>
  );
});

LoadingButtonComponent.displayName = 'LoadingButton';

export default LoadingButtonComponent;