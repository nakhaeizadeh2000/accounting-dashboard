'use client';

import { useState, useRef, ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import useMultiFileUpload from './hook/useMultiFileUpload';
import { FileUploadInfo } from '@/store/features/files/progress-slice';
import AddFileIcon from './icons/AddFileIcon';
import CompleteTickIcon from './icons/CompleteTickIcon';
import FailedXmarkIcon from './icons/FailedXmarkIcon';
import XIcon from './icons/XIcon';
import ImageFileIcon from './icons/ImageFileIcon';
import VideoFileIcon from './icons/VideoFileIcon';
import AudioFileIcon from './icons/AudioFileIcon';
import CompressedFileIcon from './icons/CompressedFileIcon';
import DocumentFileIcon from './icons/DocumentFileIcon';
import styles from 'components/modules/upload-files/styles/upload-file.module.scss';
import { cancelUploadRequest } from '@/store/features/files/files.api';

export interface MultiFileUploadProps {
  id?: string; // Unique instance ID for component
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  onUploadComplete?: (uploadedFiles: FileUploadInfo[]) => void;
  onAllUploadsComplete?: (succeeded: FileUploadInfo[], failed: FileUploadInfo[]) => void;
  onError?: (error: any) => void;
}

// Map file extensions to icons
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <ImageFileIcon width={24} height={24} />;
  } else if (fileType.startsWith('video/')) {
    return <VideoFileIcon width={24} height={24} />;
  } else if (fileType.startsWith('audio/')) {
    return <AudioFileIcon width={24} height={24} />;
  } else if (
    fileType.includes('zip') ||
    fileType.includes('rar') ||
    fileType.includes('compressed')
  ) {
    return <CompressedFileIcon width={24} height={24} />;
  } else {
    return <DocumentFileIcon width={24} height={24} />;
  }
};

// Format file size with appropriate units
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Round to 2 decimal places for precision
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${formattedSize} ${sizes[i]}`;
};

// Format filename to handle long names
const formatFileName = (name: string, maxLength: number = 20): string => {
  if (name.length <= maxLength) return name;

  const extension = name.includes('.') ? name.split('.').pop() || '' : '';
  const baseName = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;

  if (extension) {
    const maxBaseLength = maxLength - extension.length - 1;
    if (maxBaseLength > 3) {
      return `${baseName.slice(0, maxBaseLength)}...${extension}`;
    }
  }

  return `${name.slice(0, maxLength)}...`;
};

// Get status text for display
const getStatusText = (status: string): string => {
  switch (status) {
    case 'uploading':
      return 'uploading';
    case 'waiting':
      return 'queued';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'failed';
    default:
      return status;
  }
};

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  id,
  bucket = 'default',
  acceptedFileTypes = 'image/jpeg,image/png,application/pdf',
  maxSizeMB = 10,
  onUploadComplete,
  onAllUploadsComplete,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    componentId,
    queue,
    queueStatus,
    currentUploadingFile,
    isUploading,
    addFilesToQueue,
    removeFileFromQueue,
    startFileUpload,
    cancelSingleUpload,
    cancelAllFileUploads,
    retryFailedUpload,
    retryAllFailed,
    resetForMoreFiles,
  } = useMultiFileUpload({
    id, // Pass component ID for isolation
    bucket,
    onUploadComplete,
    onAllUploadsComplete,
    onError,
  });

  // Check if there are any failed files in the queue
  const hasFailedFiles = queue.some((file) => file.status === 'failed');

  // Allowed file types displayed in UI
  const allowedTypes = acceptedFileTypes
    ? acceptedFileTypes
        .split(',')
        .map((type) =>
          type.includes('/*')
            ? type.split('/')[0].toUpperCase()
            : `.${type.split('/')[1].toUpperCase()}`,
        )
    : ['PDF', 'DOCX', 'TXT'];

  // Add max size to displayed constraints
  const displayConstraints = [...allowedTypes];
  if (maxSizeMB) {
    displayConstraints.push(`< ${maxSizeMB}MB`);
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const selectedFiles = Array.from(e.target.files || []);

    // Validate files before adding to queue
    const validFiles = selectedFiles.filter((file) => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setValidationError(`File "${file.name}" exceeds the size limit`);
        return false;
      }

      // Check file type
      if (acceptedFileTypes && acceptedFileTypes.trim() !== '') {
        const fileTypeAccepted = acceptedFileTypes.split(',').some((type) => {
          const trimmedType = type.trim();
          if (trimmedType.includes('/*')) {
            const generalType = trimmedType.split('/')[0];
            return file.type.startsWith(`${generalType}/`);
          }
          return file.type === trimmedType;
        });

        if (!fileTypeAccepted) {
          setValidationError(`File "${file.name}" type is not accepted`);
          return false;
        }
      }

      return true;
    });

    if (validFiles.length > 0) {
      addFilesToQueue(validFiles);
    }

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);

    // Validate files before adding to queue
    const validFiles = files.filter((file) => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setValidationError(`File "${file.name}" exceeds the size limit`);
        return false;
      }

      // Check file type
      if (acceptedFileTypes && acceptedFileTypes.trim() !== '') {
        const fileTypeAccepted = acceptedFileTypes.split(',').some((type) => {
          const trimmedType = type.trim();
          if (trimmedType.includes('/*')) {
            const generalType = trimmedType.split('/')[0];
            return file.type.startsWith(`${generalType}/`);
          }
          return file.type === trimmedType;
        });

        if (!fileTypeAccepted) {
          setValidationError(`File "${file.name}" type is not accepted`);
          return false;
        }
      }

      return true;
    });

    if (validFiles.length > 0) {
      addFilesToQueue(validFiles);
    }
  };

  const handleCancel = (fileId: string) => {
    // First cancel the actual XHR request
    cancelUploadRequest(fileId);
    // Then update the state
    cancelSingleUpload(fileId);
  };

  const handleSelectMoreFiles = () => {
    resetForMoreFiles();
    // Open file selector automatically
    setTimeout(() => {
      openFileSelector();
    }, 100);
  };

  // Render file selection area
  const renderFileSelector = () => {
    return (
      <div
        className={`flex h-5/6 w-full flex-col items-center justify-center overflow-hidden rounded-xl ${dragActive ? 'bg-blue-50' : 'bg-gray-50'}`}
        onClick={
          queueStatus === 'idle' || queueStatus === 'selected' ? openFileSelector : undefined
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        data-upload-id={id || componentId}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          className="hidden"
          multiple
        />

        {(queueStatus === 'idle' || queueStatus === 'selected') && (
          <>
            <AddFileIcon width={45} height={45} />
            <p className="mt-4 text-xl leading-[1.125rem] text-neutral-400">
              click or drop files to upload
            </p>
            {validationError && <p className="mt-2 text-sm text-red-500">{validationError}</p>}
            {queueStatus === 'selected' && queue.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent file dialog from opening
                  startFileUpload();
                }}
                className="mt-6 flex rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                Start Upload
              </button>
            )}
          </>
        )}

        {queueStatus === 'uploading' && (
          <div className="flex flex-col items-center justify-center">
            <p className="text-xl leading-[1.125rem] text-blue-500">Uploading Files...</p>
            <p className="mt-2 text-sm text-neutral-500">
              {`${queue.filter((f) => f.status === 'completed').length} of ${queue.length} files completed`}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cancelAllFileUploads();
              }}
              className="mt-4 flex rounded-md bg-red-200 px-2 py-1 text-red-600 transition-colors hover:bg-red-300"
            >
              Cancel All Uploads
            </button>
          </div>
        )}

        {queueStatus === 'completed' && (
          <div className="flex flex-col items-center justify-center">
            <CompleteTickIcon width={45} height={45} />
            <p className="mt-4 text-xl leading-[1.125rem] text-green-500">
              All files uploaded successfully!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMoreFiles();
              }}
              className="mt-4 flex rounded-md bg-blue-200 px-3 py-1 text-blue-600 transition-colors hover:bg-blue-300"
            >
              Select More Files to Upload
            </button>
          </div>
        )}

        {queueStatus === 'failed' && !hasFailedFiles && (
          <div className="flex flex-col items-center justify-center">
            <CompleteTickIcon width={45} height={45} />
            <p className="mt-4 text-xl leading-[1.125rem] text-green-500">
              All files uploaded successfully!
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMoreFiles();
              }}
              className="mt-4 flex rounded-md bg-blue-200 px-3 py-1 text-blue-600 transition-colors hover:bg-blue-300"
            >
              Select More Files to Upload
            </button>
          </div>
        )}

        {queueStatus === 'failed' && hasFailedFiles && (
          <div className="flex flex-col items-center justify-center">
            <FailedXmarkIcon width={45} height={45} />
            <p className="mt-4 text-xl leading-[1.125rem] text-red-500">
              Some files failed to upload
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  retryAllFailed();
                }}
                className="flex rounded-md bg-blue-200 px-3 py-1 text-blue-600 transition-colors hover:bg-blue-300"
              >
                Retry Failed Files
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectMoreFiles();
                }}
                className="flex rounded-md bg-green-200 px-3 py-1 text-green-600 transition-colors hover:bg-green-300"
              >
                Select More Files
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render files list with statuses and progress
  const renderFilesList = () => {
    return (
      <div
        className={`${styles.scrollableDiv} flex h-full w-1/2 flex-col gap-2 overflow-y-scroll rounded-xl bg-gray-300 p-2 direction-ltr`}
      >
        {queue.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            No files selected
          </div>
        ) : (
          queue.map((fileInfo) => (
            <div
              key={fileInfo.id}
              className="relative flex h-16 w-full flex-row gap-2 overflow-hidden rounded-xl bg-gray-50"
            >
              <div className="flex w-[10%] items-center justify-center">
                {getFileIcon(fileInfo.fileData.type)}
              </div>
              <div className="flex w-[50%] flex-col justify-center px-2">
                <p className="h-fit w-full truncate text-gray-700">
                  {formatFileName(fileInfo.fileData.name, 30)}
                </p>
                <div className="flex h-fit w-full flex-row items-center gap-2">
                  {fileInfo.status === 'uploading' && (
                    <p className="flex text-blue-500">{fileInfo.progress}%</p>
                  )}
                  <div className="flex h-3/5 w-[2px] rounded-xl bg-gray-300"></div>
                  <p
                    className={`flex ${
                      fileInfo.status === 'completed'
                        ? 'text-green-500'
                        : fileInfo.status === 'failed'
                          ? 'text-red-500'
                          : fileInfo.status === 'uploading'
                            ? 'text-blue-500'
                            : 'text-gray-500'
                    }`}
                  >
                    {getStatusText(fileInfo.status)}
                  </p>
                  <div className="flex h-3/5 w-[2px] rounded-xl bg-gray-300"></div>
                  <p className="flex text-gray-500">{formatFileSize(fileInfo.fileData.size)}</p>
                </div>
              </div>
              <div className="flex w-[33%] flex-row items-center gap-2 px-2">
                {fileInfo.status === 'uploading' && (
                  <>
                    <div className="relative flex h-[.325rem] w-11/12 rounded-xl bg-gray-200">
                      <div
                        className="absolute left-0 top-0 h-full rounded-xl bg-blue-500"
                        style={{ width: `${fileInfo.progress}%` }}
                      ></div>
                    </div>
                    <button onClick={() => handleCancel(fileInfo.id)} className="flex w-1/12">
                      <XIcon />
                    </button>
                  </>
                )}

                {fileInfo.status === 'waiting' && (
                  <div className="flex w-full justify-end gap-2">
                    <button
                      onClick={() => removeFileFromQueue(fileInfo.id)}
                      className="flex rounded-md bg-red-200 px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {fileInfo.status === 'selected' && (
                  <div className="flex w-full justify-end gap-2">
                    <button
                      onClick={() => removeFileFromQueue(fileInfo.id)}
                      className="flex rounded-md bg-red-200 px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {fileInfo.status === 'completed' && (
                  <div className="flex w-full items-center justify-end">
                    <CompleteTickIcon width={24} height={24} />
                  </div>
                )}

                {fileInfo.status === 'failed' && (
                  <div className="flex w-full justify-end gap-2">
                    <button
                      onClick={() => retryFailedUpload(fileInfo.id)}
                      className="flex rounded-md bg-blue-200 px-2 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-300"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => removeFileFromQueue(fileInfo.id)}
                      className="flex rounded-md bg-red-200 px-2 py-1 text-sm text-red-600 transition-colors hover:bg-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Render constraints
  const renderConstraints = () => {
    return (
      <div className="flex h-1/6 w-full flex-row justify-end gap-2 overflow-hidden">
        {displayConstraints.map((constraint, index) => (
          <div
            key={index}
            className="flex h-full items-center justify-center rounded-md bg-gray-50 px-2"
          >
            <p dir="ltr" className="text-neutral-500">
              {constraint}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-[20vh] w-full flex-row-reverse justify-between gap-2 rounded-xl bg-gray-200 p-2">
      <div className="flex h-full w-1/2 flex-col gap-2 overflow-hidden rounded-t-xl">
        {renderFileSelector()}
        {renderConstraints()}
      </div>
      {renderFilesList()}
    </div>
  );
};

// Add PropTypes validation to satisfy ESLint
MultiFileUpload.propTypes = {
  id: PropTypes.string,
  bucket: PropTypes.string,
  acceptedFileTypes: PropTypes.string,
  maxSizeMB: PropTypes.number,
  onUploadComplete: PropTypes.func,
  onAllUploadsComplete: PropTypes.func,
  onError: PropTypes.func,
};

export default MultiFileUpload;
