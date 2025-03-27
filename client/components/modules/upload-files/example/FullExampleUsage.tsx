'use client';

import { useState } from 'react';
import MultiFileUploadWrapper from '@/components/modules/upload-files/MultiFileUploadWrapper';
import SingleFileUpload from '@/components/modules/upload-files/SingleFileUpload';
import MultiFileUpload from '@/components/modules/upload-files/MultiFileUpload';
import { useMultiFileUpload, useSingleFileUpload } from '../hook/useFileUploadHook';
import FileUpload from '../FileUpload';

/**
 * Example component demonstrating various ways to use the file upload components
 */
const FullExampleUsage = () => {
  // State to track upload results
  const [singleFileResult, setSingleFileResult] = useState<any>(null);
  const [multipleFilesResults, setMultipleFilesResults] = useState<Record<string, any>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // ============ Example 1: Using the FileUpload component ============
  const handleSingleUploadSuccess = (result: any) => {
    console.log('Single file uploaded successfully:', result);
    setSingleFileResult(result);
  };

  const handleSingleUploadError = (error: any) => {
    console.error('Single file upload failed:', error);
  };

  const handleSingleFileSelect = (file: File | null) => {
    console.log('File selected:', file?.name);
  };

  // ============ Example 2: Using the MultiFileUploadWrapper component ============
  const handleMultiUploadSuccess = (fileId: string, result: any) => {
    console.log(`File ${fileId} uploaded successfully:`, result);
  };

  const handleMultiUploadError = (fileId: string, error: any) => {
    console.error(`File ${fileId} upload failed:`, error);
  };

  const handleMultiFilesSelect = (files: File[]) => {
    console.log(
      'Files selected:',
      files.map((f) => f.name),
    );
    setSelectedFiles(files);
  };

  const handleAllUploadsComplete = (results: Record<string, any>) => {
    console.log('All uploads completed:', results);
    setMultipleFilesResults(results);
  };

  // ============ Example 3: Using the hooks directly ============
  const singleUpload = useSingleFileUpload('default');
  const multiUpload = useMultiFileUpload('default');

  // Handle the form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload single file if selected
    if (singleUpload.file) {
      const result = await singleUpload.startUpload({
        onSuccess: (data) => {
          console.log('Hook-based single file upload successful:', data);
        },
        onError: (error) => {
          console.error('Hook-based single file upload failed:', error);
        },
      });
      console.log('Single upload result:', result);
    }

    // Upload all files in the multi-uploader
    if (Object.keys(multiUpload.files).length > 0) {
      const fileIds = await multiUpload.startUploadAll({
        onFileSuccess: (fileId, result) => {
          console.log(`Hook-based file ${fileId} upload successful:`, result);
        },
        onFileError: (fileId, error) => {
          console.error(`Hook-based file ${fileId} upload failed:`, error);
        },
        onAllComplete: (results) => {
          console.log('Hook-based all uploads complete:', results);
          setMultipleFilesResults((prev) => ({
            ...prev,
            ...results,
          }));
        },
      });
      console.log('Uploaded file IDs:', fileIds);
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
          onFileSelect={handleSingleFileSelect}
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

      {/* Example 2: MultiFileUploadWrapper component */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Example 2: Multiple File Upload</h2>
        <p className="mb-4 text-gray-600">Using the MultiFileUploadWrapper component</p>

        <MultiFileUploadWrapper
          id="example2"
          bucket="default"
          acceptedFileTypes="image/*,application/pdf"
          maxSizeMB={10}
          maxFiles={5}
          onUploadSuccess={handleMultiUploadSuccess}
          onUploadError={handleMultiUploadError}
          onFilesSelect={handleMultiFilesSelect}
          onAllUploadsComplete={handleAllUploadsComplete}
          uploadingDependsToForm={false}
        />

        {selectedFiles.length > 0 && (
          <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-3">
            <h3 className="mb-2 font-medium text-blue-800">Selected Files</h3>
            <ul className="list-disc pl-5">
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}

        {Object.keys(multipleFilesResults).length > 0 && (
          <div className="mt-4 rounded border border-green-200 bg-green-50 p-4">
            <h3 className="mb-2 font-medium text-green-800">All Uploads Complete</h3>
            <pre className="max-h-60 overflow-x-auto rounded bg-white p-3 text-sm">
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
              {...singleUpload.uploadProps}
              acceptedFileTypes="image/*,application/pdf"
              maxSizeMB={10}
              uploadingDependsToForm={true}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Multiple File Upload</h3>
            <MultiFileUpload
              id="multi-hook-example"
              {...multiUpload.uploadProps}
              acceptedFileTypes="image/*,application/pdf"
              maxSizeMB={10}
              maxFiles={5}
              uploadingDependsToForm={true}
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

      {/* Example 4: FileUpload in multiple mode */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Example 4: Unified Component</h2>
        <p className="mb-4 text-gray-600">Using the FileUpload component in multiple mode</p>

        <FileUpload
          id="example4"
          mode="multiple"
          bucket="default"
          acceptedFileTypes="image/*,application/pdf"
          maxSizeMB={10}
          maxFiles={5}
          onFileUploadSuccess={(fileId, result) => {
            console.log(`File ${fileId} uploaded:`, result);
          }}
          onAllUploadsComplete={(results) => {
            console.log('All uploads complete:', results);
            setMultipleFilesResults((prev) => ({
              ...prev,
              ...results,
            }));
          }}
          uploadingDependsToForm={false}
        />
      </div>
    </div>
  );
};

export default FullExampleUsage;
