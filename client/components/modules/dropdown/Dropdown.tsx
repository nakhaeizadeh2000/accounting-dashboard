import React, { useState, useCallback } from 'react';
import { DropdownProps } from './types';
import { useDropdown } from './hooks';
import { DropdownButton, DropdownContainer, DropdownList } from './components';

const Dropdown: React.FC<DropdownProps> = ({
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
    filterComponent,
    onFilterChange,
    filterPlaceholder = 'Search...',
    showDefaultFilter = false,
  },
}) => {
  const {
    isOpen,
    selectedItems,
    dropdownPosition,
    dropdownRef,
    buttonRef,
    portalElement,
    setPortalElement,
    handleDropdownToggle,
    isItemSelected,
    handleItemSelection,
    handleRemoveItem,
    handleScroll,
    getBorderClass,
    getLabelColorClass,
  } = useDropdown({
    items,
    selectedValue,
    onChange,
    isMultiSelectable,
    isDisabled,
    appendToBody,
    onFullScroll,
    isLoading,
  });

  const [filterValue, setFilterValue] = useState('');

  // Handle filter changes
  const handleFilterChange = useCallback(
    (value: string) => {
      setFilterValue(value);
      if (onFilterChange) {
        onFilterChange(value);
      }
    },
    [onFilterChange]
  );

  // This function will handle the input change event in the filter section
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      handleFilterChange(value);
    },
    [handleFilterChange]
  );

  // Prepare the filter section
  const filterSection = (filterComponent || showDefaultFilter) && (
    <div className="dropdown-filter-section p-2 border-b border-gray-200 dark:border-gray-700">
      {filterComponent ? (
        filterComponent
      ) : showDefaultFilter ? (
        <div className="dropdown-default-filter">
          <input
            type="text"
            className="dropdown-filter-input w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder={filterPlaceholder}
            value={filterValue}
            onChange={handleInputChange}
            onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <DropdownContainer
      containerClass={containerClass}
      label={label}
      labelClass={labelClass}
      isDisabled={isDisabled}
      isOpen={isOpen}
      selectedItemsLength={selectedItems.length}
      getLabelColorClass={() => getLabelColorClass(isValid)}
      getBorderClass={() => getBorderClass(isValid)}
      navClass={navClass}
      dropdownRef={dropdownRef}
    >
      <DropdownButton
        buttonRef={buttonRef}
        isDisabled={isDisabled}
        handleDropdownToggle={handleDropdownToggle}
        label={label}
        selectedItems={selectedItems}
        isMultiSelectable={isMultiSelectable}
        handleRemoveItem={handleRemoveItem}
        isMarquee={isMarquee}
        isLTR={isLTR}
        multiSelectLabelsViewType={multiSelectLabelsViewType}
        isOpen={isOpen}
      />

      <DropdownList
        isOpen={isOpen}
        isDisabled={isDisabled}
        appendToBody={appendToBody}
        dropdownPosition={dropdownPosition}
        setPortalElement={setPortalElement}
        items={items}
        handleScroll={handleScroll}
        isLTR={isLTR}
        isLoading={isLoading}
        label={label}
        handleItemSelection={handleItemSelection}
        isItemSelected={isItemSelected}
        filterComponent={filterComponent}
        showDefaultFilter={showDefaultFilter}
        filterPlaceholder={filterPlaceholder}
        onFilterChange={handleFilterChange}
        filterValue={filterValue}
      >
        {filterSection}
      </DropdownList>
    </DropdownContainer>
  );
};

export default Dropdown;
