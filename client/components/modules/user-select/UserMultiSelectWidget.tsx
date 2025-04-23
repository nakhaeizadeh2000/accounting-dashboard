'use client';

import React, { useState, useEffect, useCallback } from 'react';
import MuiDropDown from '@/components/modules/drop-downs/MuiDropDown';
import { ItemType } from '@/components/modules/drop-downs/mui-drop-down.type';
import { UserFormData } from '@/schemas/validations/users/user.schema';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import useDebounce from '@/shared/hooks/useDebounce.hook';

// Define User type based on UserFormData with an id
export type User = UserFormData & { id: string };

type Props = {
  options: {
    onChange: (users: User[]) => void;
    containerClass?: string;
    value?: User[];
    title?: string;
    isDisabled?: boolean;
    isValid?: boolean;
    isRequired?: boolean;
    isLTR?: boolean;
    multiSelectLabelsViewType?: 'simple' | 'chips';
  };
};

const UserMultiSelectWidget = ({
  options: {
    onChange,
    containerClass = 'w-full',
    value: selectedUsers = [],
    title = 'کاربران',
    isDisabled = false,
    isValid = true,
    isRequired = false,
    isLTR = false,
    multiSelectLabelsViewType = 'chips',
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

  // Convert selected users to ItemType array for MuiDropDown
  const selectedUsersToItems = useCallback((): ItemType[] => {
    if (!selectedUsers || selectedUsers.length === 0) return [];

    return selectedUsers.map((user) => ({
      value: user.id.toString(),
      label: `${user.firstName} ${user.lastName}`,
    }));
  }, [selectedUsers]);

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
      onChange([]);
    } else {
      // Map selected item values to actual user objects
      const selectedItemValues = items.map((item) => item.value);
      const selectedUsers = allUsers.filter((user) =>
        selectedItemValues.includes(user.id.toString()),
      );

      // If we have fewer selected users than items, it means some selected users
      // might not be in our current allUsers list (they might have been selected
      // before and are not in the current search results)
      if (selectedUsers.length < items.length) {
        // Keep previously selected users that are still selected
        const currentSelectedIds = new Set(selectedUsers.map((user) => user.id));
        const previouslySelectedUsers = selectedUsers.length > 0 ? selectedUsers : [];

        onChange(previouslySelectedUsers);
      } else {
        onChange(selectedUsers);
      }
    }
  };

  return (
    <MuiDropDown
      options={{
        label: isRequired ? `${title} *` : title,
        items: mapUsersToItems(allUsers),
        selectedValue: selectedUsersToItems(),
        onChange: handleSelectionChange,
        isLoading: isLoading || isFetching,
        isDisabled,
        isValid,
        isLTR,
        onFullScroll: handleLoadMore,
        onSearch: handleSearch,
        searchPlaceholder: 'جستجوی کاربر...',
        isMultiSelectable: true,
        multiSelectLabelsViewType,
        containerClass,
        hasMore,
      }}
    />
  );
};

export default UserMultiSelectWidget;
