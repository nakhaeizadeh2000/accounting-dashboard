import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import {
  registerDropdown,
  toggleDropdown,
  selectItem,
  clearSelection,
  unregisterDropdown,
  setDropdownPosition,
  setSelectedItems as setReduxSelectedItems
} from '../store/dropdownSlice';
import {
  selectDropdownState,
  selectIsDropdownOpen,
  selectDropdownSelectedItems,
  selectDropdownPosition
} from '../store/selectors';
import { DropdownProps, ItemType } from '../types';
import { IRootState } from '@/store';
import { isItemSelected as checkItemSelected } from '../utils/dropdownUtils';

interface UseDropdownProps {
  id?: string; // Optional ID for the dropdown
  items?: ItemType[];
  selectedValue?: ItemType[];
  onChange: (items: ItemType[]) => void;
  isMultiSelectable?: boolean;
  isDisabled?: boolean;
  appendToBody?: boolean;
  onFullScroll?: () => void;
  isLoading?: boolean;
}

export const useDropdown = ({
  id,
  items = [],
  selectedValue = [],
  onChange,
  isMultiSelectable = false,
  isDisabled = false,
  appendToBody = false,
  onFullScroll = () => { },
  isLoading = false,
}: UseDropdownProps) => {
  // Generate a unique ID for this dropdown if not provided
  const [dropdownId] = useState(id || `dropdown-${nanoid()}`);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ItemType[]>(selectedValue);
  const [localDropdownPosition, setLocalDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [portalElement, setPortalElement] = useState<HTMLUListElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useDispatch();

  // Initialize mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Register dropdown in Redux store on mount
  useEffect(() => {
    dispatch(
      registerDropdown({
        isOpen: false,
        selectedItems: selectedValue,
        dropdownPosition: { top: 0, left: 0, width: 0 },
        isMultiSelectable
      })
    );

    // Cleanup on unmount
    return () => {
      dispatch(unregisterDropdown(dropdownId));
    };
  }, [dispatch, dropdownId, selectedValue, isMultiSelectable]);

  // Update selected items when selectedValue changes from parent
  useEffect(() => {
    setSelectedItems(selectedValue);
    dispatch(setReduxSelectedItems({
      id: dropdownId,
      items: selectedValue
    }));
  }, [dispatch, dropdownId, selectedValue]);

  // Handle clicks outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node);
      const clickedOutsidePortal = !portalElement || !portalElement.contains(event.target as Node);

      if (clickedOutsideDropdown && clickedOutsidePortal) {
        setIsOpen(false);
        dispatch(toggleDropdown({
          id: dropdownId,
          isOpen: false
        }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch, dropdownId, portalElement]);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current && appendToBody) {
      const rect = buttonRef.current.getBoundingClientRect();
      const position = {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      };
      setLocalDropdownPosition(position);
      dispatch(
        setDropdownPosition({
          id: dropdownId,
          position
        })
      );
    }
  }, [dispatch, dropdownId, isOpen, appendToBody]);

  // Update dropdown position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen && buttonRef.current && appendToBody) {
        const rect = buttonRef.current.getBoundingClientRect();
        const position = {
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        };
        setLocalDropdownPosition(position);
        dispatch(
          setDropdownPosition({
            id: dropdownId,
            position
          })
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch, dropdownId, isOpen, appendToBody]);

  // Toggle dropdown open/closed
  const handleDropdownToggle = useCallback(() => {
    if (isDisabled) return;
    setIsOpen((prev) => !prev);
    dispatch(toggleDropdown({ id: dropdownId }));
  }, [dispatch, dropdownId, isDisabled]);

  // Check if an item is selected
  const isItemSelected = useCallback(
    (item: ItemType, isReversed: boolean = false) => {
      return checkItemSelected(item, selectedItems, isReversed);
    },
    [selectedItems]
  );

  // Handle item selection
  const handleItemSelection = useCallback(
    (item: ItemType) => {
      if (isDisabled) return;

      setSelectedItems((prevSelectedItems) => {
        let newData: ItemType[];
        if (isItemSelected(item)) {
          newData = prevSelectedItems.filter(
            (prevSelectedItem) => prevSelectedItem.value !== item.value
          );
        } else {
          if (isMultiSelectable) {
            newData = [...prevSelectedItems, item];
          } else {
            newData = [item];
          }
        }
        // Call the parent onChange handler
        onChange(newData);
        dispatch(selectItem({ id: dropdownId, item }));
        return newData;
      });

      if (!isMultiSelectable) {
        setIsOpen(false);
        dispatch(toggleDropdown({ id: dropdownId, isOpen: false }));
      }
    },
    [dispatch, dropdownId, isDisabled, isItemSelected, isMultiSelectable, onChange]
  );

  // Handle removing an item
  const handleRemoveItem = useCallback(
    (e: React.MouseEvent, item?: ItemType) => {
      if (isDisabled) return;

      e.stopPropagation();

      if (item) {
        // Remove specific item (for multi-select chips)
        handleItemSelection(item);
      } else if (!isMultiSelectable) {
        // Clear selection for single select
        setSelectedItems([]);
        onChange([]);
        dispatch(clearSelection({ id: dropdownId }));
      }
    },
    [dispatch, dropdownId, isDisabled, isMultiSelectable, onChange, handleItemSelection]
  );

  // Handle scroll to bottom for loading more items
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const bottom =
        e.currentTarget.scrollHeight <= e.currentTarget.scrollTop + e.currentTarget.clientHeight + 10;
      if (bottom && !isLoading) {
        onFullScroll();
      }
    },
    [isLoading, onFullScroll]
  );

  // Get border class based on validation and focus state
  const getBorderClass = useCallback(
    (isValid: boolean = true) => {
      if (!isValid) return 'border-red-500'; // Invalid state - red border
      if (isOpen) return 'border-blue-500'; // Focused state - blue border
      return 'border-transparent'; // Default state - transparent border
    },
    [isOpen]
  );

  // Get label color class based on validation state
  const getLabelColorClass = useCallback(
    (isValid: boolean = true) => {
      if (!isValid) return 'text-red-500'; // Invalid state - red text
      return 'text-neutral-600 dark:text-neutral-300'; // Default state
    },
    []
  );

  return {
    isOpen,
    selectedItems,
    dropdownPosition: localDropdownPosition,
    dropdownRef,
    buttonRef,
    portalElement,
    setPortalElement,
    isMounted,
    handleDropdownToggle,
    isItemSelected,
    handleItemSelection,
    handleRemoveItem,
    handleScroll,
    getBorderClass,
    getLabelColorClass,
  };
};
