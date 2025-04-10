// components/modules/file-manager/hooks/useFileActions.ts
import { useState, useCallback } from 'react';
import { FileData, FileTag } from '../types';
import {
  useDeleteFileMutation,
  downloadFile as downloadFileApi,
  FileMetadata,
} from '@/store/features/files';
import { getFileTypeFromExtension } from '../utils/fileHelpers';

interface UseFileActionsResult {
  activeMenuFileId: string | null;
  tagsModalFile: FileData | null;
  isDeleting: boolean;
  toggleOptionsMenu: (fileId: string | null) => void;
  handleView: (file: FileData) => void;
  handleDownload: (file: FileData) => void;
  handleDelete: (file: FileData) => Promise<void>;
  openTagsModal: (file: FileData) => void;
  closeTagsModal: () => void;
  handleTagsUpdate: (file: FileData, tags: FileTag[]) => void;
}

export function useFileActions(
  onFileViewCallback?: (file: FileData) => void,
  onFileDeleteCallback?: (file: FileData) => void,
  onFileDownloadCallback?: (file: FileData) => void,
  onTagsUpdateCallback?: (file: FileData, tags: FileTag[]) => void,
): UseFileActionsResult {
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [tagsModalFile, setTagsModalFile] = useState<FileData | null>(null);

  // Use RTK Query mutation for file deletion
  const [deleteFileMutation, { isLoading: isDeleting }] = useDeleteFileMutation();

  const toggleOptionsMenu = useCallback((fileId: string | null): void => {
    setActiveMenuFileId((prev) => (prev === fileId ? null : fileId));
  }, []);

  const handleView = useCallback(
    (file: FileData): void => {
      toggleOptionsMenu(null);

      // Get real file type based on extension if mimetype is application/octet-stream
      const actualFileType =
        file.type === 'application/octet-stream' ? getFileTypeFromExtension(file.name) : file.type;

      // Create a direct download URL through the API (more reliable)
      const directUrl = `/api/files/download/${file.bucket}/${file.id}?direct=true`;

      // For images and some document types, try to show in the browser
      if (
        actualFileType.startsWith('image/') ||
        actualFileType === 'application/pdf' ||
        actualFileType.startsWith('text/') ||
        actualFileType.startsWith('video/') ||
        actualFileType.startsWith('audio/')
      ) {
        window.open(directUrl, '_blank');
      } else {
        // For other files, try to download directly
        const link = document.createElement('a');
        link.href = directUrl;
        link.setAttribute('download', file.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      if (onFileViewCallback) {
        onFileViewCallback(file);
      }
    },
    [toggleOptionsMenu, onFileViewCallback],
  );

  const handleDownload = useCallback(
    (file: FileData): void => {
      toggleOptionsMenu(null);

      try {
        // First try using the downloadFileApi function which uses presigned URLs
        if (file.url) {
          // Convert FileData to FileMetadata format for the API
          const fileMetadata: FileMetadata = {
            originalName: file.name,
            uniqueName: file.id,
            size: file.size,
            mimetype: file.type,
            bucket: file.bucket,
            uploadedAt: file.uploadDate,
            url: file.url,
          };

          if (file.thumbnailUrl) {
            fileMetadata.thumbnailUrl = file.thumbnailUrl;
          }

          downloadFileApi(fileMetadata);
        } else {
          // Fall back to direct download
          window.location.href = `/api/files/download/${file.bucket}/${file.id}?direct=true`;
        }

        if (onFileDownloadCallback) {
          onFileDownloadCallback(file);
        }
      } catch (error) {
        console.error('Error downloading file:', error);
        // Fall back to direct download if anything fails
        window.location.href = `/api/files/download/${file.bucket}/${file.id}?direct=true`;
      }
    },
    [toggleOptionsMenu, onFileDownloadCallback],
  );

  const handleDelete = useCallback(
    async (file: FileData): Promise<void> => {
      toggleOptionsMenu(null);

      try {
        // Use the RTK Query mutation to delete the file
        const response = await deleteFileMutation({
          bucket: file.bucket,
          filename: file.id,
        }).unwrap();

        // Check if the deletion was successful based on the standardized response
        if (response.success && onFileDeleteCallback) {
          onFileDeleteCallback(file);
        } else if (!response.success) {
          console.error('Error deleting file:', response.message);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    },
    [toggleOptionsMenu, deleteFileMutation, onFileDeleteCallback],
  );

  const openTagsModal = useCallback(
    (file: FileData): void => {
      toggleOptionsMenu(null);
      setTagsModalFile(file);
    },
    [toggleOptionsMenu],
  );

  const closeTagsModal = useCallback((): void => {
    setTagsModalFile(null);
  }, []);

  const handleTagsUpdate = useCallback(
    (file: FileData, tags: FileTag[]): void => {
      closeTagsModal();

      // In a real implementation, we would call an API to update tags
      // For now, we just call the callback
      if (onTagsUpdateCallback) {
        onTagsUpdateCallback(file, tags);
      }
    },
    [closeTagsModal, onTagsUpdateCallback],
  );

  return {
    activeMenuFileId,
    tagsModalFile,
    isDeleting,
    toggleOptionsMenu,
    handleView,
    handleDownload,
    handleDelete,
    openTagsModal,
    closeTagsModal,
    handleTagsUpdate,
  };
}
