'use client';

import { useRef } from 'react';
import SingleFileUpload from '@/components/modules/upload-files/SingleFileUpload';
import useFileUpload from '../hook/useFileUpload';

type AdvancedUploadFileFormProps = {
  id: string; // Unique identifier for this upload component
  bucket?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  onUploadComplete?: (fileInfo: any) => void;
};

const AdvancedUploadFileForm = ({
  id,
  bucket = 'default',
  acceptedFileTypes = 'image/jpeg,image/png,application/pdf',
  maxSizeMB = 5,
  onUploadComplete,
}: AdvancedUploadFileFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const { selectedFile, uploadStatus, uploadProps, startUpload } = useFileUpload(bucket);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFile && uploadStatus === 'selected') {
      const result = await startUpload({
        bucket,
        onSuccess: (data) => {
          console.log('Upload successful!', data);
          if (onUploadComplete) {
            onUploadComplete(data);
          }
        },
        onError: (error) => {
          console.error('Upload failed:', error);
        },
      });

      if (result) {
        console.log('Form data with uploaded file can be processed now');
      }
    } else {
      console.log('No file selected or file already uploaded/uploading');
    }
  };

  return (
    <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
      <div className="rounded-lg bg-gray-100 p-4">
        <h2 className="mb-4 text-lg font-medium">Upload Document {id}</h2>
        <div data-upload-id={id}>
          <SingleFileUpload
            type="single"
            acceptedFileTypes={acceptedFileTypes}
            maxSizeMB={maxSizeMB}
            {...uploadProps}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!selectedFile || uploadStatus !== 'selected'}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default AdvancedUploadFileForm;
