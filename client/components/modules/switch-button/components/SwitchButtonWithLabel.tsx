// components/SwitchButton/SwitchButtonWithLabel.tsx
import { FormControlLabel } from '@mui/material';
import React from 'react';
import { SwitchButtonBase } from './SwitchButtonBase';
import { SwitchButtonWithLabelProps } from '../types/switchButtonTypes';

export const SwitchButtonWithLabel: React.FC<SwitchButtonWithLabelProps> = ({
  label,
  labelPlacement = 'end',
  ...switchProps
}) => {
  return (
    <FormControlLabel
      control={<SwitchButtonBase {...switchProps} />}
      label={label}
      disabled={switchProps.disabled}
      labelPlacement={labelPlacement}
    />
  );
};
