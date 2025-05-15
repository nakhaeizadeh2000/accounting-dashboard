import React from 'react';
import { FileInfoProps } from '../../utils/file-types';
import CompleteTickIcon from '../../../../icon/CompleteTickIcon';
import FailedXmarkIcon from '../../../../icon/FailedXmarkIcon';

/**
 * Displays file information and controls during the upload process
 */
const FileInfo: React.FC<FileInfoProps> = ({
  fileInfo,
  uploadStatus,
  uploadProgress,
  texts,
  errorMessage,
  startUpload,
  resetUpload,
  uploadingDependsToForm,
  cancelUpload,
}) => {
  // Uploading state with progress bar
  if (uploadStatus === 'uploading') {
    return (
      <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
        <p className="flex w-full justify-center truncate px-4 text-base leading-tight text-neutral-600 dark:text-neutral-300 sm:px-8 sm:text-lg md:text-xl md:leading-[1.125rem]">
          {fileInfo.name}
        </p>
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
      </div>
    );
  }

  // File selected but not yet uploading
  if (uploadStatus === 'selected') {
    return (
      <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
        <p className="flex w-full justify-center truncate px-4 text-base leading-tight text-neutral-600 dark:text-neutral-300 sm:px-8 sm:text-lg md:text-xl md:leading-[1.125rem]">
          {fileInfo.name}
        </p>
        <p className="text-sm leading-tight text-blue-500 dark:text-blue-400 sm:text-base md:text-xl md:leading-[1.125rem]">
          {fileInfo.size}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {uploadingDependsToForm && startUpload && (
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
      </div>
    );
  }

  // Upload completed successfully
  if (uploadStatus === 'completed') {
    return (
      <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
        <p className="flex w-full justify-center truncate px-4 text-base leading-tight text-neutral-600 dark:text-neutral-300 sm:px-8 sm:text-lg md:text-xl md:leading-[1.125rem]">
          {fileInfo.name}
        </p>
        <div className="flex items-center gap-1">
          <CompleteTickIcon width={22} height={22} />
          <p className="text-sm leading-tight text-blue-500 dark:text-blue-400 sm:text-base md:text-xl md:leading-[1.125rem]">
            {texts.uploadComplete}
          </p>
        </div>
      </div>
    );
  }

  // Upload failed
  return (
    <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
      <p className="flex w-full justify-center truncate px-4 text-base leading-tight text-neutral-600 dark:text-neutral-300 sm:px-8 sm:text-lg md:text-xl md:leading-[1.125rem]">
        {fileInfo.name}
      </p>
      <div className="flex items-center gap-1 px-8">
        <FailedXmarkIcon width={20} height={20} />
        <p className="text-center text-sm leading-tight text-red-500 dark:text-red-400 sm:text-base md:text-xl md:leading-[1.125rem]">
          {errorMessage || texts.uploadFailed}
        </p>
      </div>
      {resetUpload && (
        <button
          onClick={resetUpload}
          className="mt-2 flex rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:px-3 sm:text-sm"
        >
          {texts.tryAgain}
        </button>
      )}
    </div>
  );
};

export default FileInfo;
