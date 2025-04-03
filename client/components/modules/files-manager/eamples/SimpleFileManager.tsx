'use client';

import React, { useState } from 'react';
import FileManager from '../FileManager';
import { FileData, FileTag } from '../types';

const SimpleFileManager: React.FC = () => {
  // You would typically get this data from your API
  const [availableTags] = useState<FileTag[]>([
    { id: '1', name: 'Important', color: 'red' },
    { id: '2', name: 'Work', color: 'blue' },
    { id: '3', name: 'Personal', color: 'green' },
    { id: '4', name: 'Archive', color: 'gray' },
  ]);

  // Example handlers for the file manager
  const handleFileSelect = (files: FileData[]) => {
    console.log('Selected files:', files);
  };

  const handleFileView = (file: FileData) => {
    console.log('Viewing file:', file);
    // In a real app, you would open a preview modal or redirect to a preview page
    window.open(file.url, '_blank');
  };

  const handleFileDownload = (file: FileData) => {
    console.log('Downloading file:', file);
    // In a real app, you would use your API to get the download URL
    // and trigger the download
  };

  const handleFileDelete = (file: FileData) => {
    console.log('Deleting file:', file);
    // In a real app, you would call your API to delete the file
  };

  const handleTagsUpdate = (file: FileData, tags: FileTag[]) => {
    console.log('Updating tags for file:', file, 'with tags:', tags);
    // In a real app, you would call your API to update the file's tags
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Simple File Manager</h1>

      <FileManager
        ownerId="simple-example"
        bucket="documents"
        title="My Documents"
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
        emptyText="No documents found. Upload some files to get started."
      />
    </div>
  );
};

export default SimpleFileManager;
