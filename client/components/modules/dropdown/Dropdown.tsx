import React from 'react';
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
      />
    </DropdownContainer>
  );
};

export default Dropdown;
