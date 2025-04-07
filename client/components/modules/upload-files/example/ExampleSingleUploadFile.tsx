import { useState } from 'react';
import SingleFileUpload from '@/components/modules/upload-files/SingleFileUpload';

const ExampleSingleFileUpload = () => {
  const [uploadResults, setUploadResults] = useState<Record<string, any>>({});
  const [selectedFileNames, setSelectedFileNames] = useState<Record<string, string | null>>({});
  const [uploadStatus, setUploadStatus] = useState<
    Record<string, 'success' | 'error' | 'cancelled' | null>
  >({});

  // Handlers for first uploader
  const handleUploadSuccess1 = (result: any) => {
    console.log('File 1 uploaded successfully:', result);
    setUploadResults((prev) => ({ ...prev, upload1: result }));
    setUploadStatus((prev) => ({ ...prev, upload1: 'success' }));
  };

  const handleUploadError1 = (error: any) => {
    console.error('Upload 1 error:', error);
    // Check if this was a cancellation
    const isCancelled =
      error?.message?.includes('cancelled') ||
      error?.status === 'cancelled' ||
      error?.status === 499;

    if (isCancelled) {
      setUploadStatus((prev) => ({ ...prev, upload1: 'cancelled' }));
    } else {
      setUploadStatus((prev) => ({ ...prev, upload1: 'error' }));
    }

    // Clear results on error or cancellation
    setUploadResults((prev) => ({ ...prev, upload1: null }));
  };

  const handleFileSelect1 = (file: File | null) => {
    setSelectedFileNames((prev) => ({ ...prev, upload1: file ? file.name : null }));
    // Reset result and status when new file is selected
    if (file) {
      setUploadResults((prev) => ({ ...prev, upload1: null }));
      setUploadStatus((prev) => ({ ...prev, upload1: null }));
    }
  };

  // Handlers for second uploader
  const handleUploadSuccess2 = (result: any) => {
    console.log('File 2 uploaded successfully:', result);
    setUploadResults((prev) => ({ ...prev, upload2: result }));
    setUploadStatus((prev) => ({ ...prev, upload2: 'success' }));
  };

  const handleUploadError2 = (error: any) => {
    console.error('Upload 2 error:', error);
    // Check if this was a cancellation
    const isCancelled =
      error?.message?.includes('cancelled') ||
      error?.status === 'cancelled' ||
      error?.status === 499;

    if (isCancelled) {
      setUploadStatus((prev) => ({ ...prev, upload2: 'cancelled' }));
    } else {
      setUploadStatus((prev) => ({ ...prev, upload2: 'error' }));
    }

    // Clear results on error or cancellation
    setUploadResults((prev) => ({ ...prev, upload2: null }));
  };

  const handleFileSelect2 = (file: File | null) => {
    setSelectedFileNames((prev) => ({ ...prev, upload2: file ? file.name : null }));
    // Reset result and status when new file is selected
    if (file) {
      setUploadResults((prev) => ({ ...prev, upload2: null }));
      setUploadStatus((prev) => ({ ...prev, upload2: null }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Single File Upload Examples</h1>
      <p className="text-gray-600">
        This example demonstrates isolated file uploaders. Each uploader functions independently.
        You can upload a file to either or both without affecting the other. Similarly, the single
        file uploaders won&apos;t affect the multi-file uploader below.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* First Uploader */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Uploader 1</h2>
          <SingleFileUpload
            id="single-upload-1" // Unique ID for isolation
            bucket="default"
            acceptedFileTypes="image/*,application/pdf,application/msword"
            maxSizeMB={10}
            uploadingDependsToForm={true} // Make sure this is true to show the start button
            onUploadSuccess={handleUploadSuccess1}
            onUploadError={handleUploadError1}
            onFileSelect={handleFileSelect1}
          />

          {/* Display upload results */}
          {uploadStatus.upload1 === 'success' && uploadResults.upload1 && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <h3 className="text-lg font-medium text-green-800">Upload 1 Successful</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>File: {selectedFileNames.upload1}</p>
                <p>URL: {uploadResults.upload1.url || 'N/A'}</p>
              </div>
            </div>
          )}

          {uploadStatus.upload1 === 'error' && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <h3 className="text-lg font-medium text-red-800">Upload 1 Failed</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>File: {selectedFileNames.upload1}</p>
                <p>Please try again.</p>
              </div>
            </div>
          )}

          {uploadStatus.upload1 === 'cancelled' && (
            <div className="mt-4 rounded-md bg-yellow-50 p-4">
              <h3 className="text-lg font-medium text-yellow-800">Upload 1 Cancelled</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>File: {selectedFileNames.upload1}</p>
                <p>The upload was cancelled.</p>
              </div>
            </div>
          )}
        </div>

        {/* Second Uploader */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Uploader 2</h2>
          <SingleFileUpload
            id="single-upload-2" // Unique ID for isolation
            bucket="default"
            acceptedFileTypes="video/*,audio/*,application/zip"
            maxSizeMB={20}
            uploadingDependsToForm={true}
            onUploadSuccess={handleUploadSuccess2}
            onUploadError={handleUploadError2}
            onFileSelect={handleFileSelect2}
          />

          {/* Display upload results */}
          {uploadStatus.upload2 === 'success' && uploadResults.upload2 && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <h3 className="text-lg font-medium text-green-800">Upload 2 Successful</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>File: {selectedFileNames.upload2}</p>
                <p>URL: {uploadResults.upload2.url || 'N/A'}</p>
              </div>
            </div>
          )}

          {uploadStatus.upload2 === 'error' && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <h3 className="text-lg font-medium text-red-800">Upload 2 Failed</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>File: {selectedFileNames.upload2}</p>
                <p>Please try again.</p>
              </div>
            </div>
          )}

          {uploadStatus.upload2 === 'cancelled' && (
            <div className="mt-4 rounded-md bg-yellow-50 p-4">
              <h3 className="text-lg font-medium text-yellow-800">Upload 2 Cancelled</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>File: {selectedFileNames.upload2}</p>
                <p>The upload was cancelled.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExampleSingleFileUpload;
