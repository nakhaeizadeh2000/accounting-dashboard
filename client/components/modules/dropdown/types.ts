import { ReactNode } from 'react';

export interface ItemType {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  [key: string]: any; // Allow for additional properties
}

export interface DropdownState {
  id: string;
  isOpen: boolean;
  selectedItems: ItemType[];
  dropdownPosition: {
    top: number;
    left: number;
    width: number;
  };
}

export interface DropdownOptions {
  label: string;
  navClass?: string;
  items?: ItemType[];
  selectedValue?: ItemType[];
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
  // Add filter options
  filterComponent?: React.ReactNode; // Custom filter component to render at the top of dropdown
  onFilterChange?: (filterValue: string) => void; // Callback for filter changes
  filterPlaceholder?: string; // Placeholder for the default filter input
  showDefaultFilter?: boolean; // Whether to show the default filter input
}

export interface DropdownProps {
  options: DropdownOptions;
}

export interface SelectedDisplayProps {
  selectedItems: ItemType[];
  isMarquee?: boolean;
  isLTR?: boolean;
  multiSelectLabelsViewType?: 'simple' | 'chips';
  isMultiSelectable?: boolean;
  onChangeSelection: (item: ItemType) => void;
}
