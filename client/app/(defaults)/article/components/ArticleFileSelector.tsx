// ArticleFileSelector.tsx
import React, { useState, useEffect } from 'react';
import { FileData } from '@/components/modules/files-manager/types';
import { Chip, Typography, Box, Alert } from '@mui/material';
import { FiX } from 'react-icons/fi';
import { MultiFileUpload } from '@/components/modules/upload-files';

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

  // Handle file upload success
  const handleUploadComplete = (uploadedFiles: any[]) => {
    // Extract IDs from uploaded files and add to selectedFileIds
    const newFileIds = uploadedFiles
      .map((file) => {
        // Extract ID from the file metadata or response
        const fileId = file.metadata?.id || file.response?.data?.files?.[0]?.id;
        const fileName = file.fileData?.name || file.metadata?.originalName;

        if (fileId) {
          // Add to selected files for display
          setSelectedFiles((prev) => [...prev, { id: fileId, name: fileName }]);
          return fileId;
        }
        return null;
      })
      .filter(Boolean);

    // Update parent component with new file IDs
    if (newFileIds.length > 0) {
      onSelectedFilesChange([...selectedFileIds, ...newFileIds]);
      setUploadSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  // Remove a selected file
  const handleRemoveFile = (fileId: string) => {
    onSelectedFilesChange(selectedFileIds.filter((id) => id !== fileId));
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // Load initial file data if IDs are provided
  useEffect(() => {
    // This would ideally fetch file metadata for existing IDs
    // For simplicity, we'll just update the display if we don't have the file names
    if (selectedFileIds.length > 0 && selectedFiles.length === 0) {
      // You could fetch file metadata here if needed
      // For now, just use IDs as names if we don't have the actual files
      const initialFiles = selectedFileIds.map((id) => ({
        id,
        name: `File ${id.substring(0, 8)}...`,
      }));
      setSelectedFiles(initialFiles);
    }
  }, [selectedFileIds, selectedFiles.length]);

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
          id="article-multi-upload"
          bucket="default"
          acceptedFileTypes="image/*,application/pdf,video/*,audio/*"
          maxSizeMB={100}
          onUploadComplete={handleUploadComplete}
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
