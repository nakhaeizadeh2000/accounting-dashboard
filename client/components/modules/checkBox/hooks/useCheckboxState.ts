import { useState, useEffect, ChangeEvent } from 'react';

/**
 * Custom hook for managing checkbox state
 * @param initialChecked - Initial checked state
 * @param externalChecked - External checked state (for controlled components)
 * @param onChange - External onChange handler
 * @returns Tuple of [checked, handleChange]
 */
export const useCheckboxState = (
  initialChecked: boolean = false,
  externalChecked?: boolean,
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void,
): [boolean, (event: ChangeEvent<HTMLInputElement>) => void] => {
  // Initialize state based on external or internal value
  const [checked, setChecked] = useState<boolean>(
    externalChecked !== undefined ? externalChecked : initialChecked,
  );

  // Update internal state when external value changes (for controlled component)
  useEffect(() => {
    if (externalChecked !== undefined) {
      setChecked(externalChecked);
    }
  }, [externalChecked]);

  // Handle checkbox change
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;

    // Update internal state (for uncontrolled component)
    if (externalChecked === undefined) {
      setChecked(newChecked);
    }

    // Call external onChange handler
    if (onChange) {
      onChange(event, newChecked);
    }
  };

  return [checked, handleChange];
};

/**
 * Hook for managing multiple checkbox values
 * @param initialValues - Initial selected values
 * @param externalValues - External selected values (for controlled components)
 * @param onValuesChange - External change handler for the group
 * @returns Tuple of [values, handleValueChange, selectAll, deselectAll]
 */
export const useCheckboxGroupState = <T extends string | number>(
  initialValues: T[] = [],
  externalValues?: T[],
  onValuesChange?: (values: T[]) => void,
): [
  T[],
  (value: T, checked: boolean) => void,
  () => void,
  () => void,
  (allPossibleValues: T[]) => boolean,
  (allPossibleValues: T[]) => boolean,
] => {
  // Initialize state based on external or internal values
  const [values, setValues] = useState<T[]>(
    externalValues !== undefined ? externalValues : initialValues,
  );

  // Update internal state when external values change (for controlled component)
  useEffect(() => {
    if (externalValues !== undefined) {
      setValues(externalValues);
    }
  }, [externalValues]);

  // Handle checkbox value change
  const handleValueChange = (value: T, checked: boolean) => {
    const newValues = checked ? [...values, value] : values.filter((val) => val !== value);

    // Update internal state (for uncontrolled component)
    if (externalValues === undefined) {
      setValues(newValues);
    }

    // Call external onChange handler
    if (onValuesChange) {
      onValuesChange(newValues);
    }
  };

  // Select all values
  const selectAll = (allPossibleValues: T[]) => {
    // Update internal state (for uncontrolled component)
    if (externalValues === undefined) {
      setValues([...allPossibleValues]);
    }

    // Call external onChange handler
    if (onValuesChange) {
      onValuesChange([...allPossibleValues]);
    }
  };

  // Deselect all values
  const deselectAll = () => {
    // Update internal state (for uncontrolled component)
    if (externalValues === undefined) {
      setValues([]);
    }

    // Call external onChange handler
    if (onValuesChange) {
      onValuesChange([]);
    }
  };

  // Check if all values are selected
  const areAllSelected = (allPossibleValues: T[]) => {
    return (
      allPossibleValues.length > 0 && allPossibleValues.every((value) => values.includes(value))
    );
  };

  // Check if some but not all values are selected
  const areSomeSelected = (allPossibleValues: T[]) => {
    return values.length > 0 && !areAllSelected(allPossibleValues);
  };

  return [values, handleValueChange, selectAll, deselectAll, areAllSelected, areSomeSelected];
};
