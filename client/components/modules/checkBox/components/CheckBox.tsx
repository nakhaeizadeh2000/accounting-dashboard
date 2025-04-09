'use client';

import React, { forwardRef } from 'react';
import { Checkbox as MuiCheckbox, FormControlLabel, FormHelperText } from '@mui/material';

import {
  mergeCheckboxOptions,
  getColorClasses,
  getSizeClasses,
  getLabelPlacementClasses,
  getLabelSpacingClasses,
  getEdgeClasses,
} from '../utils/checkBoxUtils';
import { CheckboxProps } from '../types/CheckBoxTypes';

/**
 * Enhanced Checkbox component integrating MUI Checkbox with Tailwind styling
 */
const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>((props, ref) => {
  const {
    name,
    value,
    checked,
    defaultChecked,
    onChange,
    id,
    label,
    disabled,
    size,
    color,
    labelPlacement,
    required,
    error,
    helperText,
    className,
    checkboxClassName,
    labelClassName,
    helperTextClassName,
    edge,
    indeterminate,
    icon,
    checkedIcon,
    indeterminateIcon,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    inputProps,
    sx,
    ...restProps
  } = props;

  // Merge with default options
  const options = mergeCheckboxOptions({
    label,
    disabled,
    size,
    color,
    labelPlacement,
    required,
    error,
    helperText,
    className,
    checkboxClassName,
    labelClassName,
    helperTextClassName,
    edge,
    indeterminate,
    icon,
    checkedIcon,
    indeterminateIcon,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    inputProps,
    sx,
  });

  // Get Tailwind classes based on options
  const colorClasses = getColorClasses(options.color || 'primary');
  const sizeClasses = getSizeClasses(options.size || 'medium');
  const labelPlacementClasses = getLabelPlacementClasses(options.labelPlacement || 'end');
  const labelSpacingClasses = getLabelSpacingClasses(options.labelPlacement || 'end');
  const edgeClasses = getEdgeClasses(options.edge || false);

  // Combine Tailwind classes
  const rootClasses = `inline-flex items-center ${labelPlacementClasses} ${
    options.className || ''
  }`;

  const inputClasses = `form-checkbox ${colorClasses} ${sizeClasses} ${edgeClasses} ${
    options.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  } ${options.error ? 'border-red-500 focus:ring-red-500' : ''} ${options.checkboxClassName || ''}`;

  const labelClasses = `${labelSpacingClasses} ${
    options.disabled ? 'text-gray-400' : ''
  } ${options.error ? 'text-red-500' : ''} ${options.labelClassName || ''}`;

  const helperTextClasses = `mt-1 text-xs ${
    options.error ? 'text-red-500' : 'text-gray-500'
  } ${options.helperTextClassName || ''}`;

  // Render MUI Checkbox with our styling
  const checkbox = (
    <MuiCheckbox
      ref={ref}
      name={name}
      value={value}
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onChange}
      id={id}
      disabled={options.disabled}
      required={options.required}
      size={options.size}
      color={options.color as any}
      indeterminate={options.indeterminate}
      icon={options.icon}
      checkedIcon={options.checkedIcon}
      indeterminateIcon={options.indeterminateIcon}
      edge={options.edge}
      inputProps={{
        'aria-label': options.ariaLabel,
        'aria-labelledby': options.ariaLabelledby,
        'aria-describedby': options.ariaDescribedby,
        className: inputClasses,
        ...options.inputProps,
      }}
      sx={options.sx}
      {...restProps}
    />
  );

  // If there's no label, just return the checkbox
  if (!options.label) {
    return (
      <div className={rootClasses}>
        {checkbox}
        {options.helperText && (
          <FormHelperText error={options.error} className={helperTextClasses}>
            {options.helperText}
          </FormHelperText>
        )}
      </div>
    );
  }

  // Otherwise, return the checkbox with a label
  return (
    <div className={rootClasses}>
      <FormControlLabel
        control={checkbox}
        label={options.label}
        labelPlacement={options.labelPlacement}
        disabled={options.disabled}
        required={options.required}
        className={labelClasses}
      />
      {options.helperText && (
        <FormHelperText error={options.error} className={helperTextClasses}>
          {options.helperText}
        </FormHelperText>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
