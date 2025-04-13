import Button from '@mui/material/Button';
import { SimpleButtonProps } from './types';
import React, { forwardRef } from 'react';

const SimpleButton = forwardRef<HTMLButtonElement, SimpleButtonProps>(({
  // Core props
  variant = 'contained',
  color = 'primary',
  label,
  disabled = false,
  
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
    <Button
      ref={ref}
      variant={variant}
      color={color}
      disabled={disabled}
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
      // target={target}
      rel={rel}
      type={type}
      form={form}
      name={name}
      value={value}
      aria-label={ariaLabel || label}
      aria-describedby={ariaDescribedBy}
      tabIndex={tabIndex}
      // component={component}
      id={id}
      data-testid={dataTestId}
    >
      {label}
    </Button>
  );
});

SimpleButton.displayName = 'SimpleButton';

export default SimpleButton;