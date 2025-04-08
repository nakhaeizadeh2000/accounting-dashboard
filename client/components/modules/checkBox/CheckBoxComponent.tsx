import { Checkbox } from '@mui/material';
import React from 'react';

type CheckBoxProps = {
  options: {
    label: string;
    checked?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    color?: 'default' | 'primary' | 'secondary';
    size?: 'small' | 'medium';
    indeterminate?: boolean;
  };
};

const CheckBoxComponent = ({
  options: {
    label,
    checked,
    onChange,
    disabled = false,
    color = 'default',
    size = 'medium',
    indeterminate = false,
  },
}: CheckBoxProps) => {
  return (
    <>
      <div>
        <Checkbox
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          color={color}
          size={size}
          indeterminate={indeterminate}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      </div>
    </>
  );
};

export default CheckBoxComponent;
