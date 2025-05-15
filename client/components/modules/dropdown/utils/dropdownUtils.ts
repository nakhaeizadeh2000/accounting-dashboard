import { ItemType } from '../types';

/**
 * Checks if an item is selected in the given array of selected items
 * @param item The item to check
 * @param selectedItems Array of currently selected items
 * @param isReversed If true, returns the opposite of the check result
 * @returns Boolean indicating if the item is selected
 */
export const isItemSelected = (
  item: ItemType,
  selectedItems: ItemType[],
  isReversed: boolean = false
): boolean => {
  const isSelected = selectedItems.some((selectedItem) => selectedItem.value === item.value);
  return isReversed ? !isSelected : isSelected;
};

/**
 * Formats selected items for display based on the display type
 * @param selectedItems Array of selected items
 * @param displayType The type of display ('simple' or 'chips')
 * @returns Formatted string for simple display
 */
export const formatSelectedItemsForDisplay = (
  selectedItems: ItemType[],
  displayType: 'simple' | 'chips' = 'simple'
): string => {
  if (displayType !== 'simple' || !selectedItems.length) return '';

  return selectedItems
    .map((item) => item.label)
    .join(', ');
};
