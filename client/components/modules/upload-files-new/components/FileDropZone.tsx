import React, { useRef } from 'react';
import AddFileIcon from '../icons/AddFileIcon';
import { parseAcceptedTypes } from '../utils/file-upload.utils';

type FileDropZoneProps = {
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  uploadingInProgress?: boolean;
  hasCompletedFiles?: boolean;
  onFileSelect: (files: FileList) => void;
};

/**
 * A reusable drop zone component for file uploads
 * Handles drag & drop and file input functionality
 */
const FileDropZone: React.FC<FileDropZoneProps> = ({
  acceptedFileTypes,
  maxSizeMB,
  maxFiles,
  multiple = false,
  disabled = false,
  uploadingInProgress = false,
  hasCompletedFiles = false,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate constraints for display
  const fileTypes = parseAcceptedTypes(acceptedFileTypes);
  const constraints = [...fileTypes];

  if (maxSizeMB) {
    constraints.push(`Max ${maxSizeMB}MB`);
  }

  if (maxFiles && multiple) {
    constraints.push(`Max ${maxFiles} files`);
  }

  const openFileSelector = () => {
    if (disabled || uploadingInProgress) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || uploadingInProgress) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  // Determine message to display
  let message = 'click or drop files to upload';
  if (uploadingInProgress) {
    message = 'Uploading in progress...';
  } else if (hasCompletedFiles) {
    message = 'Add more files...';
  }

  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-hidden rounded-t-xl">
      <div
        className="flex h-5/6 w-full flex-row justify-between overflow-hidden rounded-xl bg-gray-50"
        onClick={openFileSelector}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role={disabled || uploadingInProgress ? undefined : 'button'}
        tabIndex={disabled || uploadingInProgress ? undefined : 0}
        style={{ cursor: disabled || uploadingInProgress ? 'default' : 'pointer' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          className="hidden"
          multiple={multiple}
          disabled={disabled || uploadingInProgress}
        />

        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
          <AddFileIcon width={40} height={40} />
          <p className="text-xl leading-[1.125rem] text-neutral-400">{message}</p>
        </div>
      </div>

      {/* Constraints */}
      <div className="flex h-1/6 w-full flex-row justify-end gap-2 overflow-hidden">
        {constraints.map((constraint, index) => (
          <div
            key={index}
            className="flex h-full items-center rounded-md bg-gray-50 px-2 text-neutral-500"
          >
            <p dir="ltr">{constraint}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileDropZone;
