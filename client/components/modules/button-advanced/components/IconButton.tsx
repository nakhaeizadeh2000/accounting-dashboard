import { IconButton as MuiIconButton } from '@mui/material';
import { IconButtonProps } from '../types/types';
import React, { forwardRef } from 'react';

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      // Core props
      color = 'primary',
      disabled = false,
      label,
      icon,

      // Event handlers
      onClick,
      onMouseEnter,
      onMouseLeave,

      // Styling
      size = 'medium',
      sx,
      className,
      style,
      edge = false,
      iconSize,

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
    },
    ref,
  ) => {
    // Apply iconSize if provided
    // const iconWithSize =
    //   iconSize && React.isValidElement(icon)
    //     ? React.cloneElement(icon, {
    //         style: {
    //           fontSize: iconSize,
    //           ...icon.props.style,
    //         },
    //       })
    //     : icon;

    const iconWithProps = React.isValidElement(icon)
      ? React.cloneElement(icon, {
          size: iconSize || icon.props.size, // Use passed iconSize or fallback to icon's own size
          color: icon.props.color, // Use passed iconColor or fallback to icon's own color
          ...icon.props, // Spread any additional icon props
          style: {
            ...(iconSize ? { fontSize: iconSize } : {}),
            ...icon.props.style,
            ...icon.props.style,
          },
        })
      : icon;

    return (
      <MuiIconButton
        ref={ref}
        aria-label={ariaLabel || label}
        size={size}
        color={color}
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        edge={edge}
        sx={sx}
        className={className}
        style={style}
        href={href}
        target={target}
        rel={rel}
        type={type}
        form={form}
        name={name}
        value={value}
        aria-describedby={ariaDescribedBy}
        tabIndex={tabIndex}
        component={component as any}
        id={id}
        data-testid={dataTestId}
      >
        {iconWithProps}
      </MuiIconButton>
    );
  },
);

IconButton.displayName = 'IconButton';

export default IconButton;
