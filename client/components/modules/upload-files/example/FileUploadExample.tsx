/**
 * Example component showing how to use the updated file upload system
 */
import React, { useState, useCallback } from 'react';
import SingleFileUpload from '@/components/modules/upload-files/SingleFileUpload';
import MultiFileUpload from '@/components/modules/upload-files/MultiFileUpload';
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(error.message || 'Failed to upload file');

    // Clear error message after 5 seconds
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  }, []);

  // Handle multiple files upload completion
  const handleMultiFileSuccess = useCallback(
    (uploadedFiles: any[]) => {
      console.log('Multiple files uploaded successfully:', uploadedFiles);
      setShowSuccessMessage(true);
      refetchFiles(); // Refresh the file list

      // Clear success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    },
    [refetchFiles],
  );

  // Handle direct file upload using the file upload hook
  const handleDirectUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      try {
        setErrorMessage(null);

        // For single file
        if (files.length === 1) {
          const result = await uploadFile(files[0], {
            generateThumbnail: true,
            skipThumbnailForLargeFiles: true,
          });
          handleSingleFileSuccess(result);
        }
        // For multiple files
        else {
          const filesArray = Array.from(files);
          const result = await uploadFiles(filesArray, {
            generateThumbnail: true,
          });
          handleMultiFileSuccess(result.files);
        }
      } catch (error: any) {
        handleSingleFileError(error);
      }
    },
    [
      uploadFile,
      uploadFiles,
      handleSingleFileSuccess,
      handleSingleFileError,
      handleMultiFileSuccess,
    ],
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

      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
          <p>File uploaded successfully!</p>
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
            // Notice we've removed the generateThumbnail prop that was causing issues
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
            onError={handleSingleFileError}
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

      {/* Advanced Features Section */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Advanced Features</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-medium">Thumbnail Generation</h3>
            <p className="mb-4 text-gray-700">
              The API automatically generates thumbnails for images and videos. You can control this
              feature with the following options:
            </p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>generateThumbnail: Enable/disable thumbnail generation</li>
              <li>skipThumbnailForLargeFiles: Skip thumbnails for large files</li>
              <li>largeSizeMB: Size threshold for skipping thumbnails</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">Batch Operations</h3>
            <p className="mb-4 text-gray-700">
              You can perform batch operations on files using these features:
            </p>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Upload multiple files at once</li>
              <li>Get batch download URLs</li>
              <li>Delete multiple files with confirmation</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-lg font-medium">Direct API Usage</h3>
          <p className="mb-3 text-gray-700">
            For more advanced scenarios, you can use our hooks directly in your components:
          </p>
          <pre className="rounded bg-gray-100 p-3 text-sm">
            {`// Upload a file directly
const { uploadFile } = useFileUpload('my-bucket');
const result = await uploadFile(myFile, { generateThumbnail: true });

// Get file metadata
const { metadata } = useFileMetadata('my-bucket', 'filename.jpg');

// List files in a bucket
const { files } = useFilesList('my-bucket', { prefix: 'images/' });`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FileUploadExample;
