// components/modules/file-manager/examples/AdvancedFileManager.tsx
import React, { useState, useEffect } from 'react';
import FileManager from '../FileManager';
import { FileData, FileTag } from '../types';
import { nanoid } from '@reduxjs/toolkit';

// Mock API service for the example
const mockApiService = {
  // Simulate fetching files with a delay
  getFiles: () => {
    return new Promise<FileData[]>((resolve) => {
      setTimeout(() => {
        resolve(mockFiles);
      }, 800);
    });
  },

  // Simulate deleting a file
  deleteFile: (fileId: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const index = mockFiles.findIndex((file) => file.id === fileId);
        if (index !== -1) {
          mockFiles.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  },

  // Simulate updating file tags
  updateFileTags: (fileId: string, tags: FileTag[]) => {
    return new Promise<FileData>((resolve) => {
      setTimeout(() => {
        const file = mockFiles.find((f) => f.id === fileId);
        if (file) {
          file.tags = [...tags];
          resolve(file);
        } else {
          throw new Error('File not found');
        }
      }, 500);
    });
  },
};

// Mock file data for the example
const mockFiles: FileData[] = [
  {
    id: nanoid(),
    name: 'annual_report_2023.pdf',
    bucket: 'documents',
    type: 'application/pdf',
    size: 2456789,
    uploadDate: new Date(2023, 3, 15),
    url: '#',
    tags: [
      { id: '1', name: 'Important', color: 'red' },
      { id: '2', name: 'Work', color: 'blue' },
    ],
  },
  {
    id: nanoid(),
    name: 'team_photo.jpg',
    bucket: 'images',
    type: 'image/jpeg',
    size: 1245678,
    uploadDate: new Date(2023, 4, 10),
    url: '#',
    thumbnailUrl: 'https://via.placeholder.com/200',
    tags: [{ id: '3', name: 'Personal', color: 'green' }],
  },
  {
    id: nanoid(),
    name: 'financial_data_Q1.xlsx',
    bucket: 'documents',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 3456789,
    uploadDate: new Date(2023, 4, 5),
    url: '#',
    tags: [
      { id: '2', name: 'Work', color: 'blue' },
      { id: '5', name: 'Finance', color: 'purple' },
    ],
  },
  {
    id: nanoid(),
    name: 'project_presentation.pptx',
    bucket: 'documents',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 5678912,
    uploadDate: new Date(2023, 3, 28),
    url: '#',
    tags: [
      { id: '2', name: 'Work', color: 'blue' },
      { id: '6', name: 'Project', color: 'yellow' },
    ],
  },
  {
    id: nanoid(),
    name: 'audio_recording.mp3',
    bucket: 'media',
    type: 'audio/mpeg',
    size: 7890123,
    uploadDate: new Date(2023, 2, 15),
    url: '#',
    tags: [{ id: '7', name: 'Media', color: 'indigo' }],
  },
  {
    id: nanoid(),
    name: 'source_code.zip',
    bucket: 'documents',
    type: 'application/zip',
    size: 12345678,
    uploadDate: new Date(2023, 5, 10),
    url: '#',
    tags: [{ id: '8', name: 'Development', color: 'teal' }],
  },
];

// All available tags for the example
const allAvailableTags: FileTag[] = [
  { id: '1', name: 'Important', color: 'red' },
  { id: '2', name: 'Work', color: 'blue' },
  { id: '3', name: 'Personal', color: 'green' },
  { id: '4', name: 'Archive', color: 'gray' },
  { id: '5', name: 'Finance', color: 'purple' },
  { id: '6', name: 'Project', color: 'yellow' },
  { id: '7', name: 'Media', color: 'indigo' },
  { id: '8', name: 'Development', color: 'teal' },
  { id: '9', name: 'Confidential', color: 'pink' },
  { id: '10', name: 'Draft', color: 'orange' },
];

const AdvancedFileManager: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTags] = useState<FileTag[]>(allAvailableTags);
  const [selectedView, setSelectedView] = useState<'all' | 'images' | 'documents' | 'media'>('all');

  // Fetch initial files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const fetchedFiles = await mockApiService.getFiles();
        setFiles(fetchedFiles);
        setError(null);
      } catch (err) {
        setError('Failed to fetch files. Please try again later.');
        console.error('Error fetching files:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  // Filter types based on selected view
  const getFilterTypes = () => {
    switch (selectedView) {
      case 'images':
        return ['image/'];
      case 'documents':
        return ['application/pdf', 'text/', 'application/vnd.openxmlformats'];
      case 'media':
        return ['audio/', 'video/'];
      default:
        return undefined;
    }
  };

  // Handlers for the file manager
  const handleFileSelect = (selectedFiles: FileData[]) => {
    console.log('Selected files:', selectedFiles);
  };

  const handleFileView = (file: FileData) => {
    console.log('Viewing file:', file);
    alert(`Viewing ${file.name}`);
  };

  const handleFileDownload = (file: FileData) => {
    console.log('Downloading file:', file);
    alert(`Downloading ${file.name}`);
  };

  const handleFileDelete = async (file: FileData) => {
    try {
      const success = await mockApiService.deleteFile(file.id);
      if (success) {
        setFiles(files.filter((f) => f.id !== file.id));
        console.log('File deleted:', file.name);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete the file. Please try again.');
    }
  };

  const handleTagsUpdate = async (file: FileData, tags: FileTag[]) => {
    try {
      const updatedFile = await mockApiService.updateFileTags(file.id, tags);
      setFiles(files.map((f) => (f.id === updatedFile.id ? { ...f, tags } : f)));
      console.log('Tags updated for file:', file.name);
    } catch (err) {
      console.error('Error updating tags:', err);
      alert('Failed to update tags. Please try again.');
    }
  };

  // View selector
  const ViewSelector = () => (
    <div className="mb-6 flex border-b border-gray-200">
      <button
        className={`border-b-2 px-4 py-2 ${selectedView === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
        onClick={() => setSelectedView('all')}
      >
        All Files
      </button>
      <button
        className={`border-b-2 px-4 py-2 ${selectedView === 'images' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
        onClick={() => setSelectedView('images')}
      >
        Images
      </button>
      <button
        className={`border-b-2 px-4 py-2 ${selectedView === 'documents' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
        onClick={() => setSelectedView('documents')}
      >
        Documents
      </button>
      <button
        className={`border-b-2 px-4 py-2 ${selectedView === 'media' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
        onClick={() => setSelectedView('media')}
      >
        Media
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">{error}</p>
        <button
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">Advanced File Manager</h1>

      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-medium">Filtering Options</h2>
        <ViewSelector />
      </div>

      <FileManager
        ownerId="advanced-example"
        bucket="documents"
        title={`${selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} Files`}
        maxHeight="600px"
        allowMultiSelect={true}
        onFileSelect={handleFileSelect}
        onFileView={handleFileView}
        onFileDownload={handleFileDownload}
        onFileDelete={handleFileDelete}
        onTagsUpdate={handleTagsUpdate}
        defaultView="grid"
        itemsPerPage={20}
        availableTags={availableTags}
        filterTypes={getFilterTypes()}
        emptyText={`No ${selectedView} files found.`}
        sortBy="date"
        sortDirection="desc"
      />

      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 text-lg font-medium">Debug Information</h2>
        <p className="text-sm text-gray-600">
          Selected view: <span className="rounded bg-gray-100 px-1 font-mono">{selectedView}</span>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Filter types:{' '}
          <span className="rounded bg-gray-100 px-1 font-mono">
            {getFilterTypes()?.join(', ') || 'none'}
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Total files: <span className="rounded bg-gray-100 px-1 font-mono">{files.length}</span>
        </p>
      </div>
    </div>
  );
};

export default AdvancedFileManager;
