import { useState, useCallback } from 'react';
import { FileData, FileTag } from '../types';
import {
  useDeleteFileMutation,
  useGetFileDownloadUrlQuery,
} from '@/store/features/files/files.api';

export function useFileActions(
  onFileViewCallback?: (file: FileData) => void,
  onFileDeleteCallback?: (file: FileData) => void,
  onFileDownloadCallback?: (file: FileData) => void,
  onTagsUpdateCallback?: (file: FileData, tags: FileTag[]) => void,
) {
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [tagsModalFile, setTagsModalFile] = useState<FileData | null>(null);

  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();

  const toggleOptionsMenu = useCallback((fileId: string | null) => {
    setActiveMenuFileId((prev) => (prev === fileId ? null : fileId));
  }, []);

  const handleView = useCallback(
    (file: FileData) => {
      toggleOptionsMenu(null);
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
        // If you have the URL directly on the file object
        if (file.url) {
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // Try to get the URL from the API
          // You might need to adjust this based on your actual API
          // const { data } = await getFileDownloadUrl({ bucket: file.bucket, filename: file.name }).unwrap();
          // window.open(data.url, '_blank');
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
        await deleteFile({ bucket: file.bucket, filename: file.name }).unwrap();

        if (onFileDeleteCallback) {
          onFileDeleteCallback(file);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    },
    [toggleOptionsMenu, deleteFile, onFileDeleteCallback],
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
