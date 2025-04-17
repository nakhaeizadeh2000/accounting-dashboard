// IndeterminateCheckbox.tsx - Improved implementation
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { IndeterminateCheckboxProps } from '../types/CheckBoxTypes';
import Checkbox from '../components/CheckBox';
import CheckboxGroup from '../components/CheckBoxGroup';

/**
 * IndeterminateCheckbox component with parent-child relationship
 * The parent checkbox becomes indeterminate when some but not all children are selected
 */
const IndeterminateCheckbox: React.FC<IndeterminateCheckboxProps> = ({
  childOptions,
  selectedValues,
  defaultSelectedValues,
  onChange,
  groupName,
  groupOptions,
  childCheckboxOptions,
  ...parentCheckboxProps
}) => {
  // Initialize state for controlled or uncontrolled component
  const [selected, setSelected] = useState<Array<string | number>>(
    selectedValues || defaultSelectedValues || [],
  );

  // Update internal state when external value changes (for controlled component)
  useEffect(() => {
    if (selectedValues !== undefined) {
      setSelected(selectedValues);
    }
  }, [selectedValues]);

  // Get all possible child values
  const allChildValues = useMemo(() => childOptions.map((option) => option.value), [childOptions]);

  // Determine if the parent checkbox should be checked or indeterminate
  const hasSelected = selected.length > 0;
  const hasUnselected = selected.length < allChildValues.length;
  const isIndeterminate = hasSelected && hasUnselected;
  const isChecked = hasSelected && !hasUnselected;

  // Handle parent checkbox click
  const handleParentChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    // Select all or none based on the checkbox state
    const newValues = checked ? [...allChildValues] : [];

    // Update internal state (for uncontrolled component)
    if (selectedValues === undefined) {
      setSelected(newValues);
    }

    // Call external onChange handler
    if (onChange) {
      onChange(newValues);
    }
  };

  // Handle child checkbox group change
  const handleChildrenChange = (values: Array<string | number>) => {
    // Update internal state (for uncontrolled component)
    if (selectedValues === undefined) {
      setSelected(values);
    }

    // Call external onChange handler
    if (onChange) {
      onChange(values);
    }
  };

  return (
    <div className="space-y-2" data-testid="indeterminate-checkbox">
      {/* Parent checkbox (indeterminate when some children are selected) */}
      <Checkbox
        indeterminate={isIndeterminate}
        checked={isChecked}
        onChange={handleParentChange}
        {...parentCheckboxProps}
      />

      {/* Child checkboxes group */}
      <div className="ml-6">
        <CheckboxGroup
          options={childOptions}
          value={selected}
          onChange={handleChildrenChange}
          name={groupName}
          rootOptions={{
            ...groupOptions,
          }}
          checkboxOptions={childCheckboxOptions}
        />
      </div>
    </div>
  );
};

IndeterminateCheckbox.displayName = 'IndeterminateCheckbox';

export default IndeterminateCheckbox;
