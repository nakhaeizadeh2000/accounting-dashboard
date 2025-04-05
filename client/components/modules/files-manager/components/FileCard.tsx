// components/modules/file-manager/components/FileCard.tsx
import React from 'react';
import { FileCardProps } from '../types';
import { formatFileSize, formatDate } from '../utils/fileHelpers';
import FileTypeIcon from './FileTypeIcon';
import FileTags from './FileTags';
import CompleteTickIcon from '@/components/icon/CompleteTickIcon';
import OptionsMenu from './OtionsMenu';
import Image from 'next/image';

const FileCard: React.FC<FileCardProps> = ({
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
  const handleClick = (e: React.MouseEvent) => {
    // Prevent propagation to avoid triggering other click events
    e.stopPropagation();
    onSelect(file.id);
  };

  const handleOptionsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOptionsToggle(file.id);
  };

  // Check if file is an image by MIME type
  const isImage = file.type.startsWith('image/');

  // Check if file is currently uploading
  const isUploading = file.status === 'uploading';
  const isCompleted = file.status === 'completed';
  const isFailed = file.status === 'failed';

  return (
    <div className="group relative">
      <div
        className={`h-full overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-500'
            : 'border-gray-200 hover:shadow-md dark:border-gray-700'
        }`}
        onClick={handleClick}
      >
        {/* Selection indicator */}
        <div className="absolute left-2 top-2 z-10">
          <button
            className={`flex h-5 w-5 items-center justify-center rounded ${
              isSelected
                ? 'bg-blue-500 text-white'
                : 'border border-gray-300 bg-white/90 dark:border-gray-600 dark:bg-gray-700/90'
            } shadow-sm`}
            onClick={handleClick}
          >
            {isSelected && <CompleteTickIcon width={12} height={12} />}
          </button>
        </div>

        {/* Options menu button - Only show if not uploading */}
        {!isUploading && !isFailed && (
          <div className="absolute right-2 top-2 z-10">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm hover:text-gray-700 dark:bg-gray-700/90 dark:text-gray-300 dark:hover:text-gray-100"
              onClick={handleOptionsToggle}
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
          </div>
        )}

        {/* Upload progress indicator */}
        {isUploading && file.progress !== undefined && (
          <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${file.progress}%` }}
            ></div>
          </div>
        )}

        {/* Upload status indicator */}
        {isUploading && (
          <div className="absolute right-2 top-2 z-10 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {file.progress}%
          </div>
        )}

        {isFailed && (
          <div className="absolute right-2 top-2 z-10 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
            Failed
          </div>
        )}

        {/* File preview/icon */}
        <div className="flex aspect-square items-center justify-center bg-gray-50 dark:bg-gray-900">
          {isImage && file.thumbnailUrl ? (
            <div className="relative h-full w-full">
              <Image
                src={file.thumbnailUrl}
                alt={file.name}
                className="h-full w-full object-cover"
                width={300}
                height={300}
              />
            </div>
          ) : (
            <FileTypeIcon fileType={file.type} className="h-16 w-16" />
          )}
        </div>

        {/* File info */}
        <div className="p-3">
          <div
            className="truncate text-sm font-medium text-gray-800 dark:text-gray-200"
            title={file.name}
          >
            {file.name}
          </div>

          {file.tags && file.tags.length > 0 && (
            <div className="mt-1">
              <FileTags tags={file.tags} limit={2} size="sm" />
            </div>
          )}

          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatFileSize(file.size)}</span>
            <span>{formatDate(file.uploadDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
