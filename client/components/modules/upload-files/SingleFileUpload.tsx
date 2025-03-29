'use client';

import { useState, useRef, ChangeEvent } from 'react';
import useSingleFileUpload from './hook/useSingleFileUpload';
import AddFileIcon from './icons/AddFileIcon';
import CompleteTickIcon from './icons/CompleteTickIcon';
import FailedXmarkIcon from './icons/FailedXmarkIcon';
import ImageFileIcon from './icons/ImageFileIcon';
import VideoFileIcon from './icons/VideoFileIcon';
import AudioFileIcon from './icons/AudioFileIcon';
import CompressedFileIcon from './icons/CompressedFileIcon';
import DocumentFileIcon from './icons/DocumentFileIcon';

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
  onUploadSuccess,
  onUploadError,
  onFileSelect: externalFileSelectHandler,
}: SingleFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use our custom hook to handle file uploading
  const {
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
    instanceId,
  } = useSingleFileUpload({
    id, // Pass component ID for isolation
    bucket,
    acceptedFileTypes,
    maxSizeMB,
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
        className="flex h-[13.75rem] w-[25rem] flex-col items-center justify-center overflow-hidden rounded-xl bg-slate-100"
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
        <div className="flex h-3/4 w-full flex-col items-center justify-center gap-4">
          <AddFileIcon width={45} height={45} />
          <p className="text-xl leading-[1.125rem] text-neutral-400">
            click or drop file to upload
          </p>
        </div>
        <div className="flex h-1/4 w-full flex-row-reverse items-center justify-center gap-2">
          {displayConstraints.map((data, index) => (
            <div
              key={index}
              className="flex h-fit w-fit items-center justify-center rounded-md bg-slate-200 px-2 py-1 text-neutral-500"
            >
              <p dir="ltr" className="">
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
        className="relative flex h-[13.75rem] w-[25rem] flex-col items-center justify-center gap-6 overflow-hidden rounded-xl bg-slate-100"
        data-upload-id={id || instanceId}
      >
        {uploadStatus === 'uploading' && (
          <button
            onClick={cancelUpload}
            className="absolute right-2 top-2 z-10 flex rounded-md bg-slate-200 px-2 py-1 text-slate-500 transition-colors hover:bg-slate-300"
          >
            cancel
          </button>
        )}

        {/* Progressive background */}
        {uploadStatus === 'uploading' && (
          <div
            className="absolute inset-0 z-0 bg-blue-100"
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
          <p className="flex w-full justify-center truncate px-8 text-xl leading-[1.125rem] text-neutral-600">
            {formatFileName(fileInfo.name)}
          </p>
          {uploadStatus === 'uploading' ? (
            <div className="flex gap-2">
              <p className="text-xl leading-[1.125rem] text-blue-500">{uploadProgress}%</p>
              <p className="text-xl leading-[1.125rem] text-neutral-400">|</p>
              <p className="text-xl leading-[1.125rem] text-blue-500">Uploading</p>
              <p className="text-xl leading-[1.125rem] text-neutral-400">|</p>
              <p className="text-xl leading-[1.125rem] text-blue-500">{fileInfo.size}</p>
            </div>
          ) : (
            <>
              <p className="text-xl leading-[1.125rem] text-blue-500">{fileInfo.size}</p>
              <div className="flex gap-2">
                {uploadingDependsToForm && (
                  <button
                    onClick={startUpload}
                    className="flex rounded-md bg-slate-200 px-2 py-1 text-slate-500 transition-colors hover:bg-slate-300"
                  >
                    start upload
                  </button>
                )}

                <button
                  onClick={resetUpload}
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

  // Final step - Completed or Failed
  return (
    <div
      dir="ltr"
      className="relative flex h-[13.75rem] w-[25rem] flex-col items-center justify-center gap-6 overflow-hidden rounded-xl bg-slate-100"
      data-upload-id={id || instanceId}
    >
      <div className="z-10 flex w-full flex-col items-center justify-end">
        {getFileIcon(fileInfo.type || 'application/octet-stream')({ width: 45, height: 45 })}
      </div>
      <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
        <p className="flex w-full justify-center truncate px-8 text-xl leading-[1.125rem] text-neutral-600">
          {formatFileName(fileInfo.name)}
        </p>

        {uploadStatus === 'completed' ? (
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
          onClick={resetUpload}
          className="mt-2 flex rounded-md bg-slate-200 px-3 py-1 text-slate-500 transition-colors hover:bg-slate-300"
        >
          {uploadStatus === 'completed' ? 'Done' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default SingleFileUpload;
