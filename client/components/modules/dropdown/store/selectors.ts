import { IRootState } from '@/store';

// Make sure the IRootState interface includes the dropdowns state
// This assumes that the dropdowns reducer has been added to the root reducer

export const selectDropdownState = (state: IRootState, id: string) =>
  state.dropdowns?.[id] || {
    isOpen: false,
    selectedItems: [],
    dropdownPosition: { top: 0, left: 0, width: 0 },
  };

export const selectIsDropdownOpen = (state: IRootState, id: string) =>
  state.dropdowns?.[id]?.isOpen || false;

export const selectDropdownSelectedItems = (state: IRootState, id: string) =>
  state.dropdowns?.[id]?.selectedItems || [];

export const selectDropdownPosition = (state: IRootState, id: string) =>
  state.dropdowns?.[id]?.dropdownPosition || { top: 0, left: 0, width: 0 };
