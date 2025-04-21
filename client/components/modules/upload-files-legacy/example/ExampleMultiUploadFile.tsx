'use client';

import { useState } from 'react';
import MultiFileUpload from '../MultiFileUpload';
import { FileUploadInfo } from '@/store/features/files/progress-slice';

const ExampleMultiUploadFile = () => {
  const [uploadResults, setUploadResults] = useState<{
    completed: FileUploadInfo[];
    failed: FileUploadInfo[];
    cancelled: FileUploadInfo[];
  }>({
    completed: [],
    failed: [],
    cancelled: [],
  });

  const handleUploadComplete = (uploadedFiles: FileUploadInfo[]) => {
    console.log('Files uploaded successfully:', uploadedFiles);
    setUploadResults((prev) => ({
      ...prev,
      completed: uploadedFiles,
    }));
  };

  const handleAllUploadsComplete = (succeeded: FileUploadInfo[], failed: FileUploadInfo[]) => {
    console.log('All uploads completed. Succeeded:', succeeded.length, 'Failed:', failed.length);

    // Identify cancelled uploads by checking error messages
    const cancelledFiles = failed.filter(
      (file) =>
        file.errorMessage?.toLowerCase().includes('cancelled') ||
        file.errorMessage?.toLowerCase().includes('canceled'),
    );

    // Actual failures (not cancellations)
    const actualFailures = failed.filter(
      (file) =>
        !file.errorMessage?.toLowerCase().includes('cancelled') &&
        !file.errorMessage?.toLowerCase().includes('canceled'),
    );

    setUploadResults({
      completed: succeeded,
      failed: actualFailures,
      cancelled: cancelledFiles,
    });
  };

  const handleError = (error: any) => {
    console.error('Upload error:', error);
    // If this is a batch cancellation error, we don't need to do anything special
    // as the individual file callbacks will handle it
  };

  return (
    <div className="mx-auto mb-8 flex w-full max-w-6xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold">Multi-File Upload Example</h1>
      <p className="text-gray-600">
        This component allows multiple files to be uploaded at once. Try uploading several files to
        see how it works. Note that this example uses isolation, so files selected here won&apos;t
        appear in other upload components.
      </p>

      <MultiFileUpload
        id="example-multi-upload-1" // Unique ID for this component instance
        bucket="default"
        acceptedFileTypes="image/*,application/pdf,application/msword"
        maxSizeMB={10}
        onUploadComplete={handleUploadComplete}
        onAllUploadsComplete={handleAllUploadsComplete}
        onError={handleError}
      />

      {(uploadResults.completed.length > 0 ||
        uploadResults.failed.length > 0 ||
        uploadResults.cancelled.length > 0) && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Upload Summary</h2>

          {uploadResults.completed.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-green-600">
                Successfully Uploaded ({uploadResults.completed.length} files)
              </h3>
              <ul className="mt-2 list-disc pl-6">
                {uploadResults.completed.map((file) => (
                  <li key={file.id} className="text-gray-700">
                    {file.fileData.name} - {(file.fileData.size / 1024 / 1024).toFixed(2)} MB
                    {file.metadata?.thumbnailUrl && (
                      <span className="ml-2 text-blue-500">(Thumbnail generated)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {uploadResults.failed.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-medium text-red-600">
                Failed Uploads ({uploadResults.failed.length} files)
              </h3>
              <ul className="mt-2 list-disc pl-6">
                {uploadResults.failed.map((file) => (
                  <li key={file.id} className="text-gray-700">
                    {file.fileData.name} - {file.errorMessage}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {uploadResults.cancelled.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-yellow-600">
                Cancelled Uploads ({uploadResults.cancelled.length} files)
              </h3>
              <ul className="mt-2 list-disc pl-6">
                {uploadResults.cancelled.map((file) => (
                  <li key={file.id} className="text-gray-700">
                    {file.fileData.name} - Upload was cancelled
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExampleMultiUploadFile;
