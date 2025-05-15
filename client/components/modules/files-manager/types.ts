// components/modules/file-manager/types.ts
export interface FileTag {
  id: string;
  name: string;
  color?: string;
}
export interface FileData {
  id: string;
  name: string;
  bucket: string;
  path?: string;
  type: string;
  size: number;
  uploadDate: Date;
  thumbnailUrl?: string;
  url?: string;
  metadata?: Record<string, any>;
  tags?: FileTag[];
  // Added for uploading files
  status?: FileUploadStatus;
  progress?: number;
}

export type FileUploadStatus =
  | 'idle'
  | 'selected'
  | 'waiting'
  | 'uploading'
  | 'completed'
  | 'failed';

export type QueueStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';

export interface FileManagerProps {
  ownerId: string; // Unique ID for this instance of the file manager
  bucket?: string; // Bucket to fetch files from
  title?: string; // Optional title for the component
  maxHeight?: string; // CSS max-height value
  allowMultiSelect?: boolean; // Allow selecting multiple files
  onFileSelect?: (files: FileData[]) => void; // Callback when files are selected
  onFileDelete?: (file: FileData) => void; // Callback when a file is deleted
  onFileDownload?: (file: FileData) => void; // Callback when a file is downloaded
  onFileView?: (file: FileData) => void; // Callback when a file is viewed
  onTagsUpdate?: (file: FileData, tags: FileTag[]) => void; // Callback when tags are updated
  className?: string; // Additional CSS classes
  defaultView?: ViewMode; // Default view mode
  itemsPerPage?: number; // Number of items to load per page/batch
  emptyText?: string; // Text to display when no files
  filterTypes?: string[]; // Filter files by these types
  availableTags?: FileTag[]; // Available tags to choose from
  sortBy?: SortOption; // Sort files by
  sortDirection?: SortDirection; // Sort direction
  showUploadingFiles?: boolean; // Show files that are currently being uploaded
  refreshInterval?: number; // Auto-refresh interval in ms
}

export type ViewMode = 'grid' | 'list';

export type SortOption = 'name' | 'date' | 'size' | 'type';

export type SortDirection = 'asc' | 'desc';

export interface OptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onTags: () => void;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  additionalOptions?: React.ReactNode;
}

export interface TagsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileData;
  availableTags: FileTag[];
  onSave: (file: FileData, tags: FileTag[]) => void;
}

export interface FileCardProps {
  file: FileData;
  isSelected: boolean;
  onSelect: (fileId: string) => void;
  onOptionsToggle: (fileId: string) => void;
  isOptionsOpen: boolean;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onTagsEdit: () => void;
}

export interface FileRowProps {
  file: FileData;
  isSelected: boolean;
  onSelect: (fileId: string) => void;
  onOptionsToggle: (fileId: string) => void;
  isOptionsOpen: boolean;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onTagsEdit: () => void;
}

export interface FileTypeIconProps {
  fileType: string;
  className?: string;
}

export interface FileTagsProps {
  tags: FileTag[];
  limit?: number;
  size?: 'sm' | 'md';
}

export interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSortChange: (sortOption: SortOption) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  currentSort: SortOption;
  currentSortDirection: SortDirection;
  selectedFiles: string[];
  totalFiles: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDownloadSelected: () => void;
  onDeleteSelected: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  currentViewMode: ViewMode;
  onRefresh?: () => void; // Added for manual refresh
}

export interface EmptyStateProps {
  message?: string;
}

export interface LoadingStateProps {
  message?: string;
}

// Add type for FileViewer props
export interface FileViewerProps {
  fileUrl: string;
  fileType: string;
  fileName: string;
  bucket: string;
  fileId: string;
  className?: string;
  fallbackSize?: number;
}
