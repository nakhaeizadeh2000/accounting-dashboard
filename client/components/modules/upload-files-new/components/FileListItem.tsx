import React, { memo } from 'react';
import { FileListItemProps } from '../types/file-upload.types';
import XIcon from '../icons/XIcon';
import CompleteTickIcon from '../icons/CompleteTickIcon';
import FailedXmarkIcon from '../icons/FailedXmarkIcon';

// Import your file type icons
import ImageFileIcon from '../icons/ImageFileIcon';
import VideoFileIcon from '../icons/VideoFileIcon';
import AudioFileIcon from '../icons/AudioFileIcon';
import CompressedFileIcon from '../icons/CompressedFileIcon';
import DocumentFileIcon from '../icons/DocumentFileIcon';

/**
 * Maps file mime types to appropriate icons
 */
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return ImageFileIcon;
  } else if (fileType.startsWith('video/')) {
    return VideoFileIcon;
  } else if (fileType.startsWith('audio/')) {
    return AudioFileIcon;
  } else if (
    fileType.includes('zip') ||
    fileType.includes('rar') ||
    fileType.includes('compressed')
  ) {
    return CompressedFileIcon;
  } else {
    return DocumentFileIcon;
  }
};

/**
 * A single file item in the file list
 * This component is memoized to prevent unnecessary re-renders
 */
const FileListItem: React.FC<FileListItemProps> = ({ file, onCancel, onRemove, onRetry }) => {
  const { id, name, size, type, status, progress, error } = file;
  const FileIcon = getFileIcon(type);

  // Status flags for conditional rendering
  const isReady = status === 'selected';
  const isUploading = status === 'uploading';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  return (
    <div className="relative -right-[3px] flex h-16 w-full flex-row gap-2 overflow-hidden rounded-xl bg-gray-50">
      <div className="flex w-3/5 flex-col justify-center px-4">
        <p className="h-fit w-full truncate text-gray-700">{name}</p>
        <div className="flex h-fit w-full flex-row items-center gap-2">
          {isReady && <p className="flex text-gray-500">ready</p>}

          {isUploading && (
            <>
              <p className="flex text-blue-500">{progress}%</p>
              <div className="flex h-3/5 w-[2px] rounded-xl bg-gray-300"></div>
              <p className="flex text-blue-500">uploading</p>
            </>
          )}

          {isCompleted && (
            <div className="flex items-center gap-1">
              <CompleteTickIcon width={16} height={16} />
              <p className="flex text-green-500">completed</p>
            </div>
          )}

          {isFailed && (
            <div className="flex items-center gap-1">
              <FailedXmarkIcon width={16} height={16} />
              <p className="flex text-red-500">{error || 'failed'}</p>
            </div>
          )}

          <div className="flex h-3/5 w-[2px] rounded-xl bg-gray-300"></div>
          <p className="flex text-blue-500">{size}</p>
        </div>
      </div>

      <div className="flex w-2/5 flex-row items-center gap-2 px-2">
        {isUploading && (
          <>
            <div className="flex h-[.325rem] w-11/12 rounded-xl bg-gray-200">
              <div
                className="h-full rounded-xl bg-blue-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <button onClick={() => onCancel(id)} className="flex w-1/12 hover:text-red-500">
              <XIcon />
            </button>
          </>
        )}

        {isCompleted && (
          <button
            onClick={() => onRemove(id)}
            className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-gray-600 transition-colors hover:bg-gray-300"
          >
            Remove
          </button>
        )}

        {isFailed && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => onRetry(id)}
              className="rounded-md bg-blue-100 px-2 py-1 text-blue-600 transition-colors hover:bg-blue-200"
            >
              Retry
            </button>
            <button
              onClick={() => onRemove(id)}
              className="rounded-md bg-gray-200 px-2 py-1 text-gray-600 transition-colors hover:bg-gray-300"
            >
              Remove
            </button>
          </div>
        )}

        {isReady && (
          <button
            onClick={() => onRemove(id)}
            className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-gray-600 transition-colors hover:bg-gray-300"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(FileListItem, (prevProps, nextProps) => {
  // Only re-render if these props change
  const prevFile = prevProps.file;
  const nextFile = nextProps.file;

  return (
    prevFile.status === nextFile.status &&
    prevFile.progress === nextFile.progress &&
    prevFile.error === nextFile.error
  );
});
