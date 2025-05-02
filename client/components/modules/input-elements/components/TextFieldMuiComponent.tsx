import { InputAdornment, TextField, useTheme } from '@mui/material';
import React from 'react';
import { TextFieldTypes } from '../types/textFiledTypes';

const TextFieldMuiComponent = ({
  size = 'small',
  variant = 'outlined',
  color = 'primary',
  ...props
}: TextFieldTypes) => {
  return (
    <>
      <div>
        <TextField
          variant={variant}
          size={size}
          color={color}
          autoFocus={false}
          type={props?.typeInput}
          // sx={{

          // }}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">{props.icon}</InputAdornment>,
            },
            inputLabel: {
              focused: false,
            },
          }}
          {...props}
        />
      </div>
    </>
  );
};

export default TextFieldMuiComponent;
