import { InputAdornment, TextField, useTheme } from '@mui/material';
import React from 'react';
import { TextFieldTypes } from '../types/textFiledTypes';

const TextFieldMuiComponent = ({
  size = 'small',
  variant = 'outlined',
  color = 'primary',
  ...props
}: TextFieldTypes) => {
  const theme = useTheme();
  console.log(theme.palette.mode, 'theme');
  return (
    <>
      <div>
        <TextField
          variant={variant}
          size={size}
          color={color}
          autoFocus={false}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.23)', // Same as default
                borderWidth: '1px',
              },
            },
          }}
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">{props.icon}</InputAdornment>,
            },
            inputLabel: {
              focused: false,
            },
            // root: {
            //   focused: props?.rootFocused,
            // },
          }}
          {...props}
        />
      </div>
    </>
  );
};

export default TextFieldMuiComponent;
