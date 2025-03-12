'use client';

import UserSingleSelectWidget from './UserSingleSelectWidget';
// const UserSingleSelectWidget = dynamic(() => import('./UserSingleSelectWidget'));
import { ItemType } from '@/components/modules/drop-downs/drop-down.type';
import Image from 'next/image';
import { useDownloadFileUrlQuery, useUploadFileMutation } from '@/store/features/files/files.api';
import { FileUploads } from '@/components/modules/upload-files/FileUploads';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import NewFileUploads from '@/components/modules/upload-files/NewFileUpload';

const TestForm = () => {
  const [uploadFile, { isLoading, isError, data }] = useUploadFileMutation();
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const { data: dataa } = useDownloadFileUrlQuery({ bucket: 'test', filename: 'logo01.jpeg' });
  const handleUserSelectedChange = (value: ItemType[]) => {
    // This function can be used for additional logic if needed
  };

  useEffect(() => {
    if (data) {
      setImagePath(dataa?.url);
    }
  }, [dataa]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // TODO: work on these sections
    // formData.append()
  };

  // const handleFileChange = async (selectedFile: File | null) => {
  //   console.log('file: ', selectedFile);

  //   try {
  //     await uploadFile({ bucket: 'test', file: selectedFile }).unwrap();
  //     alert('File uploaded successfully');
  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //     alert('File upload failed');
  //   }
  // };

  const handleFilesChange = async (selectedFile: File[] | null) => {
    console.log('file: ', selectedFile);

    if (Array.isArray(selectedFile)) {
      try {
        await uploadFile({ bucket: 'test', files: selectedFile }).unwrap();
        alert('File uploaded successfully');
      } catch (error) {
        console.error('Upload failed:', error);
        alert('File upload failed');
      }
    }
  };

  const handleDownloadFile = () => {
    setImagePath(dataa?.url);
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
          <NewFileUploads />
          {/* <FileUploads isMulti={true} onFileChange={handleFilesChange} /> */}
          {/* <Button onClick={handleDownloadFile} variant="contained">
            Contained
          </Button> */}
        </div>
        <button type="submit">Submit</button>
      </form>
      {imagePath ? (
        <Image src={imagePath} width={500} height={500} alt="Picture of the author" unoptimized />
      ) : null}
    </div>
  );
};

export default TestForm;
