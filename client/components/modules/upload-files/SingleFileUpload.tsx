import { useState, useRef, ChangeEvent } from 'react';
import AddFileIcon from './icons/AddFileIcon';
import CompleteTickIcon from './icons/CompleteTickIcon';
import FailedXmarkIcon from './icons/FailedXmarkIcon';
import ImageFileIcon from './icons/ImageFileIcon';
import VideoFileIcon from './icons/VideoFileIcon';
import AudioFileIcon from './icons/AudioFileIcon';
import CompressedFileIcon from './icons/CompressedFileIcon';
import DocumentFileIcon from './icons/DocumentFileIcon';

export type SingleFileUploadProps = {
  type?: 'multiple' | 'single';
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  uploadingDependsToForm?: boolean;
  onFileSelect?: (file: File | null) => void;
  onFileReject?: (reason: string) => void;
  uploadStatus?: 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';
  uploadProgress?: number;
  errorMessage?: string;
  onUploadStart?: () => void;
  onUploadCancel?: () => void;
  onRemoveFile?: () => void;
};

type UploadStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';

// Map file extensions to icons (you'll need to create or import these icons)
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return ImageFileIcon; // Replace with ImageIcon when available
  } else if (fileType.startsWith('video/')) {
    return VideoFileIcon; // Replace with VideoIcon when available
  } else if (fileType.startsWith('audio/')) {
    return AudioFileIcon; // Replace with AudioIcon when available
  } else if (
    fileType.includes('zip') ||
    fileType.includes('rar') ||
    fileType.includes('compressed')
  ) {
    return CompressedFileIcon; // Replace with ZipIcon when available
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
  type = 'single',
  acceptedFileTypes = '',
  maxSizeMB = 10,
  onFileSelect,
  onFileReject,
  uploadingDependsToForm = true,
  uploadStatus: externalUploadStatus,
  uploadProgress: externalUploadProgress,
  errorMessage: externalErrorMessage,
  onUploadStart,
  onUploadCancel,
  onRemoveFile,
}: SingleFileUploadProps) => {
  // File states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState({ name: '', size: '', type: '' });
  const [internalUploadStatus, setInternalUploadStatus] = useState<UploadStatus>('idle');
  const [internalUploadProgress, setInternalUploadProgress] = useState(0);
  const [internalErrorMessage, setInternalErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use external state if provided, otherwise use internal state
  const uploadStatus = externalUploadStatus || internalUploadStatus;
  const uploadProgress =
    externalUploadProgress !== undefined ? externalUploadProgress : internalUploadProgress;
  const errorMessage = externalErrorMessage || internalErrorMessage;

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file size
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setInternalErrorMessage(`File size exceeds the limit`);
      setInternalUploadStatus('failed');
      if (onFileReject) {
        onFileReject(`File size exceeds the limit`);
      }
      return;
    }

    // Validate file type if acceptedFileTypes is specified
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
        setInternalErrorMessage(`File type is unacceptable.`);
        setInternalUploadStatus('failed');
        if (onFileReject) {
          onFileReject(`File type is unacceptable.`);
        }
        return;
      }
    }

    // Set file information
    setSelectedFile(file);
    setFileInfo({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
    });
    setInternalUploadStatus('selected');

    if (onFileSelect) {
      onFileSelect(file);
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
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Simulate file input change
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
      handleFileChange({ target: { files: dataTransfer.files } } as ChangeEvent<HTMLInputElement>);
    }
  };

  // Handle uploading
  const handleStartUpload = () => {
    if (!selectedFile) return;

    // If parent provided onUploadStart, call it
    if (onUploadStart) {
      onUploadStart();
    } else {
      // Otherwise use internal state for demo/testing
      setInternalUploadStatus('uploading');
      setInternalUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setInternalUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setInternalUploadStatus('completed');
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  // Handle upload cancellation
  const handleCancelUpload = () => {
    if (onUploadCancel) {
      onUploadCancel();
    } else {
      // For internal state handling
      setInternalUploadStatus('failed');
      setInternalErrorMessage('Upload cancelled');
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    // Always handle removal internally first
    setSelectedFile(null);
    setFileInfo({ name: '', size: '', type: '' });
    setInternalUploadStatus('idle');
    setInternalUploadProgress(0);
    setInternalErrorMessage('');

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Notify parent if callback exists
    if (onRemoveFile) {
      onRemoveFile();
    }

    // If onFileSelect exists, tell parent the file is now null
    if (onFileSelect) {
      onFileSelect(null);
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
    const FileIcon = getFileIcon(fileInfo.type);

    return (
      <div
        dir="ltr"
        className="relative flex h-[13.75rem] w-[25rem] flex-col items-center justify-center gap-6 overflow-hidden rounded-xl bg-slate-100"
      >
        {!uploadingDependsToForm && uploadStatus === 'uploading' && (
          <button
            onClick={handleCancelUpload}
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
            {fileInfo.name}
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

  // Final step - Completed or Failed
  return (
    <div
      dir="ltr"
      className="relative flex h-[13.75rem] w-[25rem] flex-col items-center justify-center gap-6 overflow-hidden rounded-xl bg-slate-100"
    >
      <div className="z-10 flex w-full flex-col items-center justify-end">
        {getFileIcon(fileInfo.type)({ width: 45, height: 45 })}
      </div>
      <div className="z-10 flex w-full flex-col items-center justify-start gap-2">
        <p className="flex w-full justify-center truncate px-8 text-xl leading-[1.125rem] text-neutral-600">
          {fileInfo.name}
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
          onClick={handleRemoveFile}
          className="mt-2 flex rounded-md bg-slate-200 px-3 py-1 text-slate-500 transition-colors hover:bg-slate-300"
        >
          {uploadStatus === 'completed' ? 'Done' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

export default SingleFileUpload;
