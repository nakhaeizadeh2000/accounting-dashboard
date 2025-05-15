import React from 'react';
import { FileListProps } from '../../utils/file-types';
import { formatFileName, formatFileSize, getStatusText } from '../../utils/file-formatters';
import styles from '../../styles/upload-file.module.scss';
import { multiFileUploadTranslations } from '../../constants/translations';
import ImageFileIcon from '../../../../icon/ImageFileIcon';
import VideoFileIcon from '../../../../icon/VideoFileIcon';
import AudioFileIcon from '../../../../icon/AudioFileIcon';
import CompressedFileIcon from '../../../../icon/CompressedFileIcon';
import DocumentFileIcon from '../../../../icon/DocumentFileIcon';
import CompleteTickIcon from '../../../../icon/CompleteTickIcon';
import XIcon from '../../../../icon/XIcon';

/**
 * Displays a list of files with their statuses, progress, and actions
 */
const FileList: React.FC<FileListProps> = ({
  queue,
  wasCancelled,
  language,
  handleCancel,
  removeFileFromQueue,
  retryFailedUpload,
}) => {
  const texts = multiFileUploadTranslations[language];

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

  if (queue.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400">
        {texts.noFilesSelected}
      </div>
    );
  }

  return (
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
                  {getStatusText(
                    fileInfo.status,
                    isCancelled,
                    language,
                    multiFileUploadTranslations,
                  )}
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

              {(fileInfo.status === 'waiting' || fileInfo.status === 'selected') && (
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

              {(fileInfo.status === 'failed' || isCancelled) && (
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
  );
};

export default FileList;
