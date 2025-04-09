'use client';

/**
 * Example component showing how to use the updated file upload system
 */
import React, { useState, useCallback } from 'react';
import SingleFileUpload from '@/components/modules/upload-files-legacy/SingleFileUpload';
import MultiFileUpload from '@/components/modules/upload-files-legacy/MultiFileUpload';
import {
  useFileUpload,
  useBatchFileUpload,
  downloadFile,
  useFilesList,
  useDeleteFile,
  previewThumbnail,
} from '@/store/features/files/file-operations';
import {
  formatFileSize,
  formatDate,
  shouldHaveThumbnail,
} from '@/store/features/files/file-helpers';
import { FileMetadata } from '@/store/features/files/progress-slice';
import Image from 'next/image';

const FileUploadExample: React.FC = () => {
  // State for file management
  const [selectedBucket, setSelectedBucket] = useState('default');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCancelledMessage, setShowCancelledMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});

  // Get files from the selected bucket
  const { files, isLoading: isLoadingFiles, refetch: refetchFiles } = useFilesList(selectedBucket);

  // Set up file upload hooks
  const { uploadFile } = useFileUpload(selectedBucket);
  const { uploadFiles } = useBatchFileUpload(selectedBucket);

  // Set up file delete hook
  const { deleteFile, isDeleting } = useDeleteFile();

  // Handle single file upload completion
  const handleSingleFileSuccess = useCallback(
    (result: any) => {
      console.log('File uploaded successfully:', result);
      setShowSuccessMessage(true);
      setShowCancelledMessage(false);
      setErrorMessage(null);
      refetchFiles(); // Refresh the file list

      // Clear success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    },
    [refetchFiles],
  );

  // Handle single file upload error
  const handleSingleFileError = useCallback((error: any) => {
    console.error('Upload error:', error);

    // Check if this was a cancellation
    const isCancelled =
      error?.message?.includes('cancelled') ||
      error?.status === 'cancelled' ||
      error?.status === 499;

    if (isCancelled) {
      setShowCancelledMessage(true);
      setShowSuccessMessage(false);
      setErrorMessage(null);

      // Clear cancellation message after 3 seconds
      setTimeout(() => {
        setShowCancelledMessage(false);
      }, 3000);
    } else {
      setErrorMessage(error.message || 'Failed to upload file');
      setShowSuccessMessage(false);
      setShowCancelledMessage(false);

      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  }, []);

  // Handle multiple files upload completion
  const handleMultiFileSuccess = useCallback(
    (uploadedFiles: any[]) => {
      console.log('Multiple files uploaded successfully:', uploadedFiles);
      setShowSuccessMessage(true);
      setShowCancelledMessage(false);
      setErrorMessage(null);
      refetchFiles(); // Refresh the file list

      // Clear success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    },
    [refetchFiles],
  );

  // Handle multiple files upload error
  const handleMultiFileError = useCallback((error: any) => {
    console.error('Multiple files upload error:', error);

    // Check if this was a cancellation
    const isCancelled =
      error?.message?.includes('cancelled') ||
      error?.status === 'cancelled' ||
      error?.status === 499;

    if (isCancelled) {
      setShowCancelledMessage(true);
      setShowSuccessMessage(false);
      setErrorMessage(null);

      // Clear cancellation message after 3 seconds
      setTimeout(() => {
        setShowCancelledMessage(false);
      }, 3000);
    } else {
      setErrorMessage(error.message || 'Failed to upload files');
      setShowSuccessMessage(false);
      setShowCancelledMessage(false);

      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  }, []);

  // Handle direct file upload using the file upload hook
  const handleDirectUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      try {
        setErrorMessage(null);
        setShowSuccessMessage(false);
        setShowCancelledMessage(false);

        // Save selected files for reference (helpful when displaying cancellation messages)
        const newSelectedFiles = { ...selectedFiles };
        for (let i = 0; i < files.length; i++) {
          newSelectedFiles[files[i].name] = files[i];
        }
        setSelectedFiles(newSelectedFiles);

        // For single file
        if (files.length === 1) {
          const result = await uploadFile(files[0]);
          handleSingleFileSuccess(result);
        }
        // For multiple files
        else {
          const filesArray = Array.from(files);
          const result = await uploadFiles(filesArray);
          handleMultiFileSuccess(result.files);
        }
      } catch (error: any) {
        // Check if this was a cancellation
        const isCancelled =
          error?.message?.includes('cancelled') ||
          error?.status === 'cancelled' ||
          error?.status === 499;

        if (isCancelled) {
          setShowCancelledMessage(true);
          setShowSuccessMessage(false);
          setErrorMessage(null);

          // Clear cancellation message after 3 seconds
          setTimeout(() => {
            setShowCancelledMessage(false);
          }, 3000);
        } else {
          setErrorMessage(error.message || 'Failed to upload files');
          setShowSuccessMessage(false);
          setShowCancelledMessage(false);
        }
      } finally {
        // Reset the input to allow uploading the same file again
        if (event.target) {
          event.target.value = '';
        }
      }
    },
    [uploadFile, uploadFiles, handleSingleFileSuccess, handleMultiFileSuccess, selectedFiles],
  );

  // Handle file deletion
  const handleDeleteFile = useCallback(
    async (file: FileMetadata) => {
      try {
        await deleteFile(file);
        refetchFiles(); // Refresh the file list after deletion
      } catch (error: any) {
        setErrorMessage(`Failed to delete file: ${error.message}`);

        // Clear error message after 5 seconds
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      }
    },
    [deleteFile, refetchFiles],
  );

  // Handle file download
  const handleDownloadFile = useCallback((file: FileMetadata) => {
    downloadFile(file);
  }, []);

  // Handle thumbnail preview
  const handlePreviewThumbnail = useCallback((file: FileMetadata) => {
    if (shouldHaveThumbnail(file)) {
      previewThumbnail(file);
    }
  }, []);

  // Function to change bucket
  const handleBucketChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBucket(e.target.value);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">File Upload Examples</h1>

      {/* Success/Error/Cancelled Messages */}
      {showSuccessMessage && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          <p>File uploaded successfully!</p>
        </div>
      )}

      {showCancelledMessage && (
        <div className="mb-4 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">
          <p>Upload was cancelled.</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Bucket Selection */}
      <div className="mb-6">
        <label className="mb-2 block">Select Bucket:</label>
        <select
          value={selectedBucket}
          onChange={handleBucketChange}
          className="w-64 rounded border border-gray-300 px-3 py-2"
        >
          <option value="default">Default</option>
          <option value="images">Images</option>
          <option value="documents">Documents</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Single File Upload */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Single File Upload</h2>
          <SingleFileUpload
            id="example-single-upload"
            bucket={selectedBucket}
            acceptedFileTypes="image/*,application/pdf,application/msword"
            maxSizeMB={50}
            uploadingDependsToForm={true}
            onUploadSuccess={handleSingleFileSuccess}
            onUploadError={handleSingleFileError}
          />
        </div>

        {/* Multiple File Upload */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Multiple File Upload</h2>
          <MultiFileUpload
            id="example-multi-upload"
            bucket={selectedBucket}
            acceptedFileTypes="image/*,application/pdf,video/*,audio/*"
            maxSizeMB={100}
            onUploadComplete={handleMultiFileSuccess}
            onError={handleMultiFileError}
          />
        </div>

        {/* Direct Upload Example */}
        <div className="rounded-lg bg-white p-6 shadow-md md:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Direct API Upload</h2>
          <p className="mb-4">
            Upload files directly using our API hooks without the UI components:
          </p>
          <input type="file" multiple onChange={handleDirectUpload} className="mb-6" />
          <p className="text-sm text-gray-600">
            This example demonstrates the use of our simplified file operation hooks for direct
            integration.
          </p>
        </div>
      </div>

      {/* Files List */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Files in {selectedBucket}</h2>

        {isLoadingFiles ? (
          <p>Loading files...</p>
        ) : files.length === 0 ? (
          <p>No files found in this bucket.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {files.map((file) => (
                  <tr key={file.uniqueName}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {file.thumbnailUrl ? (
                          <Image
                            src={file.thumbnailUrl}
                            alt={file.originalName}
                            className="mr-3 h-10 w-10 rounded object-cover"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded bg-gray-200 text-gray-500">
                            {file.mimetype.startsWith('image/') ? '📷' : '📄'}
                          </div>
                        )}
                        <div className="ml-1">
                          <div className="text-sm font-medium text-gray-900">
                            {file.originalName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {file.mimetype.split('/')[1]}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(file.uploadedAt)}
                    </td>
                    <td className="space-x-2 whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Download
                      </button>
                      {shouldHaveThumbnail(file) && (
                        <button
                          onClick={() => handlePreviewThumbnail(file)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Preview
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* API Information Section */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">File API Usage</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-medium">Uploading Files</h3>
            <p className="mb-4 text-gray-700">
              The file API now handles thumbnail generation automatically for image files. You no
              longer need to specify thumbnail generation options.
            </p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Images will automatically get thumbnails</li>
              <li>Direct file upload uses optimized streaming</li>
              <li>Progress tracking works the same as before</li>
              <li>Sequential uploads for multiple files is preserved</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">File Operations</h3>
            <p className="mb-4 text-gray-700">The API provides these common file operations:</p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Download files directly or via presigned URLs</li>
              <li>Preview thumbnails for image files</li>
              <li>Delete files with confirmation</li>
              <li>List files with metadata</li>
              <li>Filter and sort files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadExample;
