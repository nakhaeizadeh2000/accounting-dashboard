import React, { useState, useEffect } from 'react';
import { SingleFileUploadProps } from '../types/file-upload.types';
import { useSingleFileUpload } from '../hooks/useSingleFileUpload';
import FileDropZone from './FileDropZone';
import AddFileIcon from '../icons/AddFileIcon';
import CompleteTickIcon from '../icons/CompleteTickIcon';
import FailedXmarkIcon from '../icons/FailedXmarkIcon';
import XIcon from '../icons/XIcon';

// Map file extensions to icons
import ImageFileIcon from '../icons/ImageFileIcon';
import VideoFileIcon from '../icons/VideoFileIcon';
import AudioFileIcon from '../icons/AudioFileIcon';
import CompressedFileIcon from '../icons/CompressedFileIcon';
import DocumentFileIcon from '../icons/DocumentFileIcon';

/**
 * Maps file mime types to appropriate icons
 */
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
    return DocumentFileIcon;
  }
};

/**
 * SingleFileUpload Component
 *
 * A component that allows users to select and upload a single file
 */
const SingleFileUpload: React.FC<SingleFileUploadProps> = ({
  acceptedFileTypes,
  maxSizeMB = 10,
  uploadingDependsToForm = false,
  onFileSelect,
  onFileReject,
  onUploadStart,
  onUploadCancel,
  onUploadComplete,
  onUploadError,
  onRemoveFile,

  // Controlled mode props
  status: externalStatus,
  progress: externalProgress,
  errorMessage: externalError,
}) => {
  // If component is controlled, use the provided props
  const isControlled = externalStatus !== undefined;

  // Set up the custom hook for internal state
  const {
    file,
    fileInfo,
    status: internalStatus,
    progress: internalProgress,
    error: internalError,
    handleFileSelect,
    startUpload: startInternalUpload,
    cancelUpload: cancelInternalUpload,
    removeFile: removeInternalFile,
  } = useSingleFileUpload({
    acceptedFileTypes,
    maxSizeMB,
    onChange: onFileSelect,
    onError: onFileReject,
  });

  // Use external or internal state based on controlled mode
  const status = isControlled ? externalStatus : internalStatus;
  const progress = isControlled ? externalProgress || 0 : internalProgress;
  const errorMessage = isControlled ? externalError : internalError;

  // Handle upload start
  const handleStartUpload = async () => {
    if (isControlled && onUploadStart) {
      await onUploadStart();
    } else if (!isControlled) {
      const result = await startInternalUpload();
      if (result && onUploadComplete) {
        onUploadComplete(result);
      }
    }
  };

  // Handle upload cancellation
  const handleCancelUpload = () => {
    if (isControlled && onUploadCancel) {
      onUploadCancel();
    } else if (!isControlled) {
      cancelInternalUpload();
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    if (isControlled && onRemoveFile) {
      onRemoveFile();
    } else if (!isControlled) {
      removeInternalFile();
    }
  };

  // Render the idle state (no file selected)
  if (status === 'idle') {
    return (
      <div className="flex h-[13.75rem] w-[25rem] flex-col overflow-hidden rounded-xl bg-slate-100">
        <FileDropZone
          acceptedFileTypes={acceptedFileTypes}
          maxSizeMB={maxSizeMB}
          onFileSelect={handleFileSelect}
          multiple={false}
        />
      </div>
    );
  }

  // Get the appropriate icon for the file type
  const FileIcon = fileInfo ? getFileIcon(fileInfo.type) : DocumentFileIcon;

  // Render the file selected state or uploading state
  if (status === 'selected' || status === 'uploading') {
    return (
      <div className="relative flex h-[13.75rem] w-[25rem] flex-col items-center justify-center gap-6 overflow-hidden rounded-xl bg-slate-100">
        {/* Cancel button for uploading state */}
        {!uploadingDependsToForm && status === 'uploading' && (
          <button
            onClick={handleCancelUpload}
            className="absolute right-2 top-2 z-10 flex rounded-md bg-slate-200 px-2 py-1 text-slate-500 transition-colors hover:bg-slate-300"
          >
            cancel
          </button>
        )}

        {/* Progressive background for uploading state */}
        {status === 'uploading' && (
          <div
            className="absolute inset-0 z-0 bg-blue-100"
            style={{
              width: `${progress}%`,
              transition: 'width 0.3s ease-in-out',
            }}
          />
        )}

        {/* File icon */}
        <div className="z-10 flex w-full flex-col items-center justify-end">
          <FileIcon width={45} height={45} />
        </div>

        {/* File info and controls */}
        <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
          <p className="flex w-full justify-center truncate px-8 text-xl leading-[1.125rem] text-neutral-600">
            {fileInfo?.name}
          </p>

          {status === 'uploading' ? (
            <div className="flex gap-2">
              <p className="text-xl leading-[1.125rem] text-blue-500">{progress}%</p>
              <p className="text-xl leading-[1.125rem] text-neutral-400">|</p>
              <p className="text-xl leading-[1.125rem] text-blue-500">Uploading</p>
              <p className="text-xl leading-[1.125rem] text-neutral-400">|</p>
              <p className="text-xl leading-[1.125rem] text-blue-500">{fileInfo?.size}</p>
            </div>
          ) : (
            <>
              <p className="text-xl leading-[1.125rem] text-blue-500">{fileInfo?.size}</p>
              <div className="flex gap-2">
                {!uploadingDependsToForm && (
                  <button
                    onClick={handleStartUpload}
                    className="flex rounded-md bg-slate-200 px-2 py-1 text-slate-500 transition-colors hover:bg-slate-300"
                  >
                    start upload
                  </button>
                )}

                <button
                  onClick={handleRemoveFile}
                  className="flex rounded-md bg-red-200 px-2 py-1 text-slate-500 transition-colors hover:bg-red-300"
                >
                  remove file
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Render the completed or failed state
  return (
    <div className="relative flex h-[13.75rem] w-[25rem] flex-col items-center justify-center gap-6 overflow-hidden rounded-xl bg-slate-100">
      <div className="z-10 flex w-full flex-col items-center justify-end">
        <FileIcon width={45} height={45} />
      </div>
      <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
        <p className="flex w-full justify-center truncate px-8 text-xl leading-[1.125rem] text-neutral-600">
          {fileInfo?.name}
        </p>

        {status === 'completed' ? (
          <div className="flex items-center gap-1">
            <CompleteTickIcon width={22} height={22} />
            <p className="text-xl leading-[1.125rem] text-blue-500">Upload Complete</p>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <FailedXmarkIcon width={20} height={20} />
            <p className="text-xl leading-[1.125rem] text-red-500">
              {errorMessage || 'Upload Failed!'}
            </p>
          </div>
        )}

        <button
          onClick={handleRemoveFile}
          className="mt-2 flex rounded-md bg-slate-200 px-3 py-1 text-slate-500 transition-colors hover:bg-slate-300"
        >
          {status === 'completed' ? 'Done' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default SingleFileUpload;
