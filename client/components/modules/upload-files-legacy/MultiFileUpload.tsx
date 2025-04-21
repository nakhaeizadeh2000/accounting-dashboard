import React, { useState, useRef, ChangeEvent } from 'react';
import PropTypes from 'prop-types';
import useMultiFileUpload from './hook/useMultiFileUpload';
import { FileUploadInfo } from '@/store/features/files/progress-slice';
import AddFileIcon from './icons/AddFileIcon';
import CompleteTickIcon from '../../icon/CompleteTickIcon';
import FailedXmarkIcon from '../../icon/FailedXmarkIcon';
import XIcon from '../../icon/XIcon';
import ImageFileIcon from '../../icon/ImageFileIcon';
import VideoFileIcon from '../../icon/VideoFileIcon';
import AudioFileIcon from '../../icon/AudioFileIcon';
import CompressedFileIcon from '../../icon/CompressedFileIcon';
import DocumentFileIcon from '../../icon/DocumentFileIcon';
import styles from 'components/modules/upload-files/styles/upload-file.module.scss';
import { cancelUploadRequest } from '@/store/features/files/files.api';

export interface MultiFileUploadProps {
  id?: string; // Unique ID for component instance
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  language?: 'fa' | 'en'; // Language option: Persian (fa) or English (en)
  onUploadComplete?: (uploadedFiles: FileUploadInfo[]) => void;
  onAllUploadsComplete?: (succeeded: FileUploadInfo[], failed: FileUploadInfo[]) => void;
  onError?: (error: any) => void;
}

// Translations for static text
const translations = {
  fa: {
    clickOrDrop: 'برای آپلود کلیک کنید یا فایل‌ها را بکشید',
    startUpload: 'شروع آپلود',
    uploadingFiles: 'در حال آپلود فایل‌ها...',
    ofFilesCompleted: 'فایل‌ها تکمیل شده است',
    cancelAllUploads: 'لغو همه آپلودها',
    allFilesUploaded: 'همه فایل‌ها با موفقیت آپلود شدند!',
    selectMoreFiles: 'انتخاب فایل‌های بیشتر برای آپلود',
    someFilesFailed: 'برخی از فایل‌ها آپلود نشدند',
    someFilesCancelled: 'برخی از آپلودها لغو شدند',
    retryFailedFiles: 'تلاش مجدد برای فایل‌های ناموفق',
    selectMoreFilesButton: 'انتخاب فایل‌های بیشتر',
    noFilesSelected: 'فایلی انتخاب نشده است',
    remove: 'حذف',
    retry: 'تلاش مجدد',
    uploading: 'در حال آپلود',
    queued: 'در صف',
    completed: 'تکمیل شده',
    failed: 'ناموفق',
    cancelled: 'لغو شده',
    ready: 'آماده',
  },
  en: {
    clickOrDrop: 'click or drop files to upload',
    startUpload: 'Start Upload',
    uploadingFiles: 'Uploading Files...',
    ofFilesCompleted: 'of files completed',
    cancelAllUploads: 'Cancel All Uploads',
    allFilesUploaded: 'All files uploaded successfully!',
    selectMoreFiles: 'Select More Files to Upload',
    someFilesFailed: 'Some files failed to upload',
    someFilesCancelled: 'Some uploads were cancelled',
    retryFailedFiles: 'Retry Failed Files',
    selectMoreFilesButton: 'Select More Files',
    noFilesSelected: 'No files selected',
    remove: 'Remove',
    retry: 'Retry',
    uploading: 'uploading',
    queued: 'queued',
    completed: 'completed',
    failed: 'failed',
    cancelled: 'cancelled',
    ready: 'ready',
  },
};

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
    const maxBaseLength = maxLength - 3 - extension.length;
    if (maxBaseLength > 3) {
      return `${baseName.slice(0, maxBaseLength)}...${extension}`;
    }
  }

  return `${name.slice(0, maxLength)}...`;
};

// Get status text for display
const getStatusText = (status: string, isCancelled: boolean, language: 'fa' | 'en'): string => {
  const texts = translations[language];

  // Override status text for cancelled files
  if (isCancelled) {
    return texts.cancelled;
  }

  switch (status) {
    case 'uploading':
      return texts.uploading;
    case 'waiting':
      return texts.queued;
    case 'completed':
      return texts.completed;
    case 'failed':
      return texts.failed;
    case 'selected':
      return texts.ready;
    default:
      return status;
  }
};

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  id,
  bucket = 'default',
  acceptedFileTypes = 'image/jpeg,image/png,application/pdf',
  maxSizeMB = 10,
  language = 'fa', // Default to Persian
  onUploadComplete,
  onAllUploadsComplete,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get translations for the selected language
  const texts = translations[language];

  // Parse acceptedFileTypes string into an array if provided
  const allowedMimeTypes = acceptedFileTypes ? acceptedFileTypes.split(',') : undefined;

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
    onAllUploadsComplete,
    onError,
  });

  // Check if there are any failed files in the queue
  const hasFailedFiles = queue.some((file) => file.status === 'failed' && !wasCancelled(file.id));

  // Check if there are any cancelled files in the queue
  const hasCancelledFiles = queue.some((file) => wasCancelled(file.id));

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
      // Check for empty files
      if (file.size === 0) {
        setValidationError(`File "${file.name}" is empty and cannot be uploaded`);
        return false;
      }

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setValidationError(`File "${file.name}" exceeds the size limit of ${maxSizeMB}MB`);
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
          setValidationError(`File "${file.name}" type ${file.type} is not accepted`);
          return false;
        }
      }

      return true;
    });

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
    } else if (selectedFiles.length > 0 && validFiles.length === 0) {
      // If we had files selected but none passed validation
      setValidationError('None of the selected files could be uploaded due to validation errors.');
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
        className={`flex h-4/5 w-full flex-col items-center justify-center overflow-hidden rounded-xl ${
          dragActive ? 'bg-blue-50 dark:bg-blue-900' : 'bg-gray-50 dark:bg-slate-800'
        }`}
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
            <p className="mt-4 px-2 text-center text-base leading-tight text-neutral-400 dark:text-neutral-300 sm:text-lg md:text-xl md:leading-[1.125rem]">
              {texts.clickOrDrop}
            </p>
            {validationError && (
              <p className="mt-2 px-2 text-center text-xs text-red-500 dark:text-red-400 sm:text-sm">
                {validationError}
              </p>
            )}
            {queueStatus === 'selected' && queue.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent file dialog from opening
                  startFileUpload();
                }}
                className="mt-4 flex rounded-md bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 sm:text-base md:mt-6 md:px-4 md:py-2"
              >
                {texts.startUpload}
              </button>
            )}
          </>
        )}

        {queueStatus === 'uploading' && (
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <p className="text-base leading-tight text-blue-500 dark:text-blue-400 sm:text-lg md:text-xl md:leading-[1.125rem]">
              {texts.uploadingFiles}
            </p>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
              {language === 'fa'
                ? `${queue.filter((f) => f.status === 'completed').length}/${queue.length} ${texts.ofFilesCompleted}`
                : `${queue.filter((f) => f.status === 'completed').length}/${queue.length} ${texts.ofFilesCompleted}`}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                cancelAllFileUploads();
              }}
              className="mt-3 flex rounded-md bg-red-200 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-300 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 sm:text-sm md:mt-4"
            >
              {texts.cancelAllUploads}
            </button>
          </div>
        )}

        {queueStatus === 'completed' && (
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <CompleteTickIcon width={45} height={45} />
            <p className="mt-3 text-base leading-tight text-green-500 dark:text-green-400 sm:text-lg md:mt-4 md:text-xl md:leading-[1.125rem]">
              {texts.allFilesUploaded}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMoreFiles();
              }}
              className="mt-3 flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:text-sm md:mt-4"
            >
              {texts.selectMoreFiles}
            </button>
          </div>
        )}

        {queueStatus === 'failed' && !hasFailedFiles && !hasCancelledFiles && (
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <CompleteTickIcon width={45} height={45} />
            <p className="mt-3 text-base leading-tight text-green-500 dark:text-green-400 sm:text-lg md:mt-4 md:text-xl md:leading-[1.125rem]">
              {texts.allFilesUploaded}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMoreFiles();
              }}
              className="mt-3 flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:text-sm md:mt-4"
            >
              {texts.selectMoreFiles}
            </button>
          </div>
        )}

        {queueStatus === 'failed' && hasFailedFiles && (
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <FailedXmarkIcon width={45} height={45} />
            <p className="mt-3 text-base leading-tight text-red-500 dark:text-red-400 sm:text-lg md:mt-4 md:text-xl md:leading-[1.125rem]">
              {texts.someFilesFailed}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row md:mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  retryAllFailed();
                }}
                className="flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:text-sm"
              >
                {texts.retryFailedFiles}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectMoreFiles();
                }}
                className="flex items-center justify-center rounded-md bg-green-200 px-2 py-1 text-xs text-green-600 transition-colors hover:bg-green-300 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 sm:text-sm"
              >
                {texts.selectMoreFilesButton}
              </button>
            </div>
          </div>
        )}

        {queueStatus === 'failed' && !hasFailedFiles && hasCancelledFiles && (
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <FailedXmarkIcon width={45} height={45} />
            <p className="mt-3 text-base leading-tight text-yellow-500 dark:text-yellow-400 sm:text-lg md:mt-4 md:text-xl md:leading-[1.125rem]">
              {texts.someFilesCancelled}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMoreFiles();
              }}
              className="mt-3 flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:text-sm md:mt-4"
            >
              {texts.selectMoreFilesButton}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render files list with statuses and progress
  const renderFilesList = () => {
    return (
      <div className="order-1 flex h-[13rem] w-full flex-col gap-2 rounded-xl bg-slate-200 p-2 direction-ltr dark:bg-slate-800 sm:order-none sm:h-full sm:w-1/2">
        {queue.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400">
            {texts.noFilesSelected}
          </div>
        ) : (
          <div
            className={`${styles.scrollableDiv} flex max-h-full w-full flex-col gap-2 overflow-y-auto`}
          >
            {queue.map((fileInfo) => {
              // Check if this file was cancelled
              const isCancelled = wasCancelled(fileInfo.id);

              return (
                <div
                  key={fileInfo.id}
                  className="relative flex h-16 min-h-16 w-full flex-row gap-2 overflow-hidden rounded-xl bg-gray-50 dark:bg-slate-700"
                >
                  <div className="flex w-[10%] items-center justify-center pl-1">
                    {getFileIcon(fileInfo.fileData.type)}
                  </div>
                  <div className="flex w-[50%] flex-col justify-center pr-2">
                    <p className="h-fit w-full truncate text-xs text-gray-700 dark:text-gray-300 sm:text-sm md:text-base">
                      {formatFileName(fileInfo.fileData.name, 30)}
                    </p>
                    <div className="flex h-fit w-full flex-row items-center gap-1 md:gap-2">
                      {fileInfo.status === 'uploading' && !isCancelled && (
                        <p className="flex text-xs text-blue-500 dark:text-blue-400 sm:text-sm">
                          {fileInfo.progress}%
                        </p>
                      )}
                      <div className="flex h-3/5 w-[2px] rounded-xl bg-gray-300 dark:bg-gray-600"></div>
                      <p
                        className={`flex items-center justify-center text-nowrap text-xs sm:text-sm ${
                          isCancelled
                            ? 'text-yellow-500 dark:text-yellow-400'
                            : fileInfo.status === 'completed'
                              ? 'text-green-500 dark:text-green-400'
                              : fileInfo.status === 'failed'
                                ? 'text-red-500 dark:text-red-400'
                                : fileInfo.status === 'uploading'
                                  ? 'text-blue-500 dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {getStatusText(fileInfo.status, isCancelled, language)}
                      </p>
                      <div className="flex h-3/5 w-[2px] rounded-xl bg-gray-300 dark:bg-gray-600"></div>
                      <p className="flex text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                        {formatFileSize(fileInfo.fileData.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-[33%] flex-row items-center gap-1 px-1 md:gap-2 md:px-2">
                    {fileInfo.status === 'uploading' && !isCancelled && (
                      <>
                        <div className="relative flex h-[.325rem] w-11/12 rounded-xl bg-gray-200 dark:bg-gray-600">
                          <div
                            className="absolute left-0 top-0 h-full rounded-xl bg-blue-500 dark:bg-blue-600"
                            style={{ width: `${fileInfo.progress}%` }}
                          ></div>
                        </div>
                        <button onClick={() => handleCancel(fileInfo.id)} className="flex w-1/12">
                          <XIcon />
                        </button>
                      </>
                    )}

                    {fileInfo.status === 'waiting' && (
                      <div className="flex w-full justify-end gap-1 md:gap-2">
                        <button
                          onClick={() => removeFileFromQueue(fileInfo.id)}
                          className="flex items-center justify-center rounded-md bg-red-200 px-1 py-1 text-xs text-red-600 transition-colors hover:bg-red-300 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 md:px-2"
                        >
                          {texts.remove}
                        </button>
                      </div>
                    )}

                    {fileInfo.status === 'selected' && (
                      <div className="flex w-full justify-end gap-1 md:gap-2">
                        <button
                          onClick={() => removeFileFromQueue(fileInfo.id)}
                          className="flex items-center justify-center rounded-md bg-red-200 px-1 py-1 text-xs text-red-600 transition-colors hover:bg-red-300 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 md:px-2"
                        >
                          {texts.remove}
                        </button>
                      </div>
                    )}

                    {fileInfo.status === 'completed' && (
                      <div className="flex w-full items-center justify-end">
                        <CompleteTickIcon width={24} height={24} />
                      </div>
                    )}

                    {fileInfo.status === 'failed' && !isCancelled && (
                      <div className="flex w-full justify-end gap-1 md:gap-2">
                        <button
                          onClick={() => retryFailedUpload(fileInfo.id)}
                          className="flex items-center justify-center rounded-md bg-blue-200 px-1 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 md:px-2"
                        >
                          {texts.retry}
                        </button>
                        <button
                          onClick={() => removeFileFromQueue(fileInfo.id)}
                          className="flex items-center justify-center rounded-md bg-red-200 px-1 py-1 text-xs text-red-600 transition-colors hover:bg-red-300 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 md:px-2"
                        >
                          {texts.remove}
                        </button>
                      </div>
                    )}

                    {/* Special case for cancelled uploads */}
                    {isCancelled && (
                      <div className="flex w-full justify-end gap-1 md:gap-2">
                        <button
                          onClick={() => retryFailedUpload(fileInfo.id)}
                          className="flex items-center justify-center rounded-md bg-blue-200 px-1 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 md:px-2"
                        >
                          {texts.retry}
                        </button>
                        <button
                          onClick={() => removeFileFromQueue(fileInfo.id)}
                          className="flex items-center justify-center rounded-md bg-red-200 px-1 py-1 text-xs text-red-600 transition-colors hover:bg-red-300 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 md:px-2"
                        >
                          {texts.remove}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render constraints
  const renderConstraints = () => {
    return (
      <div
        className={`${styles.scrollableDiv} flex h-1/5 w-full flex-row-reverse flex-wrap items-center justify-center gap-1 overflow-y-auto overflow-x-hidden sm:gap-2`}
      >
        {displayConstraints.map((constraint, index) => (
          <div
            key={index}
            className="flex h-fit w-fit items-center justify-center rounded-md bg-gray-50 px-1 py-1 text-xs dark:bg-slate-800 sm:px-2 sm:text-sm"
          >
            <p dir="ltr" className="text-neutral-500 dark:text-neutral-400">
              {constraint}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-auto w-full flex-col-reverse justify-between gap-2 rounded-xl bg-slate-100 p-2 dark:bg-slate-900 sm:h-[13.75rem] sm:flex-row-reverse">
      <div className="order-2 flex h-64 w-full flex-col gap-2 overflow-hidden rounded-t-xl sm:order-none sm:h-full sm:w-1/2">
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
  language: PropTypes.oneOf(['fa', 'en']),
  onUploadComplete: PropTypes.func,
  onAllUploadsComplete: PropTypes.func,
  onError: PropTypes.func,
};

export default MultiFileUpload;
