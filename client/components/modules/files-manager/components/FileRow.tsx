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

  // Check if file is currently uploading
  const isUploading = file.status === 'uploading';
  const isCompleted = file.status === 'completed';
  const isFailed = file.status === 'failed';

  return (
    <tr
      className={`${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'} transition-colors duration-150`}
      onClick={handleSelect}
    >
      {/* Selection checkbox */}
      <td className="whitespace-nowrap px-4 py-3">
        <button
          onClick={handleSelect}
          className={`h-5 w-5 rounded ${isSelected ? 'bg-blue-500 text-white' : 'border border-gray-300 dark:border-gray-600'} flex items-center justify-center`}
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
        <div className="flex flex-col">
          <div className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100">
            {file.name}
            {isUploading && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                ({file.progress}%)
              </span>
            )}
            {isFailed && (
              <span className="ml-2 text-xs text-red-600 dark:text-red-400">(Failed)</span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getFileExtension(file.name)}
          </div>
        </div>
      </td>

      {/* Tags */}
      <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
        {file.tags && file.tags.length > 0 ? (
          <FileTags tags={file.tags} limit={2} size="sm" />
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">No tags</span>
        )}
      </td>

      {/* File size */}
      <td className="hidden whitespace-nowrap px-4 py-3 sm:table-cell">
        <div className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</div>
      </td>

      {/* Upload date */}
      <td className="hidden whitespace-nowrap px-4 py-3 lg:table-cell">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(file.uploadDate)}
        </div>
      </td>

      {/* File type */}
      <td className="hidden whitespace-nowrap px-4 py-3 xl:table-cell">
        <div className="text-sm text-gray-500 dark:text-gray-400">{file.type.split('/').pop()}</div>
      </td>

      {/* Actions */}
      <td className="relative whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
        {/* Show options menu only for completed files */}
        {!isUploading && !isFailed ? (
          <>
            <button
              onClick={handleOptionsToggle}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="File options"
            >
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
          </>
        ) : isUploading ? (
          // Progress bar for uploading files
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            ></div>
          </div>
        ) : (
          // Retry button for failed uploads
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Could implement retry functionality here
            }}
            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Retry
          </button>
        )}
      </td>
    </tr>
  );
};

export default FileRow;
