'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MuiDropDown from '@/components/modules/drop-downs/MuiDropDown';
import { ItemType } from '@/components/modules/drop-downs/mui-drop-down.type';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import useDebounce from '@/shared/hooks/useDebounce.hook';

// Define User type based on UserFormData with an id
export type User = UserFormData & { id: string };

type Props = {
  options: {
    onChange: (user: User | null) => void;
    containerClass?: string;
    value?: User | null;
    title?: string;
    isDisabled?: boolean;
    isValid?: boolean;
    isRequired?: boolean;
    isLTR?: boolean;
  };
};

const UserSingleSelectWidget = ({
  options: {
    onChange,
    containerClass = 'w-full',
    value: selectedUser,
    title = 'کاربر',
    isDisabled = false,
    isValid = true,
    isRequired = false,
    isLTR = false,
  },
}: Props) => {
  // State for pagination and search
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Use RTK Query to fetch users with search
  const { data, isLoading, isFetching } = useGetUsersQuery({
    page,
    limit,
    search: debouncedSearchTerm,
  });

  // Reset users when search term changes
  useEffect(() => {
    setAllUsers([]);
    setPage(1);
  }, [debouncedSearchTerm]);

  // Update allUsers when new data comes in
  useEffect(() => {
    if (data?.data?.items) {
      // Add new users to our collection, avoiding duplicates
      setAllUsers((prevUsers) => {
        const newUsers = data.data.items;
        const existingIds = new Set(prevUsers.map((user) => user.id));
        const uniqueNewUsers = newUsers.filter((user) => !existingIds.has(user.id));
        return [...prevUsers, ...uniqueNewUsers];
      });
    }
  }, [data]);

  // Extract total users count
  const totalUsers = data?.data?.total || 0;

  // Determine if there are more users to load
  const hasMore = allUsers.length > 0 && allUsers.length < totalUsers;

  // Convert User objects to ItemType for MuiDropDown
  const mapUsersToItems = useCallback((users: User[]): ItemType[] => {
    return users.map((user) => ({
      value: user.id.toString(),
      label: `${user.firstName} ${user.lastName}`,
    }));
  }, []);

  // Convert selected user to ItemType array for MuiDropDown
  const selectedUserToItem = useCallback((): ItemType[] => {
    if (!selectedUser) return [];

    return [
      {
        value: selectedUser.id.toString(),
        label: `${selectedUser.firstName} ${selectedUser.lastName}`,
      },
    ];
  }, [selectedUser]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Handle scroll to load more
  const handleLoadMore = () => {
    if (!isLoading && !isFetching && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Handle selection change
  const handleSelectionChange = (items: ItemType[]) => {
    if (items.length === 0) {
      onChange(null);
    } else {
      // Find the user that matches the selected item's value
      const selectedItemValue = items[0].value;
      const selectedUser =
        allUsers.find((user) => user.id.toString() === selectedItemValue) || null;
      onChange(selectedUser);
    }
  };

  return (
    <MuiDropDown
      options={{
        label: isRequired ? `${title} *` : title,
        items: mapUsersToItems(allUsers),
        selectedValue: selectedUserToItem(),
        onChange: handleSelectionChange,
        isLoading: isLoading || isFetching,
        isDisabled,
        isValid,
        isLTR,
        onFullScroll: handleLoadMore,
        onSearch: handleSearch,
        searchPlaceholder: 'جستجوی کاربر...',
        isMultiSelectable: false,
        containerClass,
      }}
    />
  );
};

export default UserSingleSelectWidget;
