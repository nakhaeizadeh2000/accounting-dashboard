'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, IconButton, Collapse } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers-pro';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ItemType } from '@/components/modules/checkBox/drop-down/drop-down.type';
import { FiFilter, FiX, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import UserSingleSelectWidget from '../../../../components/widgets/users/UserSingleSelectWidget';
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalaliV3';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/redux.hook';
import { unset } from 'lodash';
import { ArticleFilterFormData } from './ArticleListComponent';

interface ArticleFilterComponentProps {
  onFilter: (filters: ArticleFilterFormData) => void;
  onResetFilters: () => void;
}

const ArticleFilterComponent: React.FC<ArticleFilterComponentProps> = ({
  onFilter,
  onResetFilters,
}) => {
  const dispatch = useAppDispatch();

  // Get current filter from Redux store
  const currentFilter = useAppSelector((state) => state.article.currentFilter);

  // Local state for filter panel
  const [isExpanded, setIsExpanded] = useState(false);

  // Form state (initialized from Redux)
  const [filters, setFilters] = useState<ArticleFilterFormData>({
    title: currentFilter.title || '',
    authorId: currentFilter.authorId ? Number(currentFilter.authorId) : undefined,
    startDate: currentFilter.fromDate,
    endDate: currentFilter.toDate,
    page: currentFilter.page,
    limit: currentFilter.limit,
  });

  // Selected user state for the dropdown
  const [selectedUser, setSelectedUser] = useState<ItemType[]>([]);

  // Date states
  const [fromDate, setFromDate] = useState<Date | null>(
    currentFilter.fromDate ? new Date(currentFilter.fromDate) : null,
  );
  const [toDate, setToDate] = useState<Date | null>(
    currentFilter.toDate ? new Date(currentFilter.toDate) : null,
  );

  // Update local state when Redux state changes
  useEffect(() => {
    setFilters({
      title: currentFilter.title || '',
      authorId: currentFilter.authorId ? Number(currentFilter.authorId) : undefined,
      startDate: currentFilter.fromDate,
      endDate: currentFilter.toDate,
      page: currentFilter.page,
      limit: currentFilter.limit,
    });

    // Set selected user if authorId exists
    if (currentFilter.authorId && selectedUser.length === 0) {
      setSelectedUser([{ value: currentFilter.authorId, label: currentFilter.authorId }]);
    }

    // Set date objects if dates exist
    if (currentFilter.fromDate && !fromDate) {
      setFromDate(new Date(currentFilter.fromDate));
    }

    if (currentFilter.toDate && !toDate) {
      setToDate(new Date(currentFilter.toDate));
    }
  }, [currentFilter]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  };

  // Handle user selection
  const handleUserSelect = (users: ItemType[]) => {
    setSelectedUser(users);
    setFilters((prev) => ({
      ...prev,
      authorId: users.length > 0 ? Number(users[0].value) : undefined,
    }));
  };

  // Handle from date change
  const handleFromDateChange = (date: Date | null) => {
    setFromDate(date);
    setFilters((prev) => ({
      ...prev,
      startDate: date ? date.toISOString() : undefined,
    }));
  };

  // Handle to date change
  const handleToDateChange = (date: Date | null) => {
    setToDate(date);
    setFilters((prev) => ({
      ...prev,
      endDate: date ? date.toISOString() : undefined,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      ...filters,
      page: 1, // Reset to first page on filter change
    });
  };

  // Handle reset filters
  const handleReset = () => {
    setFilters({
      title: '',
      authorId: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
      limit: 10,
    });
    setSelectedUser([]);
    setFromDate(null);
    setToDate(null);
    onResetFilters();
  };

  // Handle quick search (without opening filter panel)
  const handleQuickSearch = () => {
    onFilter({
      ...filters,
      page: 1, // Reset to first page
    });
  };

  // Toggle filter panel expansion
  const toggleExpansion = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="mb-6 rounded-lg bg-neutral-50 p-4 shadow-sm dark:bg-gray-900">
      {/* Filter toggle button */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="text"
          className="[&&]:text-neutral-700 [&&]:dark:text-neutral-300"
          startIcon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          onClick={toggleExpansion}
        >
          فیلترها
        </Button>

        {/* Quick search field (always visible) */}
        <div className="flex w-1/3 items-center">
          <TextField
            placeholder="جستجو بر اساس عنوان"
            variant="outlined"
            size="small"
            value={filters.title || ''}
            onChange={handleTitleChange}
            fullWidth
            sx={{
              // Root class for the input field
              '& .MuiInputBase-input': {
                boxShadow: 'none',
              },
            }}
            slotProps={{
              input: {
                startAdornment: <FiSearch className="ml-2 text-gray-400" />,
                endAdornment: filters.title ? (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, title: '' }));
                      if (!filters.authorId && !filters.startDate && !filters.endDate) {
                        onResetFilters(); // Only reset if this is the only active filter
                      } else {
                        onFilter({ ...filters, title: '' });
                      }
                    }}
                  >
                    <FiX />
                  </IconButton>
                ) : null,
              },
            }}
          />
          <Button variant="contained" color="primary" className="mr-2" onClick={handleQuickSearch}>
            جستجو
          </Button>
        </div>
      </div>

      {/* Expandable filter panel */}
      <Collapse in={isExpanded}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Author selection */}
          <div>
            <UserSingleSelectWidget
              options={{
                onChange: handleUserSelect,
                value: selectedUser,
                containerClass: 'w-full',
                title: 'نویسنده',
              }}
            />
          </div>

          {/* Date range */}
          <LocalizationProvider dateAdapter={AdapterDateFnsJalali}>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                از تاریخ
              </label>
              <DatePicker
                value={fromDate}
                onChange={handleFromDateChange}
                format="yyyy/MM/dd"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                تا تاریخ
              </label>
              <DatePicker
                value={toDate}
                onChange={handleToDateChange}
                format="yyyy/MM/dd"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </div>
          </LocalizationProvider>

          {/* Action buttons */}
          <div className="flex items-end justify-end gap-2 md:col-span-3">
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={handleReset}
              startIcon={<FiX />}
            >
              پاک کردن فیلترها
            </Button>

            <Button type="submit" variant="contained" color="primary" startIcon={<FiFilter />}>
              اعمال فیلترها
            </Button>
          </div>
        </form>
      </Collapse>
    </div>
  );
};

export default ArticleFilterComponent;
