import { useState, useRef } from 'react';
import { FileUploadStatus } from '../types/file-upload.types';
import { formatFileSize, validateFile } from '../utils/file-upload.utils';

type UseSingleFileUploadOptions = {
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  onUpload?: (file: File) => Promise<any>;
  onChange?: (file: File | null) => void;
  onError?: (error: string) => void;
};

type UseSingleFileUploadResult = {
  file: File | null;
  fileInfo: { name: string; size: string; type: string } | null;
  status: FileUploadStatus;
  progress: number;
  error: string;

  selectFile: (file: File | null) => void;
  handleFileSelect: (files: FileList) => void;
  startUpload: () => Promise<any | null>;
  cancelUpload: () => void;
  removeFile: () => void;
  resetState: () => void;
};

/**
 * Custom hook for managing single file uploads
 */
export function useSingleFileUpload(
  options: UseSingleFileUploadOptions = {},
): UseSingleFileUploadResult {
  const { acceptedFileTypes, maxSizeMB, onUpload, onChange, onError } = options;

  // State for file and upload status
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(
    null,
  );
  const [status, setStatus] = useState<FileUploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Reference to track upload process for cancellation
  const uploadControllerRef = useRef<AbortController | null>(null);

  // Select a file and validate it
  const selectFile = (newFile: File | null) => {
    // Reset state if file is null
    if (!newFile) {
      removeFile();
      return;
    }

    // Validate file
    if (acceptedFileTypes || maxSizeMB) {
      const validation = validateFile(newFile, acceptedFileTypes, maxSizeMB);
      if (!validation.valid) {
        setError(validation.reason || 'Invalid file');
        setStatus('failed');

        if (onError) {
          onError(validation.reason || 'Invalid file');
        }
        return;
      }
    }

    // Set file and update state
    setFile(newFile);
    setFileInfo({
      name: newFile.name,
      size: formatFileSize(newFile.size),
      type: newFile.type,
    });
    setStatus('selected');
    setProgress(0);
    setError('');

    if (onChange) {
      onChange(newFile);
    }
  };

  // Handle file selection from input or drop
  const handleFileSelect = (files: FileList) => {
    if (files.length > 0) {
      selectFile(files[0]);
    }
  };

  // Start the upload process
  const startUpload = async (): Promise<any | null> => {
    if (!file || !onUpload) return null;

    // Reset state for new upload
    setStatus('uploading');
    setProgress(0);
    setError('');

    try {
      // Create AbortController for cancellation
      const controller = new AbortController();
      uploadControllerRef.current = controller;

      // Fake progress updates for demo (remove in production)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 200);

      // Call upload function from options
      const result = await onUpload(file);

      // Clear interval and set final state
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('completed');

      return result;
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setStatus('failed');

      if (onError) {
        onError(errorMessage);
      }

      return null;
    } finally {
      uploadControllerRef.current = null;
    }
  };

  // Cancel an in-progress upload
  const cancelUpload = () => {
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
      uploadControllerRef.current = null;

      setStatus('failed');
      setError('Upload cancelled');
    }
  };

  // Remove the currently selected file
  const removeFile = () => {
    if (status === 'uploading') {
      cancelUpload();
    }

    setFile(null);
    setFileInfo(null);
    setStatus('idle');
    setProgress(0);
    setError('');

    if (onChange) {
      onChange(null);
    }
  };

  // Reset all state
  const resetState = () => {
    if (status === 'uploading') {
      cancelUpload();
    }

    setFile(null);
    setFileInfo(null);
    setStatus('idle');
    setProgress(0);
    setError('');
  };

  return {
    file,
    fileInfo,
    status,
    progress,
    error,
    selectFile,
    handleFileSelect,
    startUpload,
    cancelUpload,
    removeFile,
    resetState,
  };
}
