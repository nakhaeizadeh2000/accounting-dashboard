'use client';

import { ItemType } from '@/components/modules/drop-downs/drop-down.type';
import DropDownWidget from '@/components/modules/drop-downs/DropDownWidget';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import { useEffect, useState, useCallback } from 'react';

type Props = {
  options: {
    onChange: (item: ItemType[]) => void;
    value: ItemType[];
    containerClass: string;
    title?: string;
  };
};

const UserSingleSelectWidget = ({
  options: { onChange, containerClass = 'w-full', value, title = 'کاربر' },
}: Props) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Array<UserFormData & { id: string }>>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [dropdownItems, setDropdownItems] = useState<ItemType[]>([]);

  const { data, error, isLoading } = useGetUsersQuery({ page, limit: 10 });

  // Handle data changes
  useEffect(() => {
    if (data) {
      setItems((prevItems) => [...prevItems, ...data.data.items]);
      setIsLoadingMore(false);

      // Convert users to dropdown items format
      const newDropdownItems = data.data.items.map((item) => ({
        value: item.id,
        label: item.email || item.firstName + ' ' + item.lastName,
      }));

      // Update dropdown items, avoiding duplicates
      setDropdownItems((prev) => {
        const existingValues = new Set(prev.map((item) => item.value));
        const uniqueNewItems = newDropdownItems.filter((item) => !existingValues.has(item.value));
        return [...prev, ...uniqueNewItems];
      });
    }
  }, [data]);

  // Handle errors
  useEffect(() => {
    if (error) {
      // TODO: handle if an error occurred with auth or server permissions
      console.error('Error fetching users:', error);
    }
  }, [error]);

  // Handle scroll to bottom (load more)
  const handleFullScroll = useCallback(() => {
    if (!isLoadingMore && data && data.data.currentPage < data.data.totalPages) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, [data, isLoadingMore]);

  // Safe onChange handler to avoid state updates during render
  const handleSelectionChange = useCallback(
    (selectedItems: ItemType[]) => {
      // Use setTimeout to move state update out of render cycle
      setTimeout(() => {
        onChange(selectedItems);
      }, 0);
    },
    [onChange],
  );

  return (
    <DropDownWidget
      options={{
        isLoading: isLoading || isLoadingMore,
        onFullScroll: handleFullScroll,
        isLTR: true,
        label: title,
        selectedValue: value,
        containerClass: containerClass,
        items: dropdownItems,
        onChange: handleSelectionChange,
        isMultiSelectable: false, // Changed to false since we only want single selection for authors
        multiSelectLabelsViewType: 'chips',
        appendToBody: true,
      }}
    />
  );
};

export default UserSingleSelectWidget;
