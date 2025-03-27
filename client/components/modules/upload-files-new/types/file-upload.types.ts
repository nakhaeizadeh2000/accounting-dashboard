/**
 * Common types used across file upload components
 */

export type FileUploadStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';

export type FileItem = {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
  status: FileUploadStatus;
  progress: number;
  error?: string;
};

export type FileUploadOptions = {
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  uploadingDependsToForm?: boolean;
};

export type SingleFileUploadProps = FileUploadOptions & {
  onFileSelect?: (file: File | null) => void;
  onFileReject?: (reason: string) => void;
  onUploadStart?: () => Promise<any[] | Record<string, any>> | void;
  onUploadCancel?: () => void;
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: any) => void;
  onRemoveFile?: () => void;

  // Status props - you can control the component from parent
  status?: FileUploadStatus;
  progress?: number;
  errorMessage?: string;
};

export type MultiFileUploadProps = FileUploadOptions & {
  maxFiles?: number;
  onFilesSelect?: (files: File[]) => void;
  onFileReject?: (reason: string) => void;
  onUploadStart?: () => Promise<any[] | Record<string, any>> | void;
  onUploadCancel?: (fileId: string) => void;
  onFileUploadComplete?: (fileId: string, result: any) => void;
  onFileUploadError?: (fileId: string, error: any) => void;
  onRemoveFile?: (fileId: string) => void;
  onRetryFile?: (fileId: string) => void;
  onAllUploadsComplete?: (results: Record<string, any>) => void;

  // Status props - you can control the component from parent
  overallStatus?: FileUploadStatus;
  fileProgress?: Record<string, number>;
  fileErrors?: Record<string, string>;
};

export type FileListItemProps = {
  file: FileItem;
  onCancel: (fileId: string) => void;
  onRemove: (fileId: string) => void;
  onRetry: (fileId: string) => void;
};
