import { TextFieldProps } from '@mui/material';
import React from 'react';

export type TextFieldTypes = Omit<TextFieldProps, 'type'> & {
  label: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  typeInput?: 'number' | 'text' | 'email' | 'range';
};
