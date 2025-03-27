'use client';

import { useState, useRef, ChangeEvent } from 'react';
import styles from '@/components/modules/upload-files/upload-file.module.scss';
import XIcon from './icons/XIcon';
import AddFileIcon from './icons/AddFileIcon';
import ImageFileIcon from './icons/ImageFileIcon';
import VideoFileIcon from './icons/VideoFileIcon';
import AudioFileIcon from './icons/AudioFileIcon';
import CompressedFileIcon from './icons/CompressedFileIcon';
import DocumentFileIcon from './icons/DocumentFileIcon';
import CompleteTickIcon from './icons/CompleteTickIcon';
import FailedXmarkIcon from './icons/FailedXmarkIcon';

export type MultiFileUploadProps = {
  id: string; // Unique identifier for this upload component
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  type?: 'single' | 'multiple';
  onFilesSelect?: (files: File[]) => void;
  onFileReject?: (reason: string) => void;
  uploadStatus?: FileUploadStatus;
  uploadProgress?: Record<string, number>;
  uploadError?: Record<string, string>;
  onUploadStart?: () => void;
  onUploadCancel?: (fileId: string) => void;
  onRemoveFile?: (fileId: string) => void;
  onRetryFile?: (fileId: string) => void;
  uploadingDependsToForm?: boolean;
};

export type FileUploadStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';

// Map file extensions to icons (reused from SingleFileUpload)
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

// Format file size with appropriate units (reused from SingleFileUpload)
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Round to 2 decimal places for precision
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

  return `${formattedSize} ${sizes[i]}`;
};

// File item for internal management
type FileItem = {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
};

const MultiFileUpload = ({
  id,
  acceptedFileTypes = 'image/jpeg,image/png,application/pdf',
  maxSizeMB = 10,
  maxFiles = 10,
  type = 'multiple',
  onFilesSelect,
  onFileReject,
  uploadStatus = 'idle',
  uploadProgress = {},
  uploadError = {},
  onUploadStart,
  onUploadCancel,
  onRemoveFile,
  onRetryFile,
  uploadingDependsToForm = false,
}: MultiFileUploadProps) => {
  // Internal state
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived values
  const isUploading = uploadStatus === 'uploading';
  const hasSelectedFiles = selectedFiles.length > 0;
  const hasNewFiles = selectedFiles.some(
    (file) => !uploadProgress[file.id] && uploadProgress[file.id] !== 0,
  );

  // Calculate constraints for display
  const allowedTypes = acceptedFileTypes
    ? acceptedFileTypes
        .split(',')
        .map((type) =>
          type.includes('/*')
            ? type.split('/')[0].toUpperCase()
            : `.${type.split('/')[1].toUpperCase()}`,
        )
    : ['PDF', 'DOCX', 'TXT'];

  const displayConstraints = [...allowedTypes];
  if (maxSizeMB) {
    displayConstraints.push(`< ${formatFileSize(maxSizeMB * 1024 * 1024)}`);
  }
  if (maxFiles) {
    displayConstraints.push(`Max ${maxFiles} files`);
  }

  // Validate a single file
  const validateFile = (file: File): { valid: boolean; reason?: string } => {
    // Validate file size
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      return { valid: false, reason: `${file.name}: File size exceeds the limit` };
    }

    // Validate file type if acceptedFileTypes is specified
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
        return { valid: false, reason: `${file.name}: File type is unacceptable` };
      }
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    // Convert FileList to array
    const filesArray = Array.from(e.target.files);

    // Check if adding these files would exceed the maximum
    if (maxFiles && selectedFiles.length + filesArray.length > maxFiles) {
      const error = `Cannot add more than ${maxFiles} files`;
      setErrorMessage(error);
      if (onFileReject) onFileReject(error);
      return;
    }

    // Validate and convert files to FileItems
    const newFiles: FileItem[] = [];
    const rejectedFiles: string[] = [];

    filesArray.forEach((file) => {
      const { valid, reason } = validateFile(file);

      if (valid) {
        // Create a FileItem for the valid file
        newFiles.push({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          file,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
        });
      } else if (reason) {
        rejectedFiles.push(reason);
      }
    });

    // Handle rejections if any
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles.join('; ');
      setErrorMessage(error);
      if (onFileReject) onFileReject(error);
    }

    // Add valid files to state
    if (newFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...newFiles];
      setSelectedFiles(updatedFiles);

      // Notify parent component
      if (onFilesSelect) {
        onFilesSelect(newFiles.map((item) => item.file));
      }
    }

    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUploading) return; // Don't allow new files during upload

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Simulate file input change with dropped files
    if (fileInputRef.current) {
      // Create a custom event
      const changeEvent = new CustomEvent('change', { bubbles: true });

      // Set the files in the input
      Object.defineProperty(fileInputRef.current, 'files', {
        writable: true,
        value: e.dataTransfer.files,
      });

      // Manually call the handler
      handleFileChange({
        target: { files: e.dataTransfer.files },
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  // Open file selector
  const openFileSelector = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Initiate upload
  const handleStartUpload = () => {
    if (onUploadStart && hasNewFiles) {
      onUploadStart();
    }
  };

  // Cancel a specific file upload
  const handleCancelUpload = (fileId: string) => {
    if (onUploadCancel) {
      onUploadCancel(fileId);
    }
  };

  // Remove a file from selection
  const handleRemoveFile = (fileId: string) => {
    // Update internal state
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));

    // Notify parent component
    if (onRemoveFile) {
      onRemoveFile(fileId);
    }
  };

  // Retry a failed upload
  const handleRetryFile = (fileId: string) => {
    if (onRetryFile) {
      onRetryFile(fileId);
    }
  };

  // Get file status for a specific file
  const getFileStatus = (fileId: string): FileUploadStatus => {
    // If this file has an error, it's failed
    if (uploadError[fileId]) return 'failed';

    // If this file has progress of 100, it's completed
    if (uploadProgress[fileId] === 100) return 'completed';

    // If this file has any progress > 0, it's uploading
    if (uploadProgress[fileId] > 0) return 'uploading';

    // Otherwise it's just selected
    return 'selected';
  };

  // Render a single file item
  const renderFileItem = (file: FileItem) => {
    const FileIcon = getFileIcon(file.type);
    const fileStatus = getFileStatus(file.id);
    const fileProgress = uploadProgress[file.id] || 0;
    const fileErrorMessage = uploadError[file.id];

    const isUploading = fileStatus === 'uploading';
    const isCompleted = fileStatus === 'completed';
    const isFailed = fileStatus === 'failed';

    return (
      <div
        key={file.id}
        className="relative -right-[3px] flex h-16 w-full flex-row gap-2 overflow-hidden rounded-xl bg-gray-50"
      >
        <div className="flex w-3/5 flex-col justify-center px-4">
          <p className="h-fit w-full truncate text-gray-700">{file.name}</p>
          <div className="flex h-fit w-full flex-row items-center gap-2">
            {isUploading && (
              <>
                <p className="flex text-blue-500">{fileProgress}%</p>
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
                <p className="flex text-red-500">{fileErrorMessage || 'failed'}</p>
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
                  style={{ width: `${fileProgress}%` }}
                ></div>
              </div>
              <button
                onClick={() => handleCancelUpload(file.id)}
                className="flex w-1/12 hover:text-red-500"
              >
                <XIcon />
              </button>
            </>
          )}

          {isCompleted && (
            <button
              onClick={() => handleRemoveFile(file.id)}
              className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-300"
            >
              Remove
            </button>
          )}

          {isFailed && (
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => handleRetryFile(file.id)}
                className="rounded-md bg-blue-100 px-2 py-1 text-blue-600 hover:bg-blue-200"
              >
                Retry
              </button>
              <button
                onClick={() => handleRemoveFile(file.id)}
                className="rounded-md bg-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-300"
              >
                Remove
              </button>
            </div>
          )}

          {fileStatus === 'selected' && (
            <button
              onClick={() => handleRemoveFile(file.id)}
              className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-gray-600 hover:bg-gray-300"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  };

  // Main render
  return (
    <>
      <div className="flex h-[20vh] w-full flex-row-reverse justify-between gap-2 rounded-xl bg-gray-200 p-2">
        {/* File Selection Area */}
        <div className="flex h-full w-1/2 flex-col gap-2 overflow-hidden rounded-t-xl">
          <div
            className="flex h-5/6 w-full flex-row justify-between overflow-hidden rounded-xl bg-gray-50"
            onClick={!isUploading ? openFileSelector : undefined}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            role={!isUploading ? 'button' : undefined}
            tabIndex={!isUploading ? 0 : undefined}
            style={{ cursor: !isUploading ? 'pointer' : 'default' }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={acceptedFileTypes}
              className="hidden"
              multiple={type === 'multiple'}
              disabled={isUploading}
            />

            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
              <AddFileIcon width={40} height={40} />
              <p className="text-xl leading-[1.125rem] text-neutral-400">
                {isUploading
                  ? 'Uploading in progress...'
                  : selectedFiles.some((file) => getFileStatus(file.id) === 'completed')
                    ? 'Add more files...'
                    : 'click or drop files to upload'}
              </p>

              {/* Only show Start Upload if there are files to upload and we're not dependent on a form */}
              {hasNewFiles && !isUploading && !uploadingDependsToForm && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartUpload();
                  }}
                  className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Start Upload (
                  {selectedFiles.filter((file) => getFileStatus(file.id) === 'selected').length}{' '}
                  files)
                </button>
              )}
            </div>
          </div>

          {/* Constraints */}
          <div className="flex h-1/6 w-full flex-row justify-end gap-2 overflow-hidden">
            {displayConstraints.map((constraint, index) => (
              <div
                key={index}
                className="flex h-full items-center rounded-md bg-gray-50 px-2 text-neutral-500"
              >
                <p dir="ltr">{constraint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* File List Area */}
        <div
          className={
            styles.scrollableDiv +
            ' flex h-full w-1/2 flex-row flex-wrap gap-2 overflow-y-scroll rounded-xl bg-gray-300 p-2 direction-ltr'
          }
        >
          {selectedFiles.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-neutral-500">
              No files selected
            </div>
          ) : (
            selectedFiles.map(renderFileItem)
          )}
        </div>
      </div>

      {/* Error message display */}
      {errorMessage && <div className="mt-2 text-red-500">{errorMessage}</div>}
    </>
  );
};

export default MultiFileUpload;
