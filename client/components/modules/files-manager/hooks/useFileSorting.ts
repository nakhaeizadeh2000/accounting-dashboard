import { useState, useCallback, useMemo } from 'react';
import { FileData, SortOption, SortDirection } from '../types';

export function useFileSorting(
  initialSortBy: SortOption = 'date',
  initialDirection: SortDirection = 'desc',
) {
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

  const changeSortOption = useCallback((option: SortOption) => {
    setSortBy(option);
    // Automatically set a sensible default direction for each sort option
    if (option === 'date') {
      setSortDirection('desc'); // Newest first
    } else if (option === 'name') {
      setSortDirection('asc'); // A to Z
    } else if (option === 'size') {
      setSortDirection('desc'); // Largest first
    } else {
      setSortDirection('asc'); // A to Z for type
    }
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const setSortParams = useCallback((option: SortOption, direction: SortDirection) => {
    setSortBy(option);
    setSortDirection(direction);
  }, []);

  const sortFiles = useCallback(
    (files: FileData[]): FileData[] => {
      return [...files].sort((a, b) => {
        let comparison = 0;

        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'date') {
          comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        } else if (sortBy === 'size') {
          comparison = a.size - b.size;
        } else if (sortBy === 'type') {
          comparison = a.type.localeCompare(b.type);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    },
    [sortBy, sortDirection],
  );

  return {
    sortBy,
    sortDirection,
    changeSortOption,
    toggleSortDirection,
    setSortParams,
    sortFiles,
  };
}
