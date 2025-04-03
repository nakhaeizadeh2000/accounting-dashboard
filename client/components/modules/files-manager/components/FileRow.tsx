// components/modules/file-manager/components/FileRow.tsx
import React from 'react';
import { FileRowProps } from '../types';
import { formatFileSize, formatDate, getFileExtension } from '../utils/fileHelpers';
import FileTypeIcon from './FileTypeIcon';
import FileTags from './FileTags';
import CompleteTickIcon from '@/components/icon/CompleteTickIcon';
import OptionsMenu from './OtionsMenu';

const FileRow: React.FC<FileRowProps> = ({
  file,
  isSelected,
  onSelect,
  onOptionsToggle,
  isOptionsOpen,
  onView,
  onDownload,
  onDelete,
  onTagsEdit,
}) => {
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(file.id);
  };

  const handleOptionsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOptionsToggle(file.id);
  };

  return (
    <tr
      className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors duration-150`}
      onClick={handleSelect}
    >
      {/* Selection checkbox */}
      <td className="whitespace-nowrap px-4 py-3">
        <button
          onClick={handleSelect}
          className={`h-5 w-5 rounded ${isSelected ? 'bg-blue-500 text-white' : 'border border-gray-300'} flex items-center justify-center`}
          aria-label={isSelected ? 'Deselect file' : 'Select file'}
        >
          {isSelected && <CompleteTickIcon width={12} height={12} />}
        </button>
      </td>

      {/* File icon */}
      <td className="whitespace-nowrap px-4 py-3">
        <FileTypeIcon fileType={file.type} className="h-8 w-8" />
      </td>

      {/* Filename */}
      <td className="whitespace-nowrap px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{file.name}</div>
        <div className="text-xs text-gray-500">{getFileExtension(file.name)}</div>
      </td>

      {/* Tags */}
      <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
        {file.tags && file.tags.length > 0 ? (
          <FileTags tags={file.tags} limit={2} size="sm" />
        ) : (
          <span className="text-xs text-gray-400">No tags</span>
        )}
      </td>

      {/* File size */}
      <td className="hidden whitespace-nowrap px-4 py-3 sm:table-cell">
        <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
      </td>

      {/* Upload date */}
      <td className="hidden whitespace-nowrap px-4 py-3 lg:table-cell">
        <div className="text-sm text-gray-500">{formatDate(file.uploadDate)}</div>
      </td>

      {/* File type */}
      <td className="hidden whitespace-nowrap px-4 py-3 xl:table-cell">
        <div className="text-sm text-gray-500">{file.type.split('/').pop()}</div>
      </td>

      {/* Actions */}
      <td className="relative whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
        <button
          onClick={handleOptionsToggle}
          className="text-gray-400 hover:text-gray-600"
          aria-label="File options"
        >
          {/* Replace with your own options/menu icon */}
          <span className="text-lg">⋮</span>
        </button>

        {isOptionsOpen && (
          <OptionsMenu
            isOpen={isOptionsOpen}
            onClose={() => onOptionsToggle('')}
            onView={() => onView()}
            onDownload={() => onDownload()}
            onDelete={() => onDelete()}
            onTags={() => onTagsEdit()}
            position="top-right"
          />
        )}
      </td>
    </tr>
  );
};

export default FileRow;
