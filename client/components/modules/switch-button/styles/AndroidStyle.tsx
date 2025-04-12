// components/SwitchButton/styles/AndroidStyle.tsx
import { styled } from '@mui/material/styles';
import { Box, Switch, SwitchProps } from '@mui/material';
import React from 'react';
import { SwitchButtonBaseProps, SwitchButtonColor } from '../types/switchButtonTypes';

// Create a custom styled Switch component with Android appearance
const AndroidSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme, color = 'primary' }) => {
  // Map MUI colors to CSS variables for the switch
  const getColorFromTheme = (colorName: SwitchButtonColor): string => {
    switch (colorName) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      case 'success':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const colorValue = getColorFromTheme(color as SwitchButtonColor);

  return {
    width: 40,
    height: 20,
    padding: 0,
    display: 'flex',
    '&:active': {
      '& .MuiSwitch-thumb': {
        width: 18,
      },
      '& .MuiSwitch-switchBase.Mui-checked': {
        transform: 'translateX(16px)',
      },
    },
    '& .MuiSwitch-switchBase': {
      padding: 2,
      '&.Mui-checked': {
        transform: 'translateX(20px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: colorValue,
        },
      },
    },
    '& .MuiSwitch-thumb': {
      width: 16,
      height: 16,
      borderRadius: 8,
      transition: theme.transitions.create(['width'], {
        duration: 200,
      }),
    },
    '& .MuiSwitch-track': {
      borderRadius: 10,
      opacity: 1,
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
      boxSizing: 'border-box',
    },
  };
});

export const AndroidStyle: React.FC<SwitchButtonBaseProps> = ({
  onChange,
  disabled = false,
  defaultChecked,
  checked,
  color = 'primary',
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
      <AndroidSwitch
        onChange={onChange}
        disabled={disabled}
        color={color}
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
          <AndroidSwitch
            onChange={onChange}
            disabled={disabled}
            color={color}
            inputProps={{ 'aria-label': ariaLabel }}
            {...switchProps}
          />
        </>
      ) : (
        <>
          <Box sx={{ mx: 0.5, display: 'flex', alignItems: 'center' }}>{icon || checkedIcon}</Box>
          <AndroidSwitch
            onChange={onChange}
            disabled={disabled}
            color={color}
            inputProps={{ 'aria-label': ariaLabel }}
            {...switchProps}
          />
        </>
      )}
    </Box>
  );
};
