// app/store/features/files/file.model.ts

// Interface for file response from the API
export interface ResponseFileDto {
  id: string;
  originalName: string;
  uniqueName: string;
  size: number;
  mimetype: string;
  bucket: string;
  thumbnailName?: string;
  url?: string;
  thumbnailUrl?: string;
  uploadedAt: string | Date;
}

// Interface for file upload options
export interface FileUploadOptions {
  generateThumbnail?: boolean;
  skipThumbnailForLargeFiles?: boolean;
  direct?: boolean;
  download?: boolean;
}

// Interface for file metadata used in various components
export interface FileMetadata {
  id?: string;
  originalName: string;
  uniqueName: string;
  size: number;
  mimetype: string;
  bucket: string;
  thumbnailName?: string;
  url?: string;
  thumbnailUrl?: string;
  uploadedAt: string | Date;
}
