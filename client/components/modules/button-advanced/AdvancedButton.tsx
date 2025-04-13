import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { AdvancedButtonProps } from './types';
import React, { forwardRef } from 'react';

const AdvancedButton = forwardRef<HTMLButtonElement, AdvancedButtonProps>(({
  // Core props
  variant = 'contained',
  color = 'primary',
  label,
  disabled = false,
  
  // Advanced specific
  tooltip,
  tooltipPlacement = 'bottom',
  disableRipple = false,
  disableElevation = false,
  
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
  const buttonElement = (
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
      disableRipple={disableRipple}
      disableElevation={disableElevation}
      id={id}
      data-testid={dataTestId}
    >
      {label}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={tooltipPlacement} arrow>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
});

AdvancedButton.displayName = 'AdvancedButton';

export default AdvancedButton;