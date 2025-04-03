// components/modules/file-manager/components/FilterBar.tsx
import React, { useState } from 'react';
import { FilterBarProps } from '../types';
import CompleteTickIcon from '@/components/icon/CompleteTickIcon';

// Note: Need additional icons:
// - SearchIcon
// - ArrowUpDownIcon
// - SortAscIcon
// - SortDescIcon
// - GridViewIcon
// - ListViewIcon

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  onSortChange,
  onSortDirectionChange,
  currentSort,
  currentSortDirection,
  selectedFiles,
  totalFiles,
  onSelectAll,
  onClearSelection,
  onDownloadSelected,
  onDeleteSelected,
  onViewModeChange,
  currentViewMode,
}) => {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date' },
    { value: 'size', label: 'Size' },
    { value: 'type', label: 'Type' },
  ];

  const handleSortChange = (sortOption: string) => {
    onSortChange(sortOption as any);
    setIsSortDropdownOpen(false);
  };

  const toggleSortDropdown = () => {
    setIsSortDropdownOpen(!isSortDropdownOpen);
  };

  const getSortOptionLabel = () => {
    const option = sortOptions.find((opt) => opt.value === currentSort);
    return option ? option.label : 'Sort';
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-3">
        {/* Selection controls */}
        <div className="flex items-center">
          <button
            onClick={onSelectAll}
            className={`relative flex h-6 w-6 items-center justify-center rounded border ${
              selectedFiles.length > 0
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-300 text-gray-400'
            }`}
            aria-label={selectedFiles.length > 0 ? 'Deselect all' : 'Select all'}
          >
            {selectedFiles.length > 0 && <CompleteTickIcon height={16} width={16} />}
          </button>

          {selectedFiles.length > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-700">
              {selectedFiles.length} selected
            </span>
          )}
        </div>

        {/* Bulk actions - only show when items are selected */}
        {selectedFiles.length > 0 && (
          <div className="ml-2 flex items-center space-x-2">
            <div className="mx-1 h-4 border-l border-gray-300"></div>
            <button
              onClick={onDownloadSelected}
              className="text-sm text-blue-600 hover:text-blue-800"
              aria-label="Download selected"
            >
              ⬇️ Download
            </button>
            <button
              onClick={onDeleteSelected}
              className="text-sm text-red-600 hover:text-red-800"
              aria-label="Delete selected"
            >
              🗑️ Delete
            </button>
            <button
              onClick={onClearSelection}
              className="text-sm text-gray-600 hover:text-gray-800"
              aria-label="Clear selection"
            >
              ✕ Clear
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">🔍</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search files..."
            className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleSortDropdown}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {getSortOptionLabel()}
            <span className="ml-2">{currentSortDirection === 'asc' ? '↑' : '↓'}</span>
          </button>

          {isSortDropdownOpen && (
            <div className="absolute right-0 z-10 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      currentSort === option.value ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } hover:bg-gray-100`}
                    role="menuitem"
                  >
                    {option.label}
                  </button>
                ))}
                <div className="my-1 border-t border-gray-100"></div>
                <button
                  onClick={() =>
                    onSortDirectionChange(currentSortDirection === 'asc' ? 'desc' : 'asc')
                  }
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  {currentSortDirection === 'asc' ? '↓ Descending' : '↑ Ascending'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View mode toggle */}
        <div className="inline-flex flex-row-reverse rounded-md shadow-sm">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`relative inline-flex items-center rounded-l-md border px-3 py-2 text-sm font-medium ${
              currentViewMode === 'grid'
                ? 'z-10 border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`relative -ml-px inline-flex items-center rounded-r-md border px-3 py-2 text-sm font-medium ${
              currentViewMode === 'list'
                ? 'z-10 border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            List
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
