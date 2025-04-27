import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { ItemType } from '../types';

export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export interface DropdownState {
  isOpen: boolean;
  selectedItems: ItemType[];
  dropdownPosition: DropdownPosition;
  isMultiSelectable?: boolean;
}

export interface DropdownsState {
  [id: string]: DropdownState;
}

const initialState: DropdownsState = {};

const dropdownSlice = createSlice({
  name: 'dropdowns',
  initialState,
  reducers: {
    registerDropdown: {
      reducer: (state, action: PayloadAction<{ id: string, initialState: DropdownState }>) => {
        const { id, initialState: dropdownInitialState } = action.payload;
        if (!state[id]) {
          state[id] = dropdownInitialState;
        }
      },
      prepare: (initialState: Omit<DropdownState, 'id'>) => {
        const id = nanoid();
        return { payload: { id, initialState: { ...initialState, id } } };
      }
    },
    toggleDropdown: (state, action: PayloadAction<{ id: string; isOpen?: boolean }>) => {
      const { id, isOpen } = action.payload;
      
      if (!state[id]) {
        state[id] = {
          isOpen: isOpen !== undefined ? isOpen : true,
          selectedItems: [],
          dropdownPosition: { top: 0, left: 0, width: 0 },
        };
      } else {
        state[id].isOpen = isOpen !== undefined ? isOpen : !state[id].isOpen;
      }
    },
    setDropdownPosition: (
      state,
      action: PayloadAction<{ id: string; position: DropdownPosition }>
    ) => {
      const { id, position } = action.payload;
      
      if (!state[id]) {
        state[id] = {
          isOpen: false,
          selectedItems: [],
          dropdownPosition: position,
        };
      } else {
        state[id].dropdownPosition = position;
      }
    },
    selectItem: (state, action: PayloadAction<{ id: string, item: ItemType }>) => {
      const { id, item } = action.payload;
      if (state[id]) {
        const dropdown = state[id];
        const itemIndex = dropdown.selectedItems.findIndex(i => i.value === item.value);

        if (itemIndex >= 0) {
          // Item exists, remove it
          dropdown.selectedItems = dropdown.selectedItems.filter(i => i.value !== item.value);
        } else {
          // Item doesn't exist, add it
          if (dropdown.isMultiSelectable) {
            dropdown.selectedItems.push(item);
          } else {
            dropdown.selectedItems = [item];
            dropdown.isOpen = false;
          }
        }
      }
    },
    setSelectedItems: (
      state,
      action: PayloadAction<{ id: string; items: ItemType[] }>
    ) => {
      const { id, items } = action.payload;
      
      if (!state[id]) {
        state[id] = {
          isOpen: false,
          selectedItems: items,
          dropdownPosition: { top: 0, left: 0, width: 0 },
        };
      } else {
        state[id].selectedItems = items;
      }
    },
    clearSelection: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      if (state[id]) {
        state[id].selectedItems = [];
      }
    },
    unregisterDropdown: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state[id];
    },
    addSelectedItem: (
      state,
      action: PayloadAction<{ id: string; item: ItemType }>
    ) => {
      const { id, item } = action.payload;
      
      if (!state[id]) {
        state[id] = {
          isOpen: false,
          selectedItems: [item],
          dropdownPosition: { top: 0, left: 0, width: 0 },
        };
      } else {
        // Check if item already exists
        const exists = state[id].selectedItems.some(
          (selectedItem) => selectedItem.value === item.value
        );
        
        if (!exists) {
          state[id].selectedItems.push(item);
        }
      }
    },
    removeSelectedItem: (
      state,
      action: PayloadAction<{ id: string; itemValue: string | number }>
    ) => {
      const { id, itemValue } = action.payload;
      
      if (state[id]) {
        state[id].selectedItems = state[id].selectedItems.filter(
          (item) => item.value !== itemValue
        );
      }
    },
    clearSelectedItems: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      
      if (state[id]) {
        state[id].selectedItems = [];
      }
    },
    resetDropdown: (state, action: PayloadAction<{ id: string }>) => {
      const { id } = action.payload;
      
      if (state[id]) {
        state[id] = {
          isOpen: false,
          selectedItems: [],
          dropdownPosition: { top: 0, left: 0, width: 0 },
        };
      }
    },
  }
});

export const {
  registerDropdown,
  toggleDropdown,
  setDropdownPosition,
  selectItem,
  setSelectedItems,
  clearSelection,
  unregisterDropdown,
  addSelectedItem,
  removeSelectedItem,
  clearSelectedItems,
  resetDropdown,
} = dropdownSlice.actions;

export default dropdownSlice.reducer;
