'use client';
import { useState } from 'react';

type FileUploadProps = {
  onFileChange: (file: File | null) => void;
};

export const FileUpload = ({ onFileChange }: FileUploadProps) => {
  const [file, setFile] = useState<string>();
  const [fileObject, setFileObject] = useState<File | null>(null); // Store the actual file
  const [fileEnter, setFileEnter] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    const blobUrl = URL.createObjectURL(selectedFile);
    setFile(blobUrl);
    setFileObject(selectedFile);
    onFileChange(selectedFile); // Pass the file to the parent component
  };

  return (
    <div className="container mx-auto max-w-5xl px-4">
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setFileEnter(true);
          }}
          onDragLeave={() => setFileEnter(false)}
          onDrop={(e) => {
            e.preventDefault();
            setFileEnter(false);
            if (e.dataTransfer.items) {
              const item = e.dataTransfer.items[0];
              if (item.kind === 'file') {
                const droppedFile = item.getAsFile();
                if (droppedFile) handleFileSelect(droppedFile);
              }
            }
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
            onChange={(e) => {
              const files = e.target.files;
              if (files && files[0]) handleFileSelect(files[0]);
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <object
            className="h-72 w-full max-w-xs rounded-md"
            data={file}
            type="image/png" // Adjust this for other file types as needed
          />
          <button
            onClick={() => {
              setFile('');
              setFileObject(null);
              onFileChange(null); // Reset the file in parent as well
            }}
            className="mt-10 rounded bg-red-600 px-4 py-2 uppercase tracking-widest text-white outline-none"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};
