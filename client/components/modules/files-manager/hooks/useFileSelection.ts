import { useState, useCallback } from 'react';
import { FileData } from '../types';

export function useFileSelection(allowMultiSelect: boolean = true) {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const toggleFileSelection = useCallback(
    (fileId: string) => {
      setSelectedFileIds((prev) => {
        if (prev.includes(fileId)) {
          return prev.filter((id) => id !== fileId);
        } else if (allowMultiSelect) {
          return [...prev, fileId];
        } else {
          return [fileId];
        }
      });
    },
    [allowMultiSelect],
  );

  const selectAll = useCallback(
    (allFileIds: string[]) => {
      if (selectedFileIds.length === allFileIds.length) {
        setSelectedFileIds([]);
      } else {
        setSelectedFileIds(allFileIds);
      }
    },
    [selectedFileIds],
  );

  const clearSelection = useCallback(() => {
    setSelectedFileIds([]);
  }, []);

  const isSelected = useCallback(
    (fileId: string) => selectedFileIds.includes(fileId),
    [selectedFileIds],
  );

  const getSelectedFiles = useCallback(
    (files: FileData[]) => {
      return files.filter((file) => selectedFileIds.includes(file.id));
    },
    [selectedFileIds],
  );

  return {
    selectedFileIds,
    toggleFileSelection,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedFiles,
  };
}
