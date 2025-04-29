import { TextFieldProps } from '@mui/material';
import React from 'react';

export type TextFieldTypes = TextFieldProps & {
  label: string;
  icon: React.ReactNode;
  rootFocused?: boolean;
  labelFocused?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
