// components/SwitchButton/styles/iOSStyle.tsx
import { styled } from '@mui/material/styles';
import { Box, Switch, SwitchProps } from '@mui/material';
import React from 'react';
import { SwitchButtonBaseProps, SwitchButtonColor } from '../types/switchButtonTypes';

// Create a custom styled Switch component with iOS appearance
const IOSSwitch = styled((props: SwitchProps) => (
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
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: colorValue,
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: colorValue,
        border: '6px solid #fff',
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 22,
      height: 22,
    },
    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  };
});

export const IOSStyle: React.FC<SwitchButtonBaseProps> = ({
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
      <IOSSwitch
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
          <IOSSwitch
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
          <IOSSwitch
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
