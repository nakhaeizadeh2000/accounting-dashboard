'use client';

import React, { useRef } from 'react';
import { SingleFileUploadProps } from '../utils/file-types';
import { generateDisplayConstraints } from '../utils/file-helpers';
import { getFileIconType } from '../utils/file-helpers';
import { singleFileUploadTranslations } from '../constants/translations';
import { validateFile } from '../utils/file-validators';
import {
  DEFAULT_BUCKET,
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_LANGUAGE,
  DEFAULT_SINGLE_ACCEPTED_FILE_TYPES,
} from '../constants/file-constants';
import useSingleFileUpload from '../hooks/useSingleFileUpload';
import AddFileIcon from '../icons/AddFileIcon';
import FileInfo from './ui/FileInfo';
import FileStatus from './ui/FileStatus';
import FileConstraints from './ui/FileConstraints';

// Dynamic icon imports based on file type
import ImageFileIcon from '@/components/icon/ImageFileIcon';
import VideoFileIcon from '@/components/icon/VideoFileIcon';
import AudioFileIcon from '@/components/icon/AudioFileIcon';
import CompressedFileIcon from '@/components/icon/CompressedFileIcon';
import DocumentFileIcon from '@/components/icon/DocumentFileIcon';

/**
 * Single file upload component allowing users to select and upload one file at a time
 */
const SingleFileUpload: React.FC<SingleFileUploadProps> = ({
  id,
  bucket = DEFAULT_BUCKET,
  type = 'single',
  acceptedFileTypes = DEFAULT_SINGLE_ACCEPTED_FILE_TYPES,
  maxSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
  uploadingDependsToForm = true,
  language = DEFAULT_LANGUAGE,
  onUploadSuccess,
  onUploadError,
  onFileSelect: externalFileSelectHandler,
}) => {
  // Reference to the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get translations for the selected language
  const texts = singleFileUploadTranslations[language];

  // Parse display constraints
  const displayConstraints = generateDisplayConstraints(acceptedFileTypes, maxSizeMB);

  // Use our custom hook to handle file uploading - pass all props including id for isolation
  const {
    instanceId,
    selectedFile,
    fileInfo,
    uploadStatus,
    uploadProgress,
    errorMessage,
    handleFileSelect,
    handleFileReject,
    startUpload,
    cancelUpload,
    resetUpload,
  } = useSingleFileUpload({
    id, // Pass the provided ID to ensure component isolation
    bucket,
    acceptedFileTypes,
    maxSizeMB,
    onUploadSuccess,
    onUploadError,
    onFileSelect: externalFileSelectHandler,
  });

  // Function to open the file selector dialog
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate the file before proceeding
      const validation = validateFile(file, maxSizeMB, acceptedFileTypes);

      if (!validation.valid) {
        handleFileReject(validation.error || 'Invalid file');
        return;
      }

      // Log the file details for debugging
      console.log('Selected file for upload:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      handleFileSelect(file);

      // Auto-start upload if not dependent on form
      if (!uploadingDependsToForm) {
        setTimeout(startUpload, 100);
      }
    }

    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Validate the dropped file
    const validation = validateFile(file, maxSizeMB, acceptedFileTypes);

    if (!validation.valid) {
      handleFileReject(validation.error || 'Invalid file');
      return;
    }

    handleFileSelect(file);

    // Auto-start upload if not dependent on form
    if (!uploadingDependsToForm) {
      setTimeout(startUpload, 100);
    }
  };

  // Get the appropriate file icon component based on MIME type
  const getFileIcon = (fileType: string) => {
    const iconType = getFileIconType(fileType);

    switch (iconType) {
      case 'image':
        return ImageFileIcon;
      case 'video':
        return VideoFileIcon;
      case 'audio':
        return AudioFileIcon;
      case 'compressed':
        return CompressedFileIcon;
      default:
        return DocumentFileIcon;
    }
  };

  // First step - File selection UI
  if (uploadStatus === 'idle') {
    return (
      <div
        className="flex h-48 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-100 p-2 dark:bg-slate-800 sm:h-[13.75rem]"
        onClick={openFileSelector}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        data-upload-id={id || instanceId}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          className="hidden"
          multiple={type === 'multiple'}
        />
        <div className="flex h-3/4 w-full flex-col items-center justify-center gap-2 sm:gap-4">
          <AddFileIcon width={45} height={45} />
          <p className="px-2 text-center text-base leading-tight text-neutral-400 dark:text-neutral-300 sm:text-lg md:text-xl md:leading-[1.125rem]">
            {texts.clickOrDrop}
          </p>
        </div>
        <FileConstraints displayConstraints={displayConstraints} language={language} />
      </div>
    );
  }

  // Second step - File selected and uploading
  if (uploadStatus === 'selected' || uploadStatus === 'uploading') {
    const FileIcon = getFileIcon(fileInfo.type || 'application/octet-stream');

    return (
      <div
        dir="ltr"
        className="relative flex h-48 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-100 p-2 dark:bg-slate-800 sm:h-[13.75rem]"
        data-upload-id={id || instanceId}
      >
        {uploadStatus === 'uploading' && (
          <button
            onClick={cancelUpload}
            className="absolute right-2 top-2 z-10 flex rounded-md bg-slate-200 px-1.5 py-0.5 text-xs text-slate-500 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:px-2 sm:py-1 sm:text-sm"
          >
            {texts.cancel}
          </button>
        )}

        {/* Progressive background */}
        {uploadStatus === 'uploading' && (
          <div
            className="absolute inset-0 z-0 bg-blue-100 dark:bg-blue-900"
            style={{
              width: `${uploadProgress}%`,
              transition: 'width 0.3s ease-in-out',
            }}
          />
        )}

        {/* Content positioned on top of the background */}
        <div className="z-10 flex w-full flex-col items-center justify-end">
          <FileIcon width={45} height={45} />
        </div>

        <FileInfo
          fileInfo={fileInfo}
          uploadStatus={uploadStatus}
          uploadProgress={uploadProgress}
          texts={texts}
          startUpload={startUpload}
          resetUpload={resetUpload}
          uploadingDependsToForm={uploadingDependsToForm}
          cancelUpload={cancelUpload}
        />
      </div>
    );
  }

  // Final step - Completed or Failed
  return (
    <div
      dir="ltr"
      className="relative flex h-48 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-100 p-2 dark:bg-slate-800 sm:h-[13.75rem]"
      data-upload-id={id || instanceId}
    >
      <FileStatus
        uploadStatus={uploadStatus}
        fileInfo={fileInfo}
        errorMessage={errorMessage}
        texts={texts}
        resetUpload={resetUpload}
      />
    </div>
  );
};

export default SingleFileUpload;
