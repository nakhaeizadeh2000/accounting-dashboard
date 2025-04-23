'use client';

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput,
} from '@mui/material';
import {
  CustomDropdownIcon,
  MultiSelectChips,
  MarqueeText,
  EmptyState,
  AnimatedMenuItem,
  LoadingIndicator,
  ClearButton,
  SearchInput,
} from './MuiDropDownComponents';
import React, { useState, useRef, useEffect } from 'react';
import { ItemType } from './mui-drop-down.type';
import '../../../styles/mui-scss/mui-dropdown.scss'; // Make sure this is imported

// Define Props interface
interface Props {
  options: {
    label: string;
    navClass?: string;
    items: ItemType[];
    selectedValue: ItemType[];
    onChange: (items: ItemType[]) => void;
    containerClass?: string;
    labelClass?: string;
    isLoading?: boolean;
    onFullScroll?: () => void;
    isMarquee?: boolean;
    isLTR?: boolean;
    isMultiSelectable?: boolean;
    multiSelectLabelsViewType?: 'simple' | 'chips';
    appendToBody?: boolean;
    isDisabled?: boolean;
    isValid?: boolean;
    hasMore?: boolean;
    onSearch?: (searchTerm: string) => void;
    searchPlaceholder?: string;
  };
}

export default function MuiDropDown({
  options: {
    label,
    navClass = '',
    items = [],
    selectedValue = [],
    onChange,
    containerClass,
    labelClass,
    isLoading,
    onFullScroll = () => {},
    isMarquee = false,
    isLTR = false,
    isMultiSelectable = false,
    multiSelectLabelsViewType = 'simple',
    appendToBody = false,
    isDisabled = false,
    isValid = true,
    hasMore = false,
    onSearch,
    searchPlaceholder = 'جستجو...',
  },
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ItemType[]>(selectedValue);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update selectedItems when selectedValue changes from parent
  useEffect(() => {
    if (JSON.stringify(selectedValue) !== JSON.stringify(selectedItems)) {
      setSelectedItems(selectedValue);
    }
  }, [selectedValue]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (onSearch && open) {
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(searchTerm);
      }, 300);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, onSearch, open]);

  // Handle scroll to implement infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.target as HTMLDivElement;
    const bottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    if (bottom && !isLoading && hasMore) {
      onFullScroll();
    }
  };

  // Handle selection change
  const handleChange = (event: SelectChangeEvent<unknown>) => {
    if (isDisabled) return;

    const value = event.target.value;
    // Handle both string and string[] types
    const selectedValues = typeof value === 'string' ? [value] : (value as string[]);

    // Map selected values to ItemType objects
    const newSelectedItems = items.filter((item) => selectedValues.includes(item.value));

    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);

    // Ensure the label stays up after selection
    const labelElement = document.getElementById(`dropdown-label-${label}`);
    if (labelElement && newSelectedItems.length > 0) {
      labelElement.classList.add('MuiInputLabel-shrink');
    }
  };

  // Handle removing a selected item
  const handleRemoveItem = (itemToRemove: ItemType) => {
    if (isDisabled) return;

    const newSelectedItems = selectedItems.filter((item) => item.value !== itemToRemove.value);
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };

  // Clear all selected items
  const handleClearAll = (e: React.MouseEvent) => {
    if (isDisabled) return;

    e.stopPropagation();
    setSelectedItems([]);
    onChange([]);
  };

  // Render selected value for single select
  const renderSingleValue = (selected: unknown) => {
    const selectedValue = selected as string;
    const selectedItem = items.find((item) => item.value === selectedValue);

    if (!selectedItem) {
      // If no item is found in items but we have selectedItems, use that
      if (selectedItems.length > 0) {
        const content = (
          <div className="flex w-full items-center justify-between">
            <span className="text-sm">{selectedItems[0].label}</span>
          </div>
        );
        return isMarquee ? <MarqueeText isLTR={isLTR}>{content}</MarqueeText> : content;
      }
      return null;
    }

    const content = (
      <div className="flex w-full items-center justify-between">
        <span className="text-sm">{selectedItem.label}</span>
      </div>
    );

    return isMarquee ? <MarqueeText isLTR={isLTR}>{content}</MarqueeText> : content;
  };

  // Render selected values for multi-select
  const renderMultiValue = (selected: unknown) => {
    const selectedValues = selected as string[];

    // First try to find items in the items array
    let selectedItems = items.filter((item) => selectedValues.includes(item.value));

    // If no items found but we have selectedItems state, use that
    if (selectedItems.length === 0 && selectedValues.length > 0) {
      selectedItems = selectedValue;
    }

    if (selectedItems.length === 0) return null;

    const content = (
      <MultiSelectChips
        selectedItems={selectedItems}
        onDelete={handleRemoveItem}
        isLTR={isLTR}
        viewType={multiSelectLabelsViewType}
        disabled={isDisabled}
      />
    );

    return isMarquee ? <MarqueeText isLTR={isLTR}>{content}</MarqueeText> : content;
  };

  // Get current selected values as string array for MUI Select
  const getCurrentValues = () => {
    return selectedItems.map((item) => item.value);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle dropdown open/close
  const handleOpen = () => {
    setOpen(true);

    // Force the label to move up when dropdown is opened
    const labelElement = document.getElementById(`dropdown-label-${label}`);
    if (labelElement) {
      labelElement.classList.add('MuiInputLabel-shrink');
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset search term when closing dropdown
    setSearchTerm('');

    // Ensure the label stays up if there are selected items
    if (selectedItems.length > 0) {
      // Force the label to stay up by setting a class directly on the DOM element
      const labelElement = document.getElementById(`dropdown-label-${label}`);
      if (labelElement) {
        labelElement.classList.add('MuiInputLabel-shrink', 'Mui-focused');
      }

      // Also force the notch to stay visible
      const inputElement = document.querySelector(
        `#dropdown-select-${label} .MuiOutlinedInput-notchedOutline`,
      );
      if (inputElement) {
        inputElement.classList.add('MuiOutlinedInput-notchedOutline-legend-visible');
      }
    }
  };

  // Wait until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // Apply Tailwind classes to style MUI components
  const formControlClasses = `
    mui-form-control
    ${!isValid ? 'Mui-error' : ''}
    ${isDisabled ? 'opacity-60' : ''}
    ${navClass}
  `;

  const inputLabelClasses = `
    ${labelClass}
    ${isDisabled ? 'opacity-60' : ''}
    ${!isLTR ? 'rtl-label' : ''}
  `;

  return (
    <div className={`flex flex-col ${containerClass}`}>
      <FormControl
        fullWidth
        variant="outlined"
        error={!isValid}
        disabled={isDisabled}
        className={formControlClasses}
        dir={isLTR ? 'ltr' : 'rtl'}
      >
        <InputLabel
          id={`dropdown-label-${label}`}
          className={inputLabelClasses}
          // Always keep the label shrunk if there are selected items
          shrink={selectedItems.length > 0 || open}
        >
          {label}
        </InputLabel>

        <Select
          labelId={`dropdown-label-${label}`}
          id={`dropdown-select-${label}`}
          multiple={isMultiSelectable}
          value={getCurrentValues()}
          onChange={handleChange}
          onOpen={handleOpen}
          onClose={handleClose}
          input={
            <OutlinedInput
              label={label}
              className="mui-dropdown-input min-h-[2.5rem] md:min-h-[2.25rem]"
              // Always keep the notch if there are selected items
              notched={selectedItems.length > 0 || open}
            />
          }
          renderValue={isMultiSelectable ? renderMultiValue : renderSingleValue}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
              },
              onScroll: handleScroll,
              className: `${isLTR ? 'direction-ltr' : ''} scrollbar scrollbar-track-transparent scrollbar-thumb-slate-700 scrollbar-track-rounded-full scrollbar-thumb-rounded-full scrollbar-w-2 scrollbar-h-2 dark:scrollbar-track-transparent dark:scrollbar-thumb-slate-300`,
            },
            MenuListProps: {
              ref: menuRef,
              style: {
                padding: '4px',
              },
            },
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
            disablePortal: !appendToBody,
            // Add this to ensure proper focus management
            disableRestoreFocus: false,
          }}
          IconComponent={() => <CustomDropdownIcon open={open} />}
          endAdornment={
            !isMultiSelectable && selectedItems.length > 0 ? (
              <ClearButton onClick={handleClearAll} disabled={isDisabled} />
            ) : null
          }
          ref={selectRef}
          className="mui-select flex items-center"
        >
          {/* Search input for filtering */}
          {onSearch && (
            <div className="px-2 pt-2" onClick={(e) => e.stopPropagation()}>
              <SearchInput
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                dir={isLTR ? 'ltr' : 'rtl'}
              />
            </div>
          )}

          {isLoading ? (
            <MenuItem disabled>
              <LoadingIndicator />
            </MenuItem>
          ) : items.length === 0 ? (
            <MenuItem disabled>
              <EmptyState />
            </MenuItem>
          ) : (
            items.map((item) => (
              <MenuItem
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                className="p-0"
              >
                <AnimatedMenuItem
                  isLTR={isLTR}
                  isSelected={selectedItems.some((selected) => selected.value === item.value)}
                >
                  <div className="w-full px-4 py-1">{item.label}</div>
                </AnimatedMenuItem>
              </MenuItem>
            ))
          )}

          {/* Loading indicator at the bottom when more items can be loaded */}
          {hasMore && !isLoading && (
            <MenuItem disabled className="flex justify-center py-2">
              <div className="text-sm text-gray-500">اسکرول برای بارگذاری بیشتر</div>
            </MenuItem>
          )}
        </Select>
      </FormControl>
    </div>
  );
}
