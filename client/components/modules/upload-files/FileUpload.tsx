'use client';
import { useState } from 'react';

export const FileUpload = () => {
  const [file, setFile] = useState<string>();
  const [fileEnter, setFileEnter] = useState(false);
  return (
    <div className="container mx-auto max-w-5xl px-4">
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setFileEnter(true);
          }}
          onDragLeave={(e) => {
            setFileEnter(false);
          }}
          onDragEnd={(e) => {
            e.preventDefault();
            setFileEnter(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setFileEnter(false);
            if (e.dataTransfer.items) {
              [...e.dataTransfer.items].forEach((item, i) => {
                if (item.kind === 'file') {
                  const file = item.getAsFile();
                  if (file) {
                    const blobUrl = URL.createObjectURL(file);
                    setFile(blobUrl);
                  }
                  console.log(`items file[${i}].name = ${file?.name}`);
                }
              });
            } else {
              [...e.dataTransfer.files].forEach((file, i) => {
                console.log(`… file[${i}].name = ${file.name}`);
              });
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
              console.log(e.target.files);
              const files = e.target.files;
              if (files && files[0]) {
                const blobUrl = URL.createObjectURL(files[0]);
                setFile(blobUrl);
              }
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <object
            className="h-72 w-full max-w-xs rounded-md"
            data={file}
            type="image/png" //need to be updated based on type of file
          />
          <button
            onClick={() => setFile('')}
            className="mt-10 rounded bg-red-600 px-4 py-2 uppercase tracking-widest text-white outline-none"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};
