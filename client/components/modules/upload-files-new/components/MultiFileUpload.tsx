import React, { useState, useEffect } from 'react';
import { MultiFileUploadProps, FileItem } from '../types/file-upload.types';
import { useMultiFileUpload } from '../hooks/useMultiFileUpload';
import FileDropZone from './FileDropZone';
import FileListItem from './FileListItem';
import styles from '../styles/file-upload.module.scss';

/**
 * MultiFileUpload Component
 *
 * A component that allows users to select and upload multiple files
 */
const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  acceptedFileTypes,
  maxSizeMB = 10,
  maxFiles = 10,
  uploadingDependsToForm = false,
  onFilesSelect,
  onFileReject,
  onUploadStart,
  onUploadCancel,
  onFileUploadComplete,
  onFileUploadError,
  onRemoveFile,
  onRetryFile,
  onAllUploadsComplete,

  // Controlled mode props
  overallStatus: externalStatus,
  fileProgress: externalProgress,
  fileErrors: externalErrors,
}) => {
  // If component is controlled, use the provided props
  const isControlled = externalStatus !== undefined;

  // Set up the custom hook for internal state
  const {
    files: internalFiles,
    overallStatus: internalStatus,
    hasSelectedFiles,
    addFiles: addInternalFiles,
    removeFile: removeInternalFile,
    retryFile: retryInternalFile,
    startUpload: startInternalUpload,
    startAllUploads: startAllInternalUploads,
    cancelUpload: cancelInternalUpload,
  } = useMultiFileUpload({
    acceptedFileTypes,
    maxSizeMB,
    maxFiles,
    onChange: onFilesSelect,
    onError: onFileReject,
    onComplete: onAllUploadsComplete,
  });

  // Use external or internal state based on controlled mode
  const status = isControlled ? externalStatus : internalStatus;
  const isUploading = status === 'uploading';

  // Convert internal files to array for rendering
  const filesList = Object.values(internalFiles);

  // Handle file selection
  const handleFilesSelect = (files: FileList) => {
    addInternalFiles(files);
  };

  // Handle upload start
  const handleStartUpload = async () => {
    if (isControlled && onUploadStart) {
      await onUploadStart();
    } else if (!isControlled) {
      await startAllInternalUploads();
    }
  };

  // Handle upload cancellation
  const handleCancelUpload = (fileId: string) => {
    if (isControlled && onUploadCancel) {
      onUploadCancel(fileId);
    } else if (!isControlled) {
      cancelInternalUpload(fileId);
    }
  };

  // Handle file removal
  const handleRemoveFile = (fileId: string) => {
    if (isControlled && onRemoveFile) {
      onRemoveFile(fileId);
    } else if (!isControlled) {
      removeInternalFile(fileId);
    }
  };

  // Handle file retry
  const handleRetryFile = (fileId: string) => {
    if (isControlled && onRetryFile) {
      onRetryFile(fileId);
    } else if (!isControlled) {
      retryInternalFile(fileId);
    }
  };

  // Count files by status for upload button text
  const selectedFilesCount = filesList.filter((file) => file.status === 'selected').length;

  return (
    <div className="flex h-[20vh] w-full flex-row-reverse justify-between gap-2 rounded-xl bg-gray-200 p-2">
      {/* File Selection Area */}
      <div className="flex h-full w-1/2 flex-col gap-2 overflow-hidden rounded-t-xl">
        <FileDropZone
          acceptedFileTypes={acceptedFileTypes}
          maxSizeMB={maxSizeMB}
          maxFiles={maxFiles}
          multiple={true}
          disabled={isUploading}
          uploadingInProgress={isUploading}
          hasCompletedFiles={filesList.some((file) => file.status === 'completed')}
          onFileSelect={handleFilesSelect}
        />

        {/* Only show Start Upload button if there are files to upload and not in form mode */}
        {selectedFilesCount > 0 && !isUploading && !uploadingDependsToForm && (
          <button
            onClick={handleStartUpload}
            className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Start Upload ({selectedFilesCount} files)
          </button>
        )}
      </div>

      {/* File List Area */}
      <div
        className={`${styles.scrollableDiv} flex h-full w-1/2 flex-row flex-wrap gap-2 overflow-y-scroll rounded-xl bg-gray-300 p-2 direction-ltr`}
      >
        {filesList.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-neutral-500">
            No files selected
          </div>
        ) : (
          filesList.map((file) => (
            <FileListItem
              key={`${file.id}-${file.status}-${file.progress}`}
              file={file}
              onCancel={handleCancelUpload}
              onRemove={handleRemoveFile}
              onRetry={handleRetryFile}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MultiFileUpload;
