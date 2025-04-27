import { useGetUsersQuery } from '@/store/features/user/users.api';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ItemType } from '@/components/modules/checkBox/drop-down/drop-down.type';
import Dropdown from '@/components/modules/dropdown';

type Props = {
  options: {
    onChange: (items: ItemType[]) => void;
    containerClass?: string;
    value: ItemType[];
    title?: string;
    isDisabled?: boolean;
    isValid?: boolean;
    isRequired?: boolean;
  };
};

const UserMultiSelectWidget = ({
  options: {
    onChange,
    containerClass = 'w-full',
    value,
    title = 'کاربران',
    isDisabled = false,
    isValid = true,
    isRequired = false,
  },
}: Props) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Array<UserFormData & { id: string }>>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [dropdownItems, setDropdownItems] = useState<ItemType[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Use a ref to track if we need to update selected items
  const pendingSelectionRef = useRef<ItemType[] | null>(null);

  // Determine validation state - if required and no value selected, it's invalid
  const computedIsValid = isRequired ? (value && value.length > 0) || isValid : isValid;

  const { data, error, isLoading } = useGetUsersQuery({ page, limit: 10 });

  // Handle data changes
  useEffect(() => {
    if (data && data.data && Array.isArray(data.data.items)) {
      // Set initialization flag
      if (!hasInitialized) {
        setHasInitialized(true);
      }

      setItems((prevItems) => [...prevItems, ...data.data.items]);
      setIsLoadingMore(false);

      // Convert users to dropdown items format with better null handling
      const newDropdownItems = data.data.items.map((item) => {
        // Create a display name with fallbacks
        let displayName = item.email || '';

        if (item.firstName || item.lastName) {
          const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
          displayName = fullName || displayName;
        }

        // If we still don't have a display name, use the ID
        if (!displayName) {
          displayName = `User ${item.id.substring(0, 8)}`;
        }

        return {
          value: item.id,
          label: displayName,
        };
      });

      // Update dropdown items, avoiding duplicates
      setDropdownItems((prev) => {
        const existingValues = new Set(prev.map((item) => item.value));
        const uniqueNewItems = newDropdownItems.filter((item) => !existingValues.has(item.value));
        return [...prev, ...uniqueNewItems];
      });
    }
  }, [data, hasInitialized]);

  // Handle errors
  useEffect(() => {
    if (error) {
      // Set initialization flag even on error
      if (!hasInitialized) {
        setHasInitialized(true);
      }
    }
  }, [error, hasInitialized]);

  // Handle scroll to bottom (load more)
  const handleFullScroll = useCallback(() => {
    if (!isLoadingMore && data && data.data && data.data.currentPage < data.data.totalPages) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, [data, isLoadingMore]);

  // Safe onChange handler - use a ref to defer state updates
  const handleSelectionChange = useCallback(
    (selectedItems: ItemType[]) => {
      // Store the selection in a ref instead of immediately updating state
      pendingSelectionRef.current = selectedItems;

      // Use setTimeout to defer the state update until after render
      setTimeout(() => {
        if (pendingSelectionRef.current) {
          onChange(pendingSelectionRef.current);
          pendingSelectionRef.current = null;
        }
      }, 0);
    },
    [onChange],
  );

  return (
    <Dropdown
      options={{
        isLoading: isLoading && !hasInitialized, // Only show loading on initial load
        onFullScroll: handleFullScroll,
        isLTR: true,
        label: isRequired ? `${title} *` : title,
        selectedValue: value,
        containerClass: containerClass,
        items: dropdownItems,
        onChange: handleSelectionChange,
        isMultiSelectable: true,
        multiSelectLabelsViewType: 'chips',
        appendToBody: true,
        isDisabled: isDisabled,
        isValid: computedIsValid,
      }}
    />
  );
};

export default UserMultiSelectWidget;
