'use client';
import { useState } from 'react';

export type FileUploadsProps = {
  onFileChange: (files: File[] | null) => void; // Pass the array of files to the parent
  isMulti?: boolean; // Optional prop to indicate multi-file support
  // uploadFile: ({ bucket, file }: { bucket: string; file: File }) => Promise<void>; // Upload function to upload each file
};

export const FileUploads = ({ onFileChange, isMulti = false }: FileUploadsProps) => {
  const [files, setFiles] = useState<File[]>([]); // Store multiple files
  const [fileEnter, setFileEnter] = useState(false);

  // Handle file selection
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const selectedFilesArray = Array.from(selectedFiles); // Convert FileList to array
      if (isMulti) {
        setFiles(selectedFilesArray); // Set multiple files if isMulti is true
        onFileChange(selectedFilesArray); // Pass the array of files to the parent
      } else {
        const file = selectedFilesArray[0];
        setFiles([file]); // Only set one file if isMulti is false
        onFileChange([file]); // Pass a single file to the parent
      }
    }
  };

  // Handle file upload (for multiple files)
  // const handleFileUpload = async () => {
  //   if (files.length === 0) {
  //     alert('No files selected');
  //     return;
  //   }

  //   try {
  //     // Iterate over all selected files and upload each one
  //     for (const file of files) {
  //       console.log('Uploading file: ', file);
  //       await uploadFile({ bucket: 'test', file }); // Upload each file
  //     }
  //     alert('Files uploaded successfully');
  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //     alert('File upload failed');
  //   }
  // };

  return (
    <div className="container mx-auto max-w-5xl px-4">
      {files.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setFileEnter(true);
          }}
          onDragLeave={() => setFileEnter(false)}
          onDrop={(e) => {
            e.preventDefault();
            setFileEnter(false);
            const droppedFiles = e.dataTransfer.files;
            if (droppedFiles.length > 0) handleFileSelect(droppedFiles);
          }}
          className={`${
            fileEnter ? 'border-4' : 'border-2'
          } mx-auto flex h-72 w-full max-w-xs flex-col items-center justify-center border-dashed bg-white`}
        >
          <label htmlFor="file" className="flex h-full flex-col justify-center text-center">
            Click to upload or drag and drop
          </label>
          <input
            id="file"
            type="file"
            className="hidden"
            multiple={isMulti} // Allow multiple file selection if isMulti is true
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {files.map((file, index) => (
            <div key={index} className="flex flex-col items-center mb-4">
              <object
                className="h-72 w-full max-w-xs rounded-md"
                data={URL.createObjectURL(file)} // Display each selected file (for images, for example)
                type="image/png" // Adjust for different file types as needed
              />
              <span className="mt-2 text-sm text-gray-600">{file.name}</span>
            </div>
          ))}
          <button
            // onClick={handleFileUpload}
            className="mt-4 rounded bg-blue-600 px-4 py-2 uppercase tracking-widest text-white outline-none"
          >
            Upload Files
          </button>
          <button
            onClick={() => {
              setFiles([]);
              onFileChange(null); // Reset the files in parent as well
            }}
            className="mt-4 rounded bg-red-600 px-4 py-2 uppercase tracking-widest text-white outline-none"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};
