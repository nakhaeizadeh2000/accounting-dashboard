import React, { useState, useCallback, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import useDebounce from '@/shared/hooks/useDebounce.hook';

interface UserFilterProps {
  onFilterChange: (value: string) => void;
  filterValue: string;
  placeholder?: string;
  debounceTime?: number;
}

const UserFilter: React.FC<UserFilterProps> = ({
  onFilterChange,
  filterValue,
  placeholder = 'جستجوی کاربر...',
  debounceTime = 500,
}) => {
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = useState(filterValue);

  // Debounced value that will trigger the actual filter change
  const debouncedValue = useDebounce(localValue, debounceTime);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(filterValue);
  }, [filterValue]);

  // Call onFilterChange when debounced value changes
  useEffect(() => {
    if (debouncedValue !== filterValue) {
      onFilterChange(debouncedValue);
    }
  }, [debouncedValue, onFilterChange, filterValue]);

  // Handle input change - only update local state
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  return (
    <div className="p-2">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <FiSearch className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
        />
      </div>
    </div>
  );
};

export default UserFilter;
