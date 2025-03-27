'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import styles from '@/components/modules/upload-files/upload-file.module.scss';
import AddFileIcon from './icons/AddFileIcon';
import FileItem, { FileItemType, FileUploadStatus } from './FileItemComponent';

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
  const [selectedFiles, setSelectedFiles] = useState<FileItemType[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add a new state to track file statuses for better reactivity
  const [fileStatuses, setFileStatuses] = useState<Record<string, FileUploadStatus>>({});

  // Map to store original File objects by id
  const [fileObjects, setFileObjects] = useState<Record<string, File>>({});

  // Derived values
  const isUploading = uploadStatus === 'uploading';
  const hasSelectedFiles = selectedFiles.length > 0;
  const hasNewFiles = selectedFiles.some(
    (file) => !uploadProgress[file.id] && uploadProgress[file.id] !== 0,
  );

  // Update fileStatuses when uploadProgress or uploadError changes
  useEffect(() => {
    const newStatuses: Record<string, FileUploadStatus> = {};

    selectedFiles.forEach((file) => {
      // Recalculate the status for each file
      const currentStatus = fileStatuses[file.id] || 'selected';
      let newStatus = currentStatus;

      // Calculate the new status based on current conditions
      if (uploadError[file.id]) {
        newStatus = 'failed';
      } else if (uploadProgress[file.id] === 100) {
        newStatus = 'completed';
      } else if (uploadProgress[file.id] > 0) {
        newStatus = 'uploading';
      } else if (uploadStatus === 'uploading' && currentStatus === 'selected') {
        // If overall status is uploading and this file is selected, mark it as uploading
        newStatus = 'uploading';
      }

      // Log any status changes
      if (newStatus !== currentStatus) {
        console.log(`File ${file.id} status changing from ${currentStatus} to ${newStatus}`);
      }

      newStatuses[file.id] = newStatus;
    });

    // Only update state if there's an actual change
    const hasChanges = selectedFiles.some((file) => newStatuses[file.id] !== fileStatuses[file.id]);

    if (hasChanges) {
      console.log('Updating file statuses:', newStatuses);
      setFileStatuses(newStatuses);
    } else {
      console.log('No status changes detected');
    }

    // Force re-render every time uploadProgress changes to ensure FileItems update
    // This is a fallback in case the status doesn't change
    if (Object.keys(uploadProgress).length > 0) {
      // For debugging purposes, trigger a re-render
      setSelectedFiles((prev) => [...prev]);
    }
  }, [uploadProgress, uploadError, uploadStatus, selectedFiles]);

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

  // Get file status for a specific file - now uses the tracked statuses when available
  const getFileStatus = (fileId: string): FileUploadStatus => {
    // First check if we have a cached status
    if (fileStatuses[fileId]) {
      // For debugging
      const previousStatus = fileStatuses[fileId];

      // If this file has an error, it's failed regardless of cached status
      if (uploadError[fileId]) {
        if (previousStatus !== 'failed') {
          console.log(
            `File ${fileId} status changing from ${previousStatus} to failed due to error`,
          );
          return 'failed';
        }
        return 'failed';
      }

      // If this file has progress of 100, it's completed
      if (uploadProgress[fileId] === 100) {
        if (previousStatus !== 'completed') {
          console.log(
            `File ${fileId} status changing from ${previousStatus} to completed due to progress=100`,
          );
          return 'completed';
        }
        return 'completed';
      }

      // If this file has any progress > 0, it's uploading
      if (uploadProgress[fileId] > 0) {
        if (previousStatus !== 'uploading') {
          console.log(
            `File ${fileId} status changing from ${previousStatus} to uploading due to progress=${uploadProgress[fileId]}`,
          );
          return 'uploading';
        }
        return 'uploading';
      }

      // For debugging
      console.log(`File ${fileId} status remains ${previousStatus}`, {
        progress: uploadProgress[fileId],
        hasError: !!uploadError[fileId],
        overallStatus: uploadStatus,
      });

      // If overall status is uploading but this file has no progress yet, mark it as uploading
      if (uploadStatus === 'uploading' && previousStatus === 'selected') {
        console.log(`File ${fileId} status changing to uploading due to overall status`);
        return 'uploading';
      }

      return previousStatus;
    }

    // If we don't have a cached status, determine based on current state
    console.log(`Determining initial status for file ${fileId}`);

    // If this file has an error, it's failed
    if (uploadError[fileId]) return 'failed';

    // If this file has progress of 100, it's completed
    if (uploadProgress[fileId] === 100) return 'completed';

    // If this file has any progress > 0, it's uploading
    if (uploadProgress[fileId] > 0) return 'uploading';

    // If overall status is uploading, set new files to uploading
    if (uploadStatus === 'uploading') return 'uploading';

    // Otherwise it's just selected
    return 'selected';
  };

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
    const newFiles: FileItemType[] = [];
    const newFileObjects: Record<string, File> = { ...fileObjects };
    const rejectedFiles: string[] = [];

    filesArray.forEach((file) => {
      const { valid, reason } = validateFile(file);

      if (valid) {
        const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

        // Create a FileItem for the valid file
        newFiles.push({
          id: fileId,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
        });

        // Store the original File object
        newFileObjects[fileId] = file;
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
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setFileObjects(newFileObjects);

      // Initialize statuses for new files
      const initialStatuses: Record<string, FileUploadStatus> = {};
      newFiles.forEach((file) => {
        initialStatuses[file.id] = 'selected';
      });

      setFileStatuses((prev) => ({
        ...prev,
        ...initialStatuses,
      }));

      // Notify parent component with original File objects
      if (onFilesSelect) {
        onFilesSelect(newFiles.map((item) => newFileObjects[item.id]));
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

    // Remove from fileObjects
    setFileObjects((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    // Also update fileStatuses
    setFileStatuses((prev) => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });

    // Notify parent component
    if (onRemoveFile) {
      onRemoveFile(fileId);
    }
  };

  // Retry a failed upload
  const handleRetryFile = (fileId: string) => {
    if (onRetryFile) {
      // Update our local status tracking
      setFileStatuses((prev) => ({
        ...prev,
        [fileId]: 'selected',
      }));

      onRetryFile(fileId);
    }
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

            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
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
            selectedFiles.map((file) => {
              const fileStatus = getFileStatus(file.id);
              const fileProgress = uploadProgress[file.id] || 0;

              return (
                <FileItem
                  key={`${file.id}-${fileStatus}-${fileProgress}-${Date.now()}`}
                  file={file}
                  status={fileStatus}
                  progress={fileProgress}
                  errorMessage={uploadError[file.id]}
                  onCancel={handleCancelUpload}
                  onRemove={handleRemoveFile}
                  onRetry={handleRetryFile}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Error message display */}
      {errorMessage && <div className="mt-2 text-red-500">{errorMessage}</div>}

      {/* Debug info during development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 rounded border border-gray-300 bg-gray-100 p-2 text-xs">
          <div>
            <strong>Debug Info:</strong>
          </div>
          <div>Overall upload status: {uploadStatus}</div>
          <div>Selected files: {selectedFiles.length}</div>
          <div>File statuses: {JSON.stringify(fileStatuses)}</div>
        </div>
      )}
    </>
  );
};

export default MultiFileUpload;
