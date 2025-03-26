'use client';

import UserSingleSelectWidget from '@/app/(defaults)/UserSingleSelectWidget';
import { useState } from 'react';
import FileUpload from '../FileUpload';

const SimpleUploadFileForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Form submission logic here
    console.log('Form submitted with file:', selectedFile);
    console.log('Upload result:', uploadResult);
  };

  const handleUserSelectedChange = (value: any) => {
    console.log('User selected:', value);
  };

  return (
    <div className="gap-2 rounded-lg bg-neutral-300 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex w-full flex-col justify-center gap-4">
          <UserSingleSelectWidget
            options={{
              containerClass: 'w-5/6 sm:w-5/6',
              onChange: handleUserSelectedChange,
              value: [],
            }}
          />

          <FileUpload
            id="1"
            bucket="test"
            acceptedFileTypes="image/jpeg,image/png,application/pdf"
            maxSizeMB={5}
            onFileSelect={setSelectedFile}
            onUploadSuccess={setUploadResult}
            onUploadError={(error) => console.error('Upload error:', error)}
          />
          <FileUpload
            id="2"
            bucket="test"
            acceptedFileTypes="image/jpeg,image/png,application/pdf"
            maxSizeMB={5}
            onFileSelect={setSelectedFile}
            onUploadSuccess={setUploadResult}
            onUploadError={(error) => console.error('Upload error:', error)}
          />
        </div>
        <button
          type="submit"
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default SimpleUploadFileForm;
