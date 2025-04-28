'use client';

import { ItemType } from '@/components/modules/dropdown/types';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useEffect, useState, useCallback } from 'react';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import Dropdown from '@/components/modules/dropdown/Dropdown';
import UserFilter from './UserFilter';

type Props = {
  options: {
    onChange: (item: ItemType[]) => void;
    value: ItemType[];
    containerClass: string;
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [dropdownItems, setDropdownItems] = useState<ItemType[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Determine validation state - if required and no value selected, it's invalid
  const computedIsValid = isRequired ? (value && value.length > 0) || isValid : isValid;

  // Use the filter value in the query
  const { data, error, isLoading } = useGetUsersQuery({
    page,
    limit: 10,
    search: filterValue,
  });

  // Handle data changes
  useEffect(() => {
    if (data) {
      // Convert users to dropdown items format
      const newDropdownItems = data.data.items.map((item) => ({
        value: item.id,
        label:
          item.email ||
          `${item.firstName || ''} ${item.lastName || ''}`.trim() ||
          `User ${item.id.substring(0, 8)}`,
      }));

      // Update dropdown items, avoiding duplicates
      setDropdownItems((prev) => {
        // If it's the first page, replace items
        if (page === 1) {
          return newDropdownItems;
        }

        // Otherwise append new items, avoiding duplicates
        const existingValues = new Set(prev.map((item) => item.value));
        const uniqueNewItems = newDropdownItems.filter((item) => !existingValues.has(item.value));
        return [...prev, ...uniqueNewItems];
      });

      setIsLoadingMore(false);
      setIsSearching(false);
    }
  }, [data, page]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching users:', error);
      setIsSearching(false);
    }
  }, [error]);

  // Handle scroll to bottom (load more)
  const handleFullScroll = useCallback(() => {
    if (!isLoadingMore && !isSearching && data && data.data.currentPage < data.data.totalPages) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, [data, isLoadingMore, isSearching]);

  // Handle filter changes - this is called by the debounced filter component
  const handleFilterChange = useCallback(
    (value: string) => {
      if (value !== filterValue) {
        setIsSearching(true);
        setFilterValue(value);
        setPage(1); // Reset to first page when filter changes
      }
    },
    [filterValue],
  );

  // Safe onChange handler to avoid state updates during render
  const handleSelectionChange = useCallback(
    (selectedItems: ItemType[]) => {
      setTimeout(() => {
        onChange(selectedItems);
      }, 0);
    },
    [onChange],
  );

  // Create the filter component with debounce
  const userFilterComponent = (
    <UserFilter
      onFilterChange={handleFilterChange}
      filterValue={filterValue}
      placeholder="جستجوی کاربران..."
      debounceTime={500}
    />
  );

  return (
    <Dropdown
      options={{
        isLoading: isLoading || isLoadingMore || isSearching,
        onFullScroll: handleFullScroll,
        multiSelectLabelsViewType: 'chips',
        isLTR: true,
        label: isRequired ? `${title} *` : title,
        selectedValue: value,
        containerClass: containerClass,
        items: dropdownItems,
        onChange: handleSelectionChange,
        isMultiSelectable: true,
        appendToBody: true,
        isDisabled: isDisabled,
        isValid: computedIsValid,
        filterComponent: userFilterComponent,
        showDefaultFilter: false,
      }}
    />
  );
};

export default UserMultiSelectWidget;
