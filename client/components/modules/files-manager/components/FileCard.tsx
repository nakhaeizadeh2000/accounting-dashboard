// components/modules/file-manager/components/FileCard.tsx
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { FileCardProps } from '../types';
import { formatFileSize, formatDate, getFileTypeFromExtension } from '../utils/fileHelpers';
import FileTypeIcon from './FileTypeIcon';
import FileTags from './FileTags';
import CompleteTickIcon from '@/components/icon/CompleteTickIcon';
import OptionsMenu from './OtionsMenu';
import Image from 'next/image';

// Define the component first with proper typing
const FileCardComponent: React.FC<FileCardProps> = ({
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
  // Track if image fails to load
  const [imageError, setImageError] = useState(false);
  // Use ref to avoid unnecessary rerenders
  const attemptedLoadRef = useRef(false);
  // Create a stable cache key for this file
  const cacheKey = useRef(`v1-${file.id}`).current;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      // Prevent propagation to avoid triggering other click events
      e.stopPropagation();
      onSelect(file.id);
    },
    [file.id, onSelect],
  );

  const handleOptionsToggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.stopPropagation();
      onOptionsToggle(file.id);
    },
    [file.id, onOptionsToggle],
  );

  const handleButtonSelect = useCallback(
    (e: React.MouseEvent): void => {
      e.stopPropagation();
      onSelect(file.id);
    },
    [file.id, onSelect],
  );

  // Get real file type based on extension if mimetype is application/octet-stream
  const actualFileType = useMemo(
    () =>
      file.type === 'application/octet-stream' ? getFileTypeFromExtension(file.name) : file.type,
    [file.name, file.type],
  );

  // Check if file is an image or other previewable type
  const isImage = useMemo(() => actualFileType.startsWith('image/'), [actualFileType]);

  // Check if file is currently uploading
  const isUploading = file.status === 'uploading';
  const isFailed = file.status === 'failed';

  // Use direct download URL for previews with cache parameter
  const directUrl = useMemo(
    () =>
      `/api/files/download/${file.bucket}/${encodeURIComponent(file.id)}?direct=true&cache=${cacheKey}`,
    [file.bucket, file.id, cacheKey],
  );

  const handleImageError = useCallback(() => {
    if (!attemptedLoadRef.current) {
      attemptedLoadRef.current = true;
      // One retry attempt with slight delay
      setTimeout(() => {
        setImageError(true);
      }, 500);
    } else {
      setImageError(true);
    }
  }, []);

  const progressStyle = useMemo(
    () => ({
      width: `${file.progress ?? 0}%`,
    }),
    [file.progress],
  );

  // Memoize the image container to prevent re-renders
  const imageContainer = useMemo(() => {
    if (isImage && !imageError) {
      return (
        <div className="relative h-full w-full">
          <Image
            src={directUrl}
            alt={file.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={handleImageError}
            unoptimized
            priority={false}
            loading="lazy"
          />
        </div>
      );
    } else {
      return <FileTypeIcon fileType={actualFileType} className="h-16 w-16" />;
    }
  }, [isImage, imageError, directUrl, file.name, actualFileType, handleImageError]);

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
            onClick={handleButtonSelect}
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
                onView={onView}
                onDownload={onDownload}
                onDelete={onDelete}
                onTags={onTagsEdit}
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
              style={progressStyle}
            ></div>
          </div>
        )}

        {/* Upload status indicator */}
        {isUploading && (
          <div className="absolute right-2 top-2 z-10 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {file.progress !== undefined ? `${file.progress}%` : 'Uploading...'}
          </div>
        )}

        {isFailed && (
          <div className="absolute right-2 top-2 z-10 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
            Failed
          </div>
        )}

        {/* File preview/icon */}
        <div className="flex aspect-square items-center justify-center bg-gray-50 dark:bg-gray-900">
          {imageContainer}
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

// Then wrap it with React.memo separately to fix the ESLint issues
const FileCard = React.memo(FileCardComponent);

// Add display name for better debugging
FileCard.displayName = 'FileCard';

export default FileCard;
