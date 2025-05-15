'use client';

import React, { useState, useRef } from 'react';
import { MultiFileUploadProps } from '../utils/file-types';
import { generateDisplayConstraints } from '../utils/file-helpers';
import { validateFiles } from '../utils/file-validators';
import { multiFileUploadTranslations } from '../constants/translations';
import { cancelUploadRequest } from '@/store/features/files/files.api';
import useMultiFileUpload from '../hooks/useMultiFileUpload';
import {
  DEFAULT_BUCKET,
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_LANGUAGE,
  DEFAULT_MULTI_ACCEPTED_FILE_TYPES,
} from '../constants/file-constants';
import FileList from './ui/FileList';
import FileConstraints from './ui/FileConstraints';
import FileUploadForm from './ui/FileUploadForm';

/**
 * Multi-file upload component allowing users to select and upload multiple files
 */
const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  id,
  bucket = DEFAULT_BUCKET,
  acceptedFileTypes = DEFAULT_MULTI_ACCEPTED_FILE_TYPES,
  maxSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
  language = DEFAULT_LANGUAGE,
  onUploadComplete,
  onAllUploadsComplete,
  onError,
}) => {
  // References and state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get translations for the selected language
  const texts = multiFileUploadTranslations[language];

  // Parse acceptedFileTypes string into an array if provided
  const allowedMimeTypes = acceptedFileTypes ? acceptedFileTypes.split(',') : undefined;

  // Use the hook for multi-file upload functionality - properly pass all props
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
    wasCancelled,
  } = useMultiFileUpload({
    id, // Pass component ID for isolation
    bucket,
    maxSizeMB,
    allowedMimeTypes,
    onUploadComplete,
    onAllUploadsComplete, // Make sure this prop is passed through
    onError,
  });

  // Check if there are any failed files in the queue
  const hasFailedFiles = queue.some((file) => file.status === 'failed' && !wasCancelled(file.id));

  // Check if there are any cancelled files in the queue
  const hasCancelledFiles = queue.some((file) => wasCancelled(file.id));

  // Generate display constraints
  const displayConstraints = generateDisplayConstraints(acceptedFileTypes, maxSizeMB);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    const selectedFiles = Array.from(e.target.files || []);

    // Validate files before adding to queue
    const { validFiles, error } = validateFiles(selectedFiles, maxSizeMB, acceptedFileTypes);

    if (error) {
      setValidationError(error);
    }

    if (validFiles.length > 0) {
      // Log the file details for debugging
      console.log(
        'Adding files to queue:',
        validFiles.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      );

      addFilesToQueue(validFiles);
    } else if (selectedFiles.length > 0 && validFiles.length === 0 && !error) {
      // If we had files selected but none passed validation
      setValidationError('None of the selected files could be uploaded due to validation errors.');
    }

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open the file selector dialog
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle drag events
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
    const { validFiles, error } = validateFiles(files, maxSizeMB, acceptedFileTypes);

    if (error) {
      setValidationError(error);
    }

    if (validFiles.length > 0) {
      addFilesToQueue(validFiles);
    }
  };

  // Handle cancellation of a file upload
  const handleCancel = (fileId: string) => {
    // First cancel the actual XHR request
    cancelUploadRequest(fileId);
    // Then update the state
    cancelSingleUpload(fileId);
  };

  // Handle selecting more files after uploads are complete
  const handleSelectMoreFiles = () => {
    resetForMoreFiles();
    // Open file selector automatically
    setTimeout(() => {
      openFileSelector();
    }, 100);
  };

  return (
    <div className="flex h-auto w-full flex-col-reverse justify-between gap-2 rounded-xl bg-slate-100 p-2 dark:bg-slate-900 sm:h-[13.75rem] sm:flex-row-reverse">
      {/* Left side - Upload form and constraints */}
      <div className="order-2 flex h-64 w-full flex-col gap-2 overflow-hidden rounded-t-xl sm:order-none sm:h-full sm:w-1/2">
        {/* Upload form area */}
        <FileUploadForm
          id={id}
          componentId={componentId}
          queueStatus={queueStatus}
          dragActive={dragActive}
          fileInputRef={fileInputRef}
          acceptedFileTypes={acceptedFileTypes}
          language={language}
          texts={texts}
          validationError={validationError}
          queue={queue}
          hasFailedFiles={hasFailedFiles}
          hasCancelledFiles={hasCancelledFiles}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleFileChange={handleFileChange}
          openFileSelector={openFileSelector}
          startFileUpload={startFileUpload}
          cancelAllFileUploads={cancelAllFileUploads}
          handleSelectMoreFiles={handleSelectMoreFiles}
          retryAllFailed={retryAllFailed}
        />

        {/* Constraints area */}
        <FileConstraints displayConstraints={displayConstraints} language={language} />
      </div>

      {/* Right side - File list */}
      <div className="order-1 flex h-[13rem] w-full flex-col gap-2 rounded-xl bg-slate-200 p-2 direction-ltr dark:bg-slate-800 sm:order-none sm:h-full sm:w-1/2">
        <FileList
          queue={queue}
          wasCancelled={wasCancelled}
          language={language}
          handleCancel={handleCancel}
          removeFileFromQueue={removeFileFromQueue}
          retryFailedUpload={retryFailedUpload}
        />
      </div>
    </div>
  );
};

export default MultiFileUpload;
