'use client';

import React, { useState } from 'react';
import { ArticleFilterFormData } from '@/schemas/validations/article/article.schema';
import { Button, TextField, IconButton, Collapse } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers-pro';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ItemType } from '@/components/modules/drop-downs/drop-down.type';
import { FiFilter, FiX, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import UserSingleSelectWidget from '../../UserSingleSelectWidget';

interface ArticleFilterComponentProps {
  onFilter: (filters: ArticleFilterFormData) => void;
  onResetFilters: () => void;
}

const ArticleFilterComponent: React.FC<ArticleFilterComponentProps> = ({
  onFilter,
  onResetFilters,
}) => {
  // Filter state
  const [filters, setFilters] = useState<ArticleFilterFormData>({
    title: '',
    authorId: undefined,
    fromDate: undefined,
    toDate: undefined,
    page: 1,
    limit: 10,
  });

  // Selected user state for the dropdown
  const [selectedUser, setSelectedUser] = useState<ItemType[]>([]);

  // Date states
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Filter panel expansion state
  const [isExpanded, setIsExpanded] = useState(false);

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
      authorId: users.length > 0 ? users[0].value.toString() : undefined,
    }));
  };

  // Handle from date change
  const handleFromDateChange = (date: Date | null) => {
    setFromDate(date);
    setFilters((prev) => ({
      ...prev,
      fromDate: date ? date.toISOString() : undefined,
    }));
  };

  // Handle to date change
  const handleToDateChange = (date: Date | null) => {
    setToDate(date);
    setFilters((prev) => ({
      ...prev,
      toDate: date ? date.toISOString() : undefined,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  // Handle reset filters
  const handleReset = () => {
    setFilters({
      title: '',
      authorId: undefined,
      fromDate: undefined,
      toDate: undefined,
      page: 1,
      limit: 10,
    });
    setSelectedUser([]);
    setFromDate(null);
    setToDate(null);
    onResetFilters();
  };

  // Toggle filter panel expansion
  const toggleExpansion = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      {/* Filter toggle button */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="text"
          color="primary"
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
            InputProps={{
              startAdornment: <FiSearch className="ml-2 text-gray-400" />,
              endAdornment: filters.title ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, title: '' }));
                    if (!filters.authorId && !filters.fromDate && !filters.toDate) {
                      onResetFilters(); // Only reset if this is the only active filter
                    } else {
                      onFilter({ ...filters, title: '' });
                    }
                  }}
                >
                  <FiX />
                </IconButton>
              ) : null,
            }}
          />
          <Button variant="contained" color="primary" className="mr-2" onClick={handleSubmit}>
            جستجو
          </Button>
        </div>
      </div>

      {/* Expandable filter panel */}
      <Collapse in={isExpanded}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Author selection */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              نویسنده
            </label>
            <UserSingleSelectWidget
              options={{
                onChange: handleUserSelect,
                value: selectedUser,
                containerClass: 'w-full',
              }}
            />
          </div>

          {/* Date range */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
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
