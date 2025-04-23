'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Box, Chip, CircularProgress, IconButton } from '@mui/material';
import { ItemType } from './mui-drop-down.type';

// Custom dropdown icon component
export const CustomDropdownIcon = ({ open }: { open: boolean }) => (
  <div className="flex items-center pr-2">
    <svg
      className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

// Custom clear button for single select
export const ClearButton = ({
  onClick,
  disabled,
}: {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}) => (
  <IconButton
    size="small"
    onClick={onClick}
    disabled={disabled}
    className="mr-2"
    sx={{ opacity: disabled ? 0.5 : 1 }}
  >
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </IconButton>
);

// Multi-select chip rendering
export const MultiSelectChips = ({
  selectedItems,
  onDelete,
  isLTR,
  viewType = 'simple',
  disabled = false,
}: {
  selectedItems: ItemType[];
  onDelete: (item: ItemType) => void;
  isLTR: boolean;
  viewType: 'simple' | 'chips';
  disabled?: boolean;
}) => {
  if (viewType === 'simple') {
    return (
      <div className={`flex items-center ${isLTR ? 'direction-ltr' : ''}`}>
        {selectedItems.length} item{selectedItems.length !== 1 && 's'} selected
      </div>
    );
  }

  // Chips view - render individual chips
  return (
    <Box
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
      className={isLTR ? 'direction-ltr' : ''}
    >
      {selectedItems.map((item) => (
        <Chip
          key={item.value}
          label={item.label}
          size="small"
          onDelete={disabled ? undefined : () => onDelete(item)}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          className={disabled ? 'opacity-60' : ''}
        />
      ))}
    </Box>
  );
};

// Marquee text for long content
export const MarqueeText = ({ children, isLTR }: { children: React.ReactNode; isLTR: boolean }) => {
  return (
    <div
      className={`overflow-hidden whitespace-nowrap ${isLTR ? 'direction-ltr' : ''}`}
      style={{ maxWidth: '100%' }}
    >
      <div className="hover:animate-marquee">{children}</div>
    </div>
  );
};

// Empty state when no items are available
export const EmptyState = () => (
  <div className="flex w-full items-center justify-center py-2 text-gray-500">
    No items available
  </div>
);

// Animated menu item
export const AnimatedMenuItem = ({
  children,
  isLTR,
  isSelected,
}: {
  children: React.ReactNode;
  isLTR: boolean;
  isSelected: boolean;
}) => (
  <div
    className={`flex w-full items-center transition-all duration-200 ${
      isLTR ? 'direction-ltr' : ''
    } ${
      isSelected
        ? 'bg-primary-light dark:bg-primary-dark-light'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
  >
    {children}
  </div>
);

// Loading indicator
export const LoadingIndicator = () => (
  <div className="flex w-full items-center justify-center py-2">
    <CircularProgress size={24} />
    <span className="ml-2">Loading...</span>
  </div>
);

// Search input component using Tailwind
export const SearchInput = ({
  placeholder,
  value,
  onChange,
  dir,
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dir?: string;
}) => (
  <input
    className="mb-2 w-full border-0 border-b border-gray-200 bg-transparent px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:text-gray-100 dark:focus:border-blue-500"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    dir={dir}
  />
);
