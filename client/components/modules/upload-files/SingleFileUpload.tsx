'use client';

import { useState, useRef, ChangeEvent } from 'react';
import styles from 'components/modules/upload-files/styles/upload-file.module.scss';
import useSingleFileUpload from './hook/useSingleFileUpload';
import AddFileIcon from './icons/AddFileIcon';
import CompleteTickIcon from '../../icon/CompleteTickIcon';
import FailedXmarkIcon from '../../icon/FailedXmarkIcon';
import ImageFileIcon from '../../icon/ImageFileIcon';
import VideoFileIcon from '../../icon/VideoFileIcon';
import AudioFileIcon from '../../icon/AudioFileIcon';
import CompressedFileIcon from '../../icon/CompressedFileIcon';
import DocumentFileIcon from '../../icon/DocumentFileIcon';

// Translations for static text
const translations = {
  fa: {
    clickOrDrop: 'برای آپلود کلیک کنید یا فایل را بکشید',
    startUpload: 'شروع آپلود',
    uploading: 'در حال آپلود',
    uploadComplete: 'آپلود تکمیل شد',
    uploadFailed: '!آپلود ناموفق',
    removeFile: 'حذف فایل',
    tryAgain: 'تلاش مجدد',
    cancel: 'لغو',
  },
  en: {
    clickOrDrop: 'click or drop file to upload',
    startUpload: 'start upload',
    uploading: 'Uploading',
    uploadComplete: 'Upload Complete',
    uploadFailed: 'Upload Failed!',
    removeFile: 'remove file',
    tryAgain: 'Try Again',
    cancel: 'cancel',
  },
};

// Format filename for better display
const formatFileName = (name: string): string => {
  if (!name) return '';

  const extension = name.includes('.') ? name.slice(name.lastIndexOf('.')) : '';
  const baseName = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;

  // If the name is too long, truncate it and add ellipsis
  if (baseName.length > 15) {
    return `${baseName.slice(0, 15)}...${extension}`;
  }

  return name;
};

export type SingleFileUploadProps = {
  id?: string; // Unique identifier for this upload component
  bucket?: string;
  type?: 'multiple' | 'single';
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  uploadingDependsToForm?: boolean;
  language?: 'fa' | 'en'; // Language option: Persian (fa) or English (en)
  generateThumbnail?: boolean; // Added property
  skipThumbnailForLargeFiles?: boolean; // Added property
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: any) => void;
  onFileSelect?: (file: File | null) => void;
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
    return DocumentFileIcon; // Default icon
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

const SingleFileUpload = ({
  id,
  bucket = 'default',
  type = 'single',
  acceptedFileTypes = '',
  maxSizeMB = 10,
  uploadingDependsToForm = true,
  language = 'fa', // Default to Persian
  generateThumbnail = true, // Default to generating thumbnails
  skipThumbnailForLargeFiles = true, // Default to skipping thumbnails for large files
  onUploadSuccess,
  onUploadError,
  onFileSelect: externalFileSelectHandler,
}: SingleFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get translations for the selected language
  const texts = translations[language];

  // Use our custom hook to handle file uploading
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
    id,
    bucket,
    acceptedFileTypes,
    maxSizeMB,
    generateThumbnail,
    skipThumbnailForLargeFiles,
    onUploadSuccess,
    onUploadError,
    onFileSelect: externalFileSelectHandler,
  });

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
    displayConstraints.push(`< ${formatFileSize(maxSizeMB * 1024 * 1024)}`);
  }

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);

      // Auto-start upload if not dependent on form
      if (!uploadingDependsToForm) {
        setTimeout(startUpload, 100);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    handleFileSelect(file);

    // Auto-start upload if not dependent on form
    if (!uploadingDependsToForm) {
      setTimeout(startUpload, 100);
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
        <div
          className={`${styles.scrollableDiv} flex h-1/4 w-full flex-row-reverse flex-wrap items-center justify-center gap-1 overflow-y-auto overflow-x-hidden sm:gap-2`}
        >
          {displayConstraints.map((data, index) => (
            <div
              key={index}
              className="flex h-fit w-fit items-center justify-center rounded-md bg-slate-200 px-1 py-1 text-xs text-neutral-500 dark:bg-slate-700 dark:text-neutral-300 sm:px-2 sm:text-sm"
            >
              <p dir="ltr" className="text-neutral-500 dark:text-neutral-400">
                {data}
              </p>
            </div>
          ))}
        </div>
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

        <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
          <p className="flex w-full justify-center truncate px-4 text-base leading-tight text-neutral-600 dark:text-neutral-300 sm:px-8 sm:text-lg md:text-xl md:leading-[1.125rem]">
            {formatFileName(fileInfo.name)}
          </p>
          {uploadStatus === 'uploading' ? (
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              <p className="text-sm leading-tight text-blue-500 dark:text-blue-400 sm:text-base md:text-xl md:leading-[1.125rem]">
                {uploadProgress}%
              </p>
              <p className="text-sm leading-tight text-neutral-400 dark:text-neutral-500 sm:text-base md:text-xl md:leading-[1.125rem]">
                |
              </p>
              <p className="text-sm leading-tight text-blue-500 dark:text-blue-400 sm:text-base md:text-xl md:leading-[1.125rem]">
                {texts.uploading}
              </p>
              <p className="text-sm leading-tight text-neutral-400 dark:text-neutral-500 sm:text-base md:text-xl md:leading-[1.125rem]">
                |
              </p>
              <p className="text-sm leading-tight text-blue-500 dark:text-blue-400 sm:text-base md:text-xl md:leading-[1.125rem]">
                {fileInfo.size}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm leading-tight text-blue-500 dark:text-blue-400 sm:text-base md:text-xl md:leading-[1.125rem]">
                {fileInfo.size}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {uploadingDependsToForm && (
                  <button
                    onClick={startUpload}
                    className="flex rounded-md bg-slate-200 px-1.5 py-0.5 text-xs text-slate-500 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:px-2 sm:py-1 sm:text-sm"
                  >
                    {texts.startUpload}
                  </button>
                )}

                <button
                  onClick={resetUpload}
                  className="flex rounded-md bg-red-200 px-1.5 py-0.5 text-xs text-slate-500 transition-colors hover:bg-red-300 dark:bg-red-900 dark:text-slate-300 dark:hover:bg-red-800 sm:px-2 sm:py-1 sm:text-sm"
                >
                  {texts.removeFile}
                </button>
              </div>
            </>
          )}
        </div>
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
      <div className="z-10 flex w-full flex-col items-center justify-end">
        {getFileIcon(fileInfo.type || 'application/octet-stream')({ width: 45, height: 45 })}
      </div>
      <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
        <p className="flex w-full justify-center truncate px-4 text-base leading-tight text-neutral-600 dark:text-neutral-300 sm:px-8 sm:text-lg md:text-xl md:leading-[1.125rem]">
          {formatFileName(fileInfo.name)}
        </p>

        {uploadStatus === 'completed' ? (
          <div className="flex items-center gap-1">
            <CompleteTickIcon width={22} height={22} />
            <p className="text-sm leading-tight text-blue-500 dark:text-blue-400 sm:text-base md:text-xl md:leading-[1.125rem]">
              {texts.uploadComplete}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <FailedXmarkIcon width={20} height={20} />
            <p className="text-sm leading-tight text-red-500 dark:text-red-400 sm:text-base md:text-xl md:leading-[1.125rem]">
              {errorMessage || texts.uploadFailed}
            </p>
          </div>
        )}

        {/* {NOTE: I made some conditions and check to stop showing Done btn for now. in future if needed i can show it.} */}
        {uploadStatus !== 'completed' && (
          <button
            onClick={resetUpload}
            className="mt-2 flex rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:px-3 sm:text-sm"
          >
            {texts.tryAgain}
          </button>
        )}
      </div>
    </div>
  );
};

export default SingleFileUpload;
