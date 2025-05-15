import React from 'react';
import { FileUploadFormProps } from '../../utils/file-types';
import AddFileIcon from '../../icons/AddFileIcon';
import CompleteTickIcon from '../../../../icon/CompleteTickIcon';
import FailedXmarkIcon from '../../../../icon/FailedXmarkIcon';

/**
 * A reusable file upload form that handles drag-and-drop and file selection
 */
const FileUploadForm: React.FC<FileUploadFormProps> = ({
  id,
  componentId,
  queueStatus,
  dragActive = false,
  fileInputRef,
  acceptedFileTypes,
  language,
  texts,
  validationError,
  queue = [],
  uploadResults,
  hasFailedFiles = false,
  hasCancelledFiles = false,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
  openFileSelector,
  startFileUpload,
  cancelAllFileUploads,
  handleSelectMoreFiles,
  retryAllFailed,
  children,
}) => {
  const isMultiple = !!queue;

  return (
    <div
      className={`flex h-4/5 w-full flex-col items-center justify-center overflow-hidden rounded-xl ${
        dragActive ? 'bg-blue-50 dark:bg-blue-900' : 'bg-slate-100 dark:bg-slate-800'
      }`}
      onClick={queueStatus === 'idle' || queueStatus === 'selected' ? openFileSelector : undefined}
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
        multiple={isMultiple}
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
          {queueStatus === 'selected' && isMultiple && queue.length > 0 && startFileUpload && (
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
          {isMultiple && (
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
              {language === 'fa'
                ? `${queue.filter((f) => f.status === 'completed').length}/${queue.length} ${texts.ofFilesCompleted}`
                : `${queue.filter((f) => f.status === 'completed').length}/${queue.length} ${texts.ofFilesCompleted}`}
            </p>
          )}
          {cancelAllFileUploads && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                cancelAllFileUploads();
              }}
              className="mt-3 flex rounded-md bg-red-200 px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-300 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 sm:text-sm md:mt-4"
            >
              {texts.cancelAllUploads}
            </button>
          )}
        </div>
      )}

      {queueStatus === 'completed' && (
        <div className="flex flex-col items-center justify-center px-2 text-center">
          <CompleteTickIcon width={45} height={45} />
          <p className="mt-3 text-base leading-tight text-green-500 dark:text-green-400 sm:text-lg md:mt-4 md:text-xl md:leading-[1.125rem]">
            {texts.allFilesUploaded}
          </p>
          {handleSelectMoreFiles && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMoreFiles();
              }}
              className="mt-3 flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:text-sm md:mt-4"
            >
              {texts.selectMoreFiles}
            </button>
          )}
        </div>
      )}

      {queueStatus === 'failed' && !hasFailedFiles && !hasCancelledFiles && (
        <div className="flex flex-col items-center justify-center px-2 text-center">
          <CompleteTickIcon width={45} height={45} />
          <p className="mt-3 text-base leading-tight text-green-500 dark:text-green-400 sm:text-lg md:mt-4 md:text-xl md:leading-[1.125rem]">
            {texts.allFilesUploaded}
          </p>
          {handleSelectMoreFiles && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMoreFiles();
              }}
              className="mt-3 flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:text-sm md:mt-4"
            >
              {texts.selectMoreFiles}
            </button>
          )}
        </div>
      )}

      {queueStatus === 'failed' && hasFailedFiles && (
        <div className="flex flex-col items-center justify-center px-2 text-center">
          <FailedXmarkIcon width={45} height={45} />
          <p className="mt-3 text-base leading-tight text-red-500 dark:text-red-400 sm:text-lg md:mt-4 md:text-xl md:leading-[1.125rem]">
            {texts.someFilesFailed}
          </p>
          {retryAllFailed && handleSelectMoreFiles && (
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
          )}
        </div>
      )}

      {queueStatus === 'failed' && !hasFailedFiles && hasCancelledFiles && (
        <div className="flex flex-col items-center justify-center px-2 text-center">
          <FailedXmarkIcon width={45} height={45} />
          <p className="mt-3 text-base leading-tight text-yellow-500 dark:text-yellow-400 sm:text-lg md:mt-4 md:text-xl md:leading-[1.125rem]">
            {texts.someFilesCancelled}
          </p>
          {handleSelectMoreFiles && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMoreFiles();
              }}
              className="mt-3 flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 sm:text-sm md:mt-4"
            >
              {texts.selectMoreFilesButton}
            </button>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default FileUploadForm;
