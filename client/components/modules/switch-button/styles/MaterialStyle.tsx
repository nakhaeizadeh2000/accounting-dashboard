// components/SwitchButton/styles/MaterialStyle.tsx
import { Box, Switch } from '@mui/material';
import React from 'react';
import { SwitchButtonBaseProps } from '../types/switchButtonTypes';

export const MaterialStyle: React.FC<SwitchButtonBaseProps> = ({
  onChange,
  disabled = false,
  defaultChecked,
  checked,
  color = 'primary',
  size = 'medium',
  'aria-label': ariaLabel = 'controlled',
  icon,
  checkedIcon,
  iconPosition = 'start',
}) => {
  // Choose between controlled and uncontrolled based on whether 'checked' is provided
  const switchProps =
    checked !== undefined
      ? { checked } // Controlled component
      : { defaultChecked }; // Uncontrolled component

  // If no icons are provided, just return the regular switch
  if (!icon && !checkedIcon) {
    return (
      <Switch
        color={color}
        onChange={onChange}
        disabled={disabled}
        size={size}
        inputProps={{ 'aria-label': ariaLabel }}
        {...switchProps}
      />
    );
  }

  // Return switch with icons
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: iconPosition === 'start' ? 'row' : 'row-reverse',
      }}
    >
      {icon && checkedIcon ? (
        <>
          <Box sx={{ mx: 0.5, display: 'flex', alignItems: 'center' }}>
            {switchProps.checked ? checkedIcon : icon}
          </Box>
          <Switch
            color={color}
            onChange={onChange}
            disabled={disabled}
            size={size}
            inputProps={{ 'aria-label': ariaLabel }}
            {...switchProps}
          />
        </>
      ) : (
        <>
          <Box sx={{ mx: 0.5, display: 'flex', alignItems: 'center' }}>{icon || checkedIcon}</Box>
          <Switch
            color={color}
            onChange={onChange}
            disabled={disabled}
            size={size}
            inputProps={{ 'aria-label': ariaLabel }}
            {...switchProps}
          />
        </>
      )}
    </Box>
  );
};
