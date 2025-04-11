import { FormControlLabel, Switch } from '@mui/material';
import React from 'react';

type Props = {
  options: {
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    defaultChecked?: boolean;
    colorSwitchButton?:
      | 'error'
      | 'primary'
      | 'secondary'
      | 'default'
      | 'info'
      | 'success'
      | 'warning';
    label?: string;
    size?: 'small' | 'medium';
    formControlLabel?: {
      LabelPlacement: 'top' | 'bottom' | 'start' | 'end';
    };
  };
};

const SwitchButton = ({ options }: Props) => {
  const switchButton = (
    <Switch
      color="error"
      onChange={options.onChange}
      disabled={options?.disabled}
      defaultChecked={options?.defaultChecked}
      size={options?.size}
      inputProps={{ 'aria-label': 'controlled' }}
    />
  );
  return (
    <>
      <div>
        {options?.label && (
          <FormControlLabel
            control={switchButton}
            label={options?.label}
            disabled={options?.disabled}
            labelPlacement={options?.formControlLabel?.LabelPlacement}
          />
        )}
        {!options?.label && switchButton}
      </div>
    </>
  );
};

export default SwitchButton;
