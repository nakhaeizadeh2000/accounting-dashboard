'use client';

import React, { useState, useEffect } from 'react';
import { FileData } from '@/components/modules/files-manager/types';
import FileManager from '@/components/modules/files-manager/FileManager';
import { Tabs, Tab, Paper, Chip, Box, Typography, Button, IconButton } from '@mui/material';
import { FiFileText, FiUpload, FiX, FiPlus } from 'react-icons/fi';
import { MultiFileUpload, SingleFileUpload } from '@/components/modules/upload-files';

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
  const [tabValue, setTabValue] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [uploadCompleted, setUploadCompleted] = useState(false);

  // Update selected files when IDs change
  useEffect(() => {
    // This would be used when editing an article to show the already selected files
    // In a real implementation, you'd fetch file metadata for these IDs
    // For now, we'll just keep track of selected files from the FileManager
  }, [selectedFileIds]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle file selection from FileManager
  const handleFileSelect = (files: FileData[]) => {
    setSelectedFiles(files);
    onSelectedFilesChange(files.map((file) => file.id));
  };

  // Handle file upload success
  const handleUploadSuccess = (result: any) => {
    setUploadCompleted(true);

    // After a successful upload, we might want to switch to the file selector tab
    // to let the user select the newly uploaded file
    setTimeout(() => {
      setTabValue(0);
      setUploadCompleted(false);
    }, 1500);
  };

  // Remove a selected file
  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = selectedFiles.filter((file) => file.id !== fileId);
    setSelectedFiles(updatedFiles);
    onSelectedFilesChange(updatedFiles.map((file) => file.id));
  };

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

      <Paper className="overflow-hidden">
        {/* Tabs */}
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab icon={<FiFileText />} label="انتخاب فایل" />
          <Tab icon={<FiUpload />} label="آپلود فایل جدید" />
        </Tabs>

        {/* Tab panels */}
        <div className="px-4 pb-4 pt-2">
          {/* File selector tab */}
          <div role="tabpanel" hidden={tabValue !== 0}>
            {tabValue === 0 && (
              <div className="h-96">
                <FileManager
                  ownerId="article-file-selector"
                  bucket="default"
                  allowMultiSelect={true}
                  onFileSelect={handleFileSelect}
                  defaultView="grid"
                  maxHeight="350px"
                  title="انتخاب فایل‌ها"
                  emptyText="هیچ فایلی موجود نیست. لطفا به تب آپلود فایل بروید و فایل‌های خود را آپلود کنید."
                />
              </div>
            )}
          </div>

          {/* File upload tab */}
          <div role="tabpanel" hidden={tabValue !== 1}>
            {tabValue === 1 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Typography variant="subtitle2" className="mb-2">
                    آپلود تکی
                  </Typography>
                  <SingleFileUpload
                    id="article-single-upload"
                    bucket="default"
                    acceptedFileTypes="image/*,application/pdf,video/*,audio/*"
                    maxSizeMB={50}
                    onUploadSuccess={handleUploadSuccess}
                    uploadingDependsToForm={true}
                  />
                </div>

                <div>
                  <Typography variant="subtitle2" className="mb-2">
                    آپلود چندتایی
                  </Typography>
                  <MultiFileUpload
                    id="article-multi-upload"
                    bucket="default"
                    acceptedFileTypes="image/*,application/pdf,video/*,audio/*"
                    maxSizeMB={100}
                    onUploadComplete={handleUploadSuccess}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Paper>

      {/* Error display */}
      {errors && errors.length > 0 && (
        <div className="mt-2 text-sm text-red-600">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

      {/* Upload success message */}
      {uploadCompleted && (
        <div className="mt-3 rounded-md bg-green-50 p-3 text-green-700 dark:bg-green-900 dark:text-green-100">
          <p>فایل با موفقیت آپلود شد. می‌توانید به تب انتخاب فایل بروید و آن را انتخاب کنید.</p>
        </div>
      )}
    </div>
  );
};

export default ArticleFileSelector;
