import { TextFieldProps } from '@mui/material';
import React from 'react';

export type TextFieldTypes = TextFieldProps & {
  label: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};
