'use client';

import React, { useState } from 'react';
import FileManager from '../FileManager';
import { FileData, FileTag } from '../types';
import SingleFileUpload from '@/components/modules/upload-files/SingleFileUpload';
import MultiFileUpload from '@/components/modules/upload-files/MultiFileUpload';
import { useFilesList, useBucketsList } from '@/store/features/files';

const SimpleFileManager: React.FC = () => {
  // Define available buckets and tags
  const [selectedBucket, setSelectedBucket] = useState('default');
  const [availableTags] = useState<FileTag[]>([
    { id: '1', name: 'Important', color: 'red' },
    { id: '2', name: 'Work', color: 'blue' },
    { id: '3', name: 'Personal', color: 'green' },
    { id: '4', name: 'Archive', color: 'gray' },
  ]);

  // Get buckets from API
  const { buckets, isLoading: bucketsLoading } = useBucketsList();

  // Example handlers for the file manager
  const handleFileSelect = (files: FileData[]) => {
    console.log('Selected files:', files);
  };

  const handleFileView = (file: FileData) => {
    console.log('Viewing file:', file);
    // The viewing is handled by the useFileActions hook
  };

  const handleFileDownload = (file: FileData) => {
    console.log('Downloading file:', file);
    // The download is handled by the useFileActions hook
  };

  const handleFileDelete = (file: FileData) => {
    console.log('Deleting file:', file);
    // The deletion is handled by the useFileActions hook
  };

  const handleTagsUpdate = (file: FileData, tags: FileTag[]) => {
    console.log('Updating tags for file:', file, 'with tags:', tags);
    // In a real app, you would call your API to update the file's tags
  };

  const handleBucketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBucket(e.target.value);
  };

  // Handle successful uploads
  const handleUploadSuccess = (result: any) => {
    console.log('Upload successful:', result);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">File Manager</h1>

      {/* Bucket selector */}
      <div className="mb-4">
        <label
          htmlFor="bucket-select"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Select Bucket:
        </label>
        <select
          id="bucket-select"
          value={selectedBucket}
          onChange={handleBucketChange}
          className="w-full max-w-xs rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="default">Default</option>
          {buckets &&
            buckets.map((bucket) => (
              <option key={bucket.name} value={bucket.name}>
                {bucket.name}
              </option>
            ))}
        </select>
      </div>

      {/* Upload components */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xl font-semibold">Single File Upload</h2>
          <SingleFileUpload
            id="simple-file-manager-single"
            bucket={selectedBucket}
            acceptedFileTypes="image/*,application/pdf,video/*"
            maxSizeMB={50}
            generateThumbnail={true}
            skipThumbnailForLargeFiles={true}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold">Multiple File Upload</h2>
          <MultiFileUpload
            id="simple-file-manager-multi"
            bucket={selectedBucket}
            acceptedFileTypes="image/*,application/pdf,video/*,audio/*"
            maxSizeMB={100}
            generateThumbnail={true}
            skipThumbnailForLargeFiles={true}
            onUploadComplete={handleUploadSuccess}
          />
        </div>
      </div>

      {/* File Manager */}
      <FileManager
        ownerId="simple-file-manager"
        bucket={selectedBucket}
        title="My Files"
        maxHeight="500px"
        allowMultiSelect={true}
        onFileSelect={handleFileSelect}
        onFileView={handleFileView}
        onFileDownload={handleFileDownload}
        onFileDelete={handleFileDelete}
        onTagsUpdate={handleTagsUpdate}
        defaultView="grid"
        itemsPerPage={20}
        availableTags={availableTags}
        emptyText="No files found. Upload some files to get started."
        showUploadingFiles={true}
        refreshInterval={30000} // Refresh every 30 seconds
      />
    </div>
  );
};

export default SimpleFileManager;
