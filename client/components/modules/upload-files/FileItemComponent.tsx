import React, { memo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import XIcon from './icons/XIcon';
import ImageFileIcon from './icons/ImageFileIcon';
import VideoFileIcon from './icons/VideoFileIcon';
import AudioFileIcon from './icons/AudioFileIcon';
import CompressedFileIcon from './icons/CompressedFileIcon';
import DocumentFileIcon from './icons/DocumentFileIcon';
import CompleteTickIcon from './icons/CompleteTickIcon';
import FailedXmarkIcon from './icons/FailedXmarkIcon';

export type FileUploadStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';

export type FileItemType = {
  id: string;
  name: string;
  size: string;
  type: string;
};

type FileItemProps = {
  file: FileItemType;
  status: FileUploadStatus;
  progress: number;
  errorMessage?: string;
  onCancel: (fileId: string) => void;
  onRemove: (fileId: string) => void;
  onRetry: (fileId: string) => void;
};

// Map file extensions to icons
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

const FileItem: React.FC<FileItemProps> = ({
  file,
  status,
  progress,
  errorMessage,
  onCancel,
  onRemove,
  onRetry,
}) => {
  // For tracking previous props to log changes
  const prevStatus = useRef<FileUploadStatus>(status);
  const prevProgress = useRef<number>(progress);

  // Log when component updates with different props
  useEffect(() => {
    if (prevStatus.current !== status || prevProgress.current !== progress) {
      // Only log if there's an actual change
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `FileItem ${file.id} updated: status changed from ${prevStatus.current} to ${status}, progress from ${prevProgress.current} to ${progress}`,
        );
      }

      // Update refs
      prevStatus.current = status;
      prevProgress.current = progress;
    }
  }, [file.id, status, progress]);

  const FileIcon = getFileIcon(file.type);

  // Explicit state variables for better rendering control
  const isReady = status === 'selected';
  const isUploading = status === 'uploading';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  // Only log in development mode and not for every render
  if (process.env.NODE_ENV === 'development' && (status !== 'selected' || progress > 0)) {
    console.log(
      `Rendering file ${file.id}: ${file.name} with status: ${status}, progress: ${progress}`,
    );
  }

  return (
    <div className="relative -right-[3px] flex h-16 w-full flex-row gap-2 overflow-hidden rounded-xl bg-gray-50">
      <div className="flex w-3/5 flex-col justify-center px-4">
        <p className="h-fit w-full truncate text-gray-700">{file.name}</p>
        <div className="flex h-fit w-full flex-row items-center gap-2">
          {isReady && (
            <>
              <p className="flex text-gray-500">ready</p>
            </>
          )}

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
              <p className="flex text-red-500">{errorMessage || 'failed'}</p>
            </div>
          )}

          <div className="flex h-3/5 w-[2px] rounded-xl bg-gray-300"></div>
          <p className="flex text-blue-500">{file.size}</p>
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
            <button onClick={() => onCancel(file.id)} className="flex w-1/12 hover:text-red-500">
              <XIcon />
            </button>
          </>
        )}

        {isCompleted && (
          <button
            onClick={() => onRemove(file.id)}
            className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-gray-600 transition-colors hover:bg-gray-300"
          >
            Remove
          </button>
        )}

        {isFailed && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => onRetry(file.id)}
              className="rounded-md bg-blue-100 px-2 py-1 text-blue-600 transition-colors hover:bg-blue-200"
            >
              Retry
            </button>
            <button
              onClick={() => onRemove(file.id)}
              className="rounded-md bg-gray-200 px-2 py-1 text-gray-600 transition-colors hover:bg-gray-300"
            >
              Remove
            </button>
          </div>
        )}

        {isReady && (
          <button
            onClick={() => onRemove(file.id)}
            className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-gray-600 transition-colors hover:bg-gray-300"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

// Use memo with custom comparison function to only re-render when necessary
export default memo(FileItem, (prevProps, nextProps) => {
  // Return false (causing re-render) if any of these props changed
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.progress !== nextProps.progress) return false;
  if (prevProps.errorMessage !== nextProps.errorMessage) return false;

  // Otherwise, don't re-render
  return true;
});
