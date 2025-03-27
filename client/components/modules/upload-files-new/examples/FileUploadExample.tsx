'use client';

import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import SingleFileUpload from '../components/SingleFileUpload';
import MultiFileUpload from '../components/MultiFileUpload';
import { useSingleFileUpload } from '../hooks/useSingleFileUpload';
import { useMultiFileUpload } from '../hooks/useMultiFileUpload';

/**
 * Example component demonstrating different ways to use the file upload components
 */
const FileUploadExample: React.FC = () => {
  // State to track upload results
  const [singleFileResult, setSingleFileResult] = useState<any>(null);
  const [multipleFilesResults, setMultipleFilesResults] = useState<Record<string, any>>({});

  // ============ Example 1: Using the FileUpload component in single mode ============
  const handleSingleUploadSuccess = (result: any) => {
    console.log('Single file uploaded successfully:', result);
    setSingleFileResult(result);
  };

  const handleSingleUploadError = (error: any) => {
    console.error('Single file upload failed:', error);
  };

  // ============ Example 2: Using the FileUpload component in multiple mode ============
  const handleMultiUploadSuccess = (fileId: string, result: any) => {
    console.log(`File ${fileId} uploaded successfully:`, result);
  };

  const handleMultiUploadError = (fileId: string, error: any) => {
    console.error(`File ${fileId} upload failed:`, error);
  };

  const handleAllUploadsComplete = (results: Record<string, any>) => {
    console.log('All uploads completed:', results);
    setMultipleFilesResults((prev) => ({ ...prev, ...results }));
  };

  // ============ Example 3: Using hooks directly ============
  // Single file upload with hook
  const singleUpload = useSingleFileUpload({
    acceptedFileTypes: 'image/*,application/pdf',
    maxSizeMB: 10,
    onUpload: async (file) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { success: true, filename: file.name, url: URL.createObjectURL(file) };
    },
  });

  // Multi file upload with hook
  const multiUpload = useMultiFileUpload({
    acceptedFileTypes: 'image/*,application/pdf',
    maxSizeMB: 10,
    maxFiles: 5,
    onUpload: async (file) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { success: true, filename: file.name, url: URL.createObjectURL(file) };
    },
  });

  // Handle form submission with hooks
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload single file if selected
    if (singleUpload.file) {
      const result = await singleUpload.startUpload();
      console.log('Single upload result:', result);
    }

    // Upload all files
    if (Object.keys(multiUpload.files).length > 0) {
      const results = await multiUpload.startAllUploads();
      console.log('Multiple upload results:', results);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 p-6">
      <h1 className="mb-4 text-2xl font-bold">File Upload Examples</h1>

      {/* Example 1: Basic FileUpload component in single mode */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Example 1: Single File Upload</h2>
        <p className="mb-4 text-gray-600">Using the FileUpload component in single mode</p>

        <FileUpload
          id="example1"
          mode="single"
          bucket="default"
          acceptedFileTypes="image/*,application/pdf"
          maxSizeMB={10}
          onUploadSuccess={handleSingleUploadSuccess}
          onUploadError={handleSingleUploadError}
          uploadingDependsToForm={false}
        />

        {singleFileResult && (
          <div className="mt-6 rounded border border-green-200 bg-green-50 p-4">
            <h3 className="mb-2 font-medium text-green-800">Upload Successful</h3>
            <pre className="overflow-x-auto rounded bg-white p-3 text-sm">
              {JSON.stringify(singleFileResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Example 2: FileUpload component in multiple mode */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Example 2: Multiple File Upload</h2>
        <p className="mb-4 text-gray-600">Using the FileUpload component in multiple mode</p>

        <FileUpload
          id="example2"
          mode="multiple"
          bucket="default"
          acceptedFileTypes="image/*,application/pdf"
          maxSizeMB={10}
          maxFiles={5}
          onFileUploadSuccess={handleMultiUploadSuccess}
          onFileUploadError={handleMultiUploadError}
          onAllUploadsComplete={handleAllUploadsComplete}
          uploadingDependsToForm={false}
        />

        {Object.keys(multipleFilesResults).length > 0 && (
          <div className="mt-6 rounded border border-green-200 bg-green-50 p-4">
            <h3 className="mb-2 font-medium text-green-800">Uploads Completed</h3>
            <pre className="overflow-x-auto rounded bg-white p-3 text-sm">
              {JSON.stringify(multipleFilesResults, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Example 3: Using hooks directly */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Example 3: Form Integration with Hooks</h2>
        <p className="mb-4 text-gray-600">
          Using the file upload hooks directly with form integration
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Single File Upload</h3>
            <SingleFileUpload
              acceptedFileTypes="image/*,application/pdf"
              maxSizeMB={10}
              uploadingDependsToForm={true}
              onFileSelect={singleUpload.selectFile}
              onFileReject={(err) => console.error(err)}
              status={singleUpload.status}
              progress={singleUpload.progress}
              errorMessage={singleUpload.error}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Multiple File Upload</h3>
            <MultiFileUpload
              acceptedFileTypes="image/*,application/pdf"
              maxSizeMB={10}
              maxFiles={5}
              uploadingDependsToForm={true}
              onFilesSelect={(files) => {
                // Convert the array of files to a format that can be passed to addFiles
                files.forEach((file) => {
                  // Create a FileList-like object with a single file
                  const fileList = Object.create(new DataTransfer().files, {
                    '0': { value: file, enumerable: true },
                    length: { value: 1, enumerable: true },
                  });

                  multiUpload.addFiles(fileList);
                });
              }}
              onFileReject={(err) => console.error(err)}
              overallStatus={multiUpload.overallStatus}
              fileProgress={Object.entries(multiUpload.files).reduce(
                (acc, [id, file]) => {
                  acc[id] = file.progress;
                  return acc;
                },
                {} as Record<string, number>,
              )}
              fileErrors={Object.entries(multiUpload.files).reduce(
                (acc, [id, file]) => {
                  if (file.error) acc[id] = file.error;
                  return acc;
                },
                {} as Record<string, string>,
              )}
              onUploadStart={multiUpload.startAllUploads}
              onUploadCancel={multiUpload.cancelUpload}
              onRemoveFile={multiUpload.removeFile}
              onRetryFile={multiUpload.retryFile}
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              disabled={!singleUpload.file && Object.keys(multiUpload.files).length === 0}
            >
              Submit Form with Files
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUploadExample;
