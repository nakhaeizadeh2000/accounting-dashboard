// components/modules/file-manager/hooks/useFileActions.ts
import { useState, useCallback } from 'react';
import { FileData, FileTag } from '../types';
import {
  useDeleteFileMutation,
  downloadFile as downloadFileApi,
  previewThumbnail,
} from '@/store/features/files';

export function useFileActions(
  onFileViewCallback?: (file: FileData) => void,
  onFileDeleteCallback?: (file: FileData) => void,
  onFileDownloadCallback?: (file: FileData) => void,
  onTagsUpdateCallback?: (file: FileData, tags: FileTag[]) => void,
) {
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [tagsModalFile, setTagsModalFile] = useState<FileData | null>(null);

  // Use RTK Query mutation for file deletion
  const [deleteFileMutation, { isLoading: isDeleting }] = useDeleteFileMutation();

  const toggleOptionsMenu = useCallback((fileId: string | null) => {
    setActiveMenuFileId((prev) => (prev === fileId ? null : fileId));
  }, []);

  const handleView = useCallback(
    (file: FileData) => {
      toggleOptionsMenu(null);

      // For images, use the previewThumbnail function
      if (file.thumbnailUrl || file.type.startsWith('image/') || file.type.startsWith('video/')) {
        previewThumbnail({
          originalName: file.name,
          uniqueName: file.id,
          size: file.size,
          mimetype: file.type,
          uploadedAt: file.uploadDate,
          url: file.url || '',
          thumbnailUrl: file.thumbnailUrl,
          bucket: file.bucket,
        });
      } else if (file.url) {
        // For other files with URLs, open in a new tab
        window.open(file.url, '_blank');
      }

      if (onFileViewCallback) {
        onFileViewCallback(file);
      }
    },
    [toggleOptionsMenu, onFileViewCallback],
  );

  const handleDownload = useCallback(
    async (file: FileData) => {
      toggleOptionsMenu(null);

      try {
        // Use the downloadFile function from the API
        if (file.url) {
          downloadFileApi({
            originalName: file.name,
            uniqueName: file.id,
            size: file.size,
            mimetype: file.type,
            uploadedAt: file.uploadDate,
            url: file.url,
            thumbnailUrl: file.thumbnailUrl,
            bucket: file.bucket,
          });
        }

        if (onFileDownloadCallback) {
          onFileDownloadCallback(file);
        }
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    },
    [toggleOptionsMenu, onFileDownloadCallback],
  );

  const handleDelete = useCallback(
    async (file: FileData) => {
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
    (file: FileData) => {
      toggleOptionsMenu(null);
      setTagsModalFile(file);
    },
    [toggleOptionsMenu],
  );

  const closeTagsModal = useCallback(() => {
    setTagsModalFile(null);
  }, []);

  const handleTagsUpdate = useCallback(
    (file: FileData, tags: FileTag[]) => {
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
