/**
 * Type definitions for the file upload system
 */

// Common file status types
export type UploadStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';
export type QueueStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';
export type FileUploadStatus = 'selected' | 'waiting' | 'uploading' | 'completed' | 'failed';

// Language options
export type LanguageOption = 'fa' | 'en';

// Basic file info
export interface FileInfo {
  name: string;
  size: string;
  type: string;
}

// File metadata returned from server
export interface FileMetadata {
  originalName: string;
  uniqueName: string;
  size: number;
  mimetype: string;
  thumbnailName?: string;
  url: string;
  thumbnailUrl?: string;
  bucket: string;
  uploadedAt: Date;
  [key: string]: any;
}

// Basic file data for Redux store (serializable)
export interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
}

// File upload response data structure
export interface FileResponseData {
  originalName: string;
  uniqueName: string;
  size: number;
  mimetype: string;
  thumbnailName?: string;
  url: string;
  thumbnailUrl?: string;
  bucket: string;
  uploadedAt: string | Date;
  [key: string]: any; // For any additional properties
}

// Response structure from server
export interface FileUploadResponse {
  success?: boolean;
  statusCode?: number;
  message?: string[];
  data?: {
    message?: string;
    files?: FileResponseData[];
  };
  files?: FileResponseData[]; // For backward compatibility
}

// File upload info for tracking progress
export interface FileUploadInfo {
  id: string;
  ownerId: string;
  isUploading: boolean;
  fileData: FileData;
  status: FileUploadStatus;
  progress: number;
  bytesUploaded: number;
  errorMessage: string;
  metadata?: FileMetadata;
  response?: FileUploadResponse;
}

// Response from file upload API
export interface UploadFileResponse {
  success: boolean;
  statusCode: number;
  message: string[];
  data?: {
    message?: string;
    files?: {
      originalName: string;
      uniqueName: string;
      size: number;
      mimetype: string;
      thumbnailName?: string;
      url: string;
      thumbnailUrl?: string;
      bucket: string;
      uploadedAt: string | Date;
      [key: string]: any;
    }[];
  };
  files?: any[]; // For backward compatibility
}

// Props for SingleFileUpload component
export interface SingleFileUploadProps {
  id?: string; // Unique identifier for this upload component
  bucket?: string;
  type?: 'multiple' | 'single';
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  uploadingDependsToForm?: boolean;
  language?: LanguageOption; // Language option: Persian (fa) or English (en)
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: any) => void;
  onFileSelect?: (file: File | null) => void;
}

// Props for MultiFileUpload component
export interface MultiFileUploadProps {
  id?: string; // Unique ID for component instance
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  language?: LanguageOption; // Language option: Persian (fa) or English (en)
  onUploadComplete?: (uploadedFiles: FileUploadInfo[]) => void;
  onAllUploadsComplete?: (succeeded: FileUploadInfo[], failed: FileUploadInfo[]) => void;
  onError?: (error: any) => void;
}

// Options for useSingleFileUpload hook
export interface UseSingleFileUploadOptions {
  id?: string; // Component instance ID for isolation
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: any) => void;
  onFileSelect?: (file: File | null) => void;
}

// Options for useMultiFileUpload hook
export interface UseMultiFileUploadOptions {
  id?: string; // Unique ID for component instance
  bucket?: string;
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
  onUploadComplete?: (uploadedFiles: FileUploadInfo[]) => void;
  onAllUploadsComplete?: (succeeded: FileUploadInfo[], failed: FileUploadInfo[]) => void;
  onError?: (error: any) => void;
}

// Return type for useSingleFileUpload hook
export interface SingleFileUploadHookResult {
  instanceId: string;
  selectedFile: File | null;
  fileInfo: FileInfo;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  errorMessage: string;
  handleFileSelect: (file: File | null) => void;
  handleFileReject: (reason: string) => void;
  startUpload: () => Promise<any>;
  cancelUpload: () => void;
  resetUpload: () => void;
  uploadProps?: {
    selectedFile: File | null;
    onFileSelect: (file: File | null) => void;
    onFileReject: (reason: string) => void;
    uploadStatus: UploadStatus;
    uploadProgress: number;
    errorMessage: string;
    onUploadStart: () => Promise<any>;
    onUploadCancel: () => void;
    onRemoveFile: () => void;
  };
}

// Return type for useMultiFileUpload hook
export interface MultiFileUploadHookResult {
  componentId: string;
  queue: FileUploadInfo[];
  queueStatus: QueueStatus;
  currentUploadingFile: FileUploadInfo | null;
  allFilesHandled: boolean;
  uploadedFiles: FileUploadInfo[];
  failedFiles: FileUploadInfo[];
  isUploading: boolean;
  cancelledUploads: string[];
  wasCancelled: (fileId: string) => boolean;
  addFilesToQueue: (files: File[]) => void;
  removeFileFromQueue: (fileId: string) => void;
  clearFileQueue: () => void;
  startFileUpload: () => void;
  cancelSingleUpload: (fileId: string) => void;
  cancelAllFileUploads: () => void;
  retryFailedUpload: (fileId: string) => void;
  retryAllFailed: () => void;
  resetForMoreFiles: () => void;
  getFileState: (fileId: string) => FileUploadInfo | undefined;
  getFileObject: (fileId: string) => File | undefined;
}

// FileList component props
export interface FileListProps {
  queue: FileUploadInfo[];
  wasCancelled: (fileId: string) => boolean;
  language: LanguageOption;
  handleCancel: (fileId: string) => void;
  removeFileFromQueue: (fileId: string) => void;
  retryFailedUpload: (fileId: string) => void;
}

// FileConstraints component props
export interface FileConstraintsProps {
  displayConstraints: string[];
  language: LanguageOption;
}

// FileUploadForm component props
export interface FileUploadFormProps {
  id?: string;
  componentId: string;
  queueStatus: QueueStatus;
  dragActive?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  acceptedFileTypes?: string;
  language: LanguageOption;
  texts: Record<string, string>;
  validationError?: string | null;
  queue?: FileUploadInfo[];
  uploadResults?: {
    completed: FileUploadInfo[];
    failed: FileUploadInfo[];
    cancelled: FileUploadInfo[];
  };
  hasFailedFiles?: boolean;
  hasCancelledFiles?: boolean;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFileSelector: () => void;
  startFileUpload?: () => void;
  handleCancel?: (fileId: string) => void;
  cancelAllFileUploads?: () => void;
  handleSelectMoreFiles?: () => void;
  retryAllFailed?: () => void;
  children?: React.ReactNode;
}

// FileInfo component props
export interface FileInfoProps {
  fileInfo: FileInfo;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  texts: Record<string, string>;
  errorMessage?: string;
  startUpload?: () => void;
  resetUpload?: () => void;
  uploadingDependsToForm?: boolean;
  cancelUpload?: () => void;
}

// FileStatus component props
export interface FileStatusProps {
  uploadStatus: UploadStatus;
  fileInfo: FileInfo;
  errorMessage?: string;
  texts: Record<string, string>;
  resetUpload: () => void;
}
