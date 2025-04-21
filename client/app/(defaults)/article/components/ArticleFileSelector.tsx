import React, { useState, useEffect, useRef } from 'react';
import { Chip, Typography, Box, Alert } from '@mui/material';
import { FiX } from 'react-icons/fi';
import { FileUploadInfo, MultiFileUpload } from '@/components/modules/upload-files';

interface ArticleFileSelectorProps {
  selectedFileIds: string[];
  onSelectedFilesChange: (fileIds: string[]) => void;
  errors?: string[];
}

const ArticleFileSelector: React.FC<ArticleFileSelectorProps> = ({
  selectedFileIds,
  onSelectedFilesChange,
  errors,
}) => {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ id: string; name: string }[]>([]);
  const multiUploadRef = useRef<string>('article-multi-upload');
  const processedFilesRef = useRef<Set<string>>(new Set());

  // Handle file upload success
  const handleUploadComplete = (uploadedFiles: FileUploadInfo[]) => {
    console.log('Upload completed with files:', uploadedFiles);

    // Extract IDs from uploaded files - filter out files we've already processed
    const newFileIds = uploadedFiles
      .filter((file) => !processedFilesRef.current.has(file.id)) // Skip already processed files
      .map((file) => {
        // Extract ID from the file metadata or response
        const fileId = getFileId(file);
        const fileName = getFileName(file);

        if (fileId) {
          // Mark this file as processed to avoid duplicate processing
          processedFilesRef.current.add(file.id);
          return { id: fileId, name: fileName };
        }
        return null;
      })
      .filter(Boolean) as { id: string; name: string }[];

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
      const uniqueFilesMap = new Map<string, { id: string; name: string }>();

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
    console.log('All uploads complete:', succeeded);

    // Process all successfully uploaded files to get their IDs
    const newFileIds = succeeded
      .filter((file) => !processedFilesRef.current.has(file.id)) // Skip already processed files
      .map((file) => {
        const fileId = getFileId(file);
        const fileName = getFileName(file);

        if (fileId) {
          // Mark this file as processed
          processedFilesRef.current.add(file.id);
          return { id: fileId, name: fileName };
        }
        return null;
      })
      .filter(Boolean) as { id: string; name: string }[];

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
      const uniqueFilesMap = new Map<string, { id: string; name: string }>();

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
    return file.fileData?.name || file.metadata?.originalName || `Unknown file`;
  };

  // Remove a selected file
  const handleRemoveFile = (fileId: string) => {
    // Update parent component
    onSelectedFilesChange(selectedFileIds.filter((id) => id !== fileId));

    // Update local state
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Load initial file data if IDs are provided
  useEffect(() => {
    if (selectedFileIds.length > 0) {
      // Create a map of existing display files by ID for quick lookups
      const existingFilesMap = new Map(selectedFiles.map((file) => [file.id, file]));

      // Create a new display files array with all IDs
      const displayFiles = selectedFileIds.map((id) => {
        // If we already have display info for this file, use it
        if (existingFilesMap.has(id)) {
          return existingFilesMap.get(id)!;
        }

        // Otherwise create a placeholder
        return {
          id,
          name: `File ${id.substring(0, 8)}...`,
        };
      });

      // Only update state if the array has changed
      if (
        displayFiles.length !== selectedFiles.length ||
        !displayFiles.every((file, i) => file.id === selectedFiles[i]?.id)
      ) {
        setSelectedFiles(displayFiles);
      }
    } else if (selectedFiles.length > 0) {
      // If there are no selected IDs but we have display files, clear them
      setSelectedFiles([]);
    }
  }, [selectedFileIds]);

  // Generate a unique id for the MultiFileUpload component to avoid state sharing
  useEffect(() => {
    multiUploadRef.current = `article-multi-upload-${Math.random().toString(36).substring(2, 9)}`;
    // Reset processed files when component mounts
    processedFilesRef.current = new Set();
  }, []);

  return (
    <div className="w-full">
      <Typography variant="subtitle1" className="mb-2">
        فایل‌های پیوست
      </Typography>

      {/* Selected files display */}
      {selectedFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedFiles.map((file) => (
            <Chip
              key={file.id}
              label={file.name}
              onDelete={() => handleRemoveFile(file.id)}
              color="primary"
              size="small"
              deleteIcon={<FiX />}
            />
          ))}
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
    </div>
  );
};

export default ArticleFileSelector;
