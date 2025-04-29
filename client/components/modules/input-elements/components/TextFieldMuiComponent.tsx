import { InputAdornment, TextField, TextFieldProps } from '@mui/material';
import React from 'react';
import { TextFieldTypes } from '../types/textFiledTypes';
import { MdAccountCircle } from 'react-icons/md';

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
          slotProps={{
            input: {
              // startAdornment: (
              //   <InputAdornment position="end">
              //     <MdAccountCircle />
              //   </InputAdornment>
              // ),
              endAdornment: <InputAdornment position="end">{props.icon}</InputAdornment>,
            },
            inputLabel: {
              // shrink: false,
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
