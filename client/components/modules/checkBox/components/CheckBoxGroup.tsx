// CheckboxGroup.tsx - Improved implementation
'use client';

import React, { useState, useEffect } from 'react';
import { FormGroup, FormLabel } from '@mui/material';

import { CheckboxGroupProps } from '../types/CheckBoxTypes';
import Checkbox from '../components/CheckBox';

/**
 * CheckboxGroup component for handling multiple related checkboxes
 */
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  name,
  rootOptions,
  checkboxOptions,
}) => {
  // Initialize state for controlled or uncontrolled component
  const [selectedValues, setSelectedValues] = useState<Array<string | number>>(
    value || defaultValue || [],
  );

  // Update internal state when external value changes (for controlled component)
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(value);
    }
  }, [value]);

  // Handle individual checkbox changes
  const handleCheckboxChange =
    (checkboxValue: string | number) =>
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const newSelectedValues = checked
        ? [...selectedValues, checkboxValue]
        : selectedValues.filter((val) => val !== checkboxValue);

      // Update internal state (for uncontrolled component)
      if (value === undefined) {
        setSelectedValues(newSelectedValues);
      }

      // Call external onChange handler
      if (onChange) {
        onChange(newSelectedValues);
      }
    };

  // Determine orientation classes
  const orientationClasses =
    rootOptions?.orientation === 'horizontal'
      ? 'flex flex-row flex-wrap gap-4'
      : 'flex flex-col gap-2';

  return (
    <div className={rootOptions?.className || ''} data-testid="checkbox-group">
      {rootOptions?.title && (
        <FormLabel component="legend" className="mb-2 block font-medium">
          {rootOptions.title}
        </FormLabel>
      )}
      <FormGroup className={orientationClasses}>
        {options.map((option) => (
          <Checkbox
            key={option.id}
            id={option.id}
            name={name ? `${name}[${option.value}]` : undefined}
            value={option.value}
            label={option.label}
            checked={selectedValues.includes(option.value)}
            disabled={option.disabled}
            onChange={handleCheckboxChange(option.value)}
            {...checkboxOptions}
          />
        ))}
      </FormGroup>
    </div>
  );
};

CheckboxGroup.displayName = 'CheckboxGroup';

export default CheckboxGroup;
