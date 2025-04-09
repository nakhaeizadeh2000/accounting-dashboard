import React from 'react';
import { FileStatusProps } from '../../utils/file-types';
import CompleteTickIcon from '../../../../icon/CompleteTickIcon';
import FailedXmarkIcon from '../../../../icon/FailedXmarkIcon';

/**
 * Displays the final status of a file upload (completed or failed)
 */
const FileStatus: React.FC<FileStatusProps> = ({
  uploadStatus,
  fileInfo,
  errorMessage,
  texts,
  resetUpload,
}) => {
  // Get the appropriate file icon based on MIME type
  const FileIcon = (props: any) => {
    // This is just a placeholder as the actual implementation would use
    // icons imported from the appropriate location
    return <div {...props} />;
  };

  return (
    <>
      <div className="z-10 flex w-full flex-col items-center justify-end">
        {/* The actual icon component will be rendered by the parent component */}
        <FileIcon width={45} height={45} />
      </div>
      <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
        <p className="flex w-full justify-center truncate px-4 text-base leading-tight text-neutral-600 dark:text-neutral-300 sm:px-8 sm:text-lg md:text-xl md:leading-[1.125rem]">
          {fileInfo.name}
        </p>

        {uploadStatus === 'completed' ? (
          <div className="flex items-center gap-1">
            <CompleteTickIcon width={22} height={22} />
            <p className="text-sm leading-tight text-blue-500 dark:text-blue-400 sm:text-base md:text-xl md:leading-[1.125rem]">
              {texts.uploadComplete}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-8">
            <FailedXmarkIcon width={20} height={20} />
            <p className="text-center text-sm leading-tight text-red-500 dark:text-red-400 sm:text-base md:text-xl md:leading-[1.125rem]">
              {errorMessage || texts.uploadFailed}
            </p>
          </div>
        )}

        {uploadStatus !== 'completed' && (
          <button
            onClick={resetUpload}
            className="mt-2 flex rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 sm:px-3 sm:text-sm"
          >
            {texts.tryAgain}
          </button>
        )}
      </div>
    </>
  );
};

export default FileStatus;
