import React, { useState, useEffect, useRef } from 'react';
import { Chip, Typography, Box, Alert, Card, CardContent, Button } from '@mui/material';
import {
  FiX,
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiFileText,
  FiDownload,
  FiPaperclip,
} from 'react-icons/fi';
import { FileUploadInfo, MultiFileUpload } from '@/components/modules/upload-files';
import Image from 'next/image';

// Define file metadata type
interface FileMetadata {
  id: string;
  url?: string;
  thumbnailUrl?: string;
  originalName?: string;
  uniqueName?: string;
  size?: number;
  mimetype?: string;
}

// Define selected file type with optional metadata
interface SelectedFile {
  id: string;
  name: string;
  metadata?: FileMetadata;
}

interface ArticleFileSelectorProps {
  selectedFileIds: string[];
  onSelectedFilesChange: (fileIds: string[]) => void;
  errors?: string[];
  isEditMode?: boolean;
  existingFiles?: FileMetadata[];
}

const ArticleFileSelector: React.FC<ArticleFileSelectorProps> = ({
  selectedFileIds,
  onSelectedFilesChange,
  errors,
  isEditMode = false,
  existingFiles = [],
}) => {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const multiUploadRef = useRef<string>(
    `article-multi-upload-${Math.random().toString(36).substring(2, 9)}`,
  );
  const processedFilesRef = useRef<Set<string>>(new Set());

  // Handle file upload success
  const handleUploadComplete = (uploadedFiles: FileUploadInfo[]) => {
    // Extract IDs from uploaded files - filter out files we've already processed
    const newFileIds = uploadedFiles
      .filter((file) => !processedFilesRef.current.has(file.id))
      .map((file) => {
        // Extract ID from the file metadata or response
        const fileId = getFileId(file);
        const fileName = getFileName(file);

        if (fileId) {
          // Mark this file as processed to avoid duplicate processing
          processedFilesRef.current.add(file.id);
          const metadata = file.response?.data?.files?.[0] || file.metadata;
          return {
            id: fileId,
            name: fileName,
            metadata: metadata,
          } as SelectedFile;
        }
        return null;
      })
      .filter(Boolean) as SelectedFile[];

    if (newFileIds.length > 0) {
      // Create a Set to ensure uniqueness when adding to existing files
      const currentIds = new Set(selectedFileIds);

      // Add new IDs to the set
      newFileIds.forEach((file) => {
        currentIds.add(file.id);
      });

      // Convert set back to array
      const updatedIds = Array.from(currentIds);

      // Update parent component with complete list of file IDs
      onSelectedFilesChange(updatedIds);

      // Update the local state for display - create a new array with all existing files
      const uniqueFilesMap = new Map<string, SelectedFile>();

      // Add existing files to map
      selectedFiles.forEach((file) => {
        uniqueFilesMap.set(file.id, file);
      });

      // Add new files to map
      newFileIds.forEach((file) => {
        uniqueFilesMap.set(file.id, file);
      });

      // Convert map values back to array
      setSelectedFiles(Array.from(uniqueFilesMap.values()));
      setUploadSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  // Handle all uploads complete
  const handleAllUploadsComplete = (succeeded: FileUploadInfo[], failed: FileUploadInfo[]) => {
    // Process all successfully uploaded files to get their IDs
    const newFileIds = succeeded
      .filter((file) => !processedFilesRef.current.has(file.id))
      .map((file) => {
        const fileId = getFileId(file);
        const fileName = getFileName(file);

        if (fileId) {
          // Mark this file as processed
          processedFilesRef.current.add(file.id);
          const metadata = file.response?.data?.files?.[0] || file.metadata;
          return {
            id: fileId,
            name: fileName,
            metadata: metadata,
          } as SelectedFile;
        }
        return null;
      })
      .filter(Boolean) as SelectedFile[];

    if (newFileIds.length > 0) {
      // Create a new set with current + new IDs
      const currentIds = new Set(selectedFileIds);

      // Add new IDs to the set
      newFileIds.forEach((file) => {
        currentIds.add(file.id);
      });

      // Update parent with complete list
      onSelectedFilesChange(Array.from(currentIds));

      // Update the display files using a Map to ensure uniqueness
      const uniqueFilesMap = new Map<string, SelectedFile>();

      // Add existing files to map
      selectedFiles.forEach((file) => {
        uniqueFilesMap.set(file.id, file);
      });

      // Add new files to map
      newFileIds.forEach((file) => {
        uniqueFilesMap.set(file.id, file);
      });

      // Convert map back to array
      setSelectedFiles(Array.from(uniqueFilesMap.values()));
    }
  };

  // Helper function to extract file ID consistently
  const getFileId = (file: FileUploadInfo): string | null => {
    // First try metadata
    if (file.metadata?.id) return file.metadata.id;

    // Try response data.files array
    if (file.response?.data?.files && file.response.data.files.length > 0) {
      const fileData = file.response.data.files[0];
      if (fileData.id) return fileData.id;
    }

    // Try using uniqueName from metadata
    if (file.metadata?.uniqueName) {
      return file.metadata.uniqueName;
    }

    return null;
  };

  // Helper function to extract file name consistently
  const getFileName = (file: FileUploadInfo): string => {
    return file.fileData?.name || file.metadata?.originalName || 'Unknown file';
  };

  // Remove a selected file
  const handleRemoveFile = (fileId: string) => {
    // Update parent component
    onSelectedFilesChange(selectedFileIds.filter((id) => id !== fileId));

    // Update local state
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Function to get a file type icon based on mimetype
  const getFileIcon = (mimetype: string | undefined) => {
    if (!mimetype) return <FiFile className="h-6 w-6 text-gray-500" />;

    if (mimetype.startsWith('image/')) return <FiImage className="h-6 w-6 text-blue-500" />;
    if (mimetype.startsWith('video/')) return <FiVideo className="h-6 w-6 text-red-500" />;
    if (mimetype.startsWith('audio/')) return <FiMusic className="h-6 w-6 text-purple-500" />;
    if (mimetype.includes('pdf')) return <FiFileText className="h-6 w-6 text-orange-500" />;

    return <FiFile className="h-6 w-6 text-gray-500" />;
  };

  // Format file size for display
  const formatFileSize = (sizeInBytes: number | undefined) => {
    if (!sizeInBytes) return 'Unknown size';

    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Load existing files info from passed fileIds on mount
  useEffect(() => {
    setIsLoadingFiles(true);

    try {
      // Initialize files from existing files prop in edit mode
      if (isEditMode && existingFiles && existingFiles.length > 0) {
        const filesToAdd = existingFiles
          .filter((file) => selectedFileIds.includes(file.id))
          .map((file) => ({
            id: file.id,
            name: file.originalName || file.uniqueName || `File ${file.id.substring(0, 8)}...`,
            metadata: file,
          }));

        setSelectedFiles(filesToAdd);
      } else if (selectedFileIds.length > 0) {
        // Create placeholders for IDs without metadata
        const displayFiles = selectedFileIds.map((id) => ({
          id,
          name: `File ${id.substring(0, 8)}...`,
        }));

        setSelectedFiles(displayFiles);
      }
    } catch (error) {
      console.error('Error loading file data:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  // Update selected files when selectedFileIds changes
  useEffect(() => {
    // This effect handles updates to the selectedFileIds from outside this component
    if (!isLoadingFiles) {
      // Get existing file IDs to check what needs to be added/removed
      const existingIds = new Set(selectedFiles.map((file) => file.id));
      const currentIds = new Set(selectedFileIds);

      // Check if there are any changes
      let hasChanges = false;

      // Files to be added (in selectedFileIds but not in existingIds)
      const filesToAdd: SelectedFile[] = [];

      selectedFileIds.forEach((id) => {
        if (!existingIds.has(id)) {
          hasChanges = true;

          // Find in existingFiles or create a placeholder
          const existingFile = existingFiles.find((file) => file.id === id);

          if (existingFile) {
            filesToAdd.push({
              id,
              name:
                existingFile.originalName ||
                existingFile.uniqueName ||
                `File ${id.substring(0, 8)}...`,
              metadata: existingFile,
            });
          } else {
            filesToAdd.push({
              id,
              name: `File ${id.substring(0, 8)}...`,
            });
          }
        }
      });

      // Files to be removed (in existingIds but not in currentIds)
      const newFiles = selectedFiles.filter((file) => currentIds.has(file.id));

      if (filesToAdd.length > 0 || newFiles.length !== selectedFiles.length) {
        setSelectedFiles([...newFiles, ...filesToAdd]);
      }
    }
  }, [selectedFileIds, existingFiles, isLoadingFiles]);

  // Generate a unique id for the MultiFileUpload component to avoid state sharing
  useEffect(() => {
    multiUploadRef.current = `article-multi-upload-${Math.random().toString(36).substring(2, 9)}`;
    // Reset processed files when component mounts
    processedFilesRef.current = new Set();
  }, []);

  return (
    <div className="w-full">
      <Typography variant="subtitle1" className="mb-4 flex items-center">
        <FiPaperclip className="mr-2" />
        فایل‌های پیوست
        <span className="mr-2 text-sm text-gray-500">(اختیاری)</span>
      </Typography>

      {isLoadingFiles ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <span className="ml-2">در حال بارگذاری اطلاعات فایل‌ها...</span>
        </div>
      ) : (
        <>
          {/* Display existing files */}
          {selectedFiles.length > 0 && (
            <div className="mb-6">
              <Typography variant="subtitle2" className="mb-2">
                فایل‌های انتخاب شده ({selectedFiles.length})
              </Typography>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {selectedFiles.map((file) => {
                  const metadata = file.metadata;
                  const hasThumbnail =
                    metadata?.thumbnailUrl && metadata.mimetype?.startsWith('image/');

                  return (
                    <Card key={file.id} variant="outlined" className="overflow-hidden">
                      {/* File preview */}
                      <div className="h-32 bg-gray-100 dark:bg-gray-800">
                        {hasThumbnail ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={metadata.thumbnailUrl!}
                              alt={file.name}
                              width={150}
                              height={150}
                              className="h-full w-full object-contain"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            {getFileIcon(metadata?.mimetype)}
                          </div>
                        )}
                      </div>

                      <CardContent className="px-3 py-2">
                        <Typography variant="body2" className="truncate font-medium">
                          {file.name}
                        </Typography>

                        {metadata?.size && (
                          <Typography variant="caption" className="text-gray-500">
                            {formatFileSize(metadata.size)}
                          </Typography>
                        )}

                        <div className="mt-1 flex justify-between">
                          {metadata?.url && (
                            <Button
                              size="small"
                              startIcon={<FiDownload size={14} />}
                              href={metadata.url}
                              target="_blank"
                              className="text-xs"
                            >
                              دانلود
                            </Button>
                          )}

                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFile(file.id)}
                            className="text-xs"
                            startIcon={<FiX size={14} />}
                          >
                            حذف
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Success message */}
          {uploadSuccess && (
            <Alert severity="success" className="mb-3">
              فایل با موفقیت آپلود و به مقاله اضافه شد
            </Alert>
          )}

          {/* Upload component */}
          <Box className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <Typography variant="subtitle2" className="mb-3">
              افزودن فایل جدید
            </Typography>

            <MultiFileUpload
              id={multiUploadRef.current}
              bucket="default"
              acceptedFileTypes="image/*,application/pdf,video/*,audio/*"
              maxSizeMB={100}
              onUploadComplete={handleUploadComplete}
              onAllUploadsComplete={handleAllUploadsComplete}
            />
          </Box>

          {/* Error display */}
          {errors && errors.length > 0 && (
            <div className="mt-2 text-sm text-red-600">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArticleFileSelector;
