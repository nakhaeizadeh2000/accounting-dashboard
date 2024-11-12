'use client';

import dynamic from 'next/dynamic';
// import { Metadata } from 'next';
import { MdOutlineAlternateEmail } from 'react-icons/md';
// const EmailIcon = dynamic(
//   () => import('react-icons/md').then((mod) => mod.MdOutlineAlternateEmail),
//   { ssr: false },
// );
import UserSingleSelectWidget from './UserSingleSelectWidget';
// const UserSingleSelectWidget = dynamic(() => import('./UserSingleSelectWidget'));
import AnimatedInputElement from '@/components/modules/input-elements/AnimatedInputElement';
import { ItemType } from '@/components/modules/drop-downs/drop-down.type';
import { FileUpload } from '@/components/modules/upload-files/FileUpload';
import Image from 'next/image';
import { useDownloadFileUrlQuery, useUploadFileMutation } from '@/store/features/files/files.api';
import { FileUploads } from '@/components/modules/upload-files/FileUploads';
import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
// const AnimatedInputElement = dynamic(
//   () => import('@/components/Elements/widgets/input-elements/AnimatedInputElement'),
// );

// export const metadata: Metadata = {
//   title: 'Sales Admin',
// };

const Sales = () => {
  const [uploadFile, { isLoading, isError, data }] = useUploadFileMutation();
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const { data: dataa } = useDownloadFileUrlQuery({ bucket: 'test', filename: 'images.jpeg' });
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
    <div>
      <p className="font-sans">This will use font-sans</p>
      <p className="font-yekan font-light">This will use YekanBakh Light</p>
      <p className="font-yekan font-normal">This will use YekanBakh Regular</p>
      <p className="font-yekan font-bold">
        This will use YekanBakh Bold <strong>this is testing</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="flex w-full justify-center gap-2">
          <UserSingleSelectWidget
            options={{
              containerClass: 'w-5/6 sm:w-5/6',
              onChange: handleUserSelectedChange,
              value: [],
            }}
          />
          {/* <AnimatedDropDown
            options={{
              label: 'menu',
              containerClass: 'w-4/5',
              items: [
                { value: 'item1', label: '1 Item 1' },
                { value: 'item2', label: '1 Item 2' },
                { value: 'item3', label: '1 Item 3' },
              ],
              onChange: handleDropdownChange,
            }}
          /> */}
          {/* <AnimatedInputElementp
            options={{
              key: 'email',
              label: 'ایمیل',
              type: 'text',
              fieldError: [],
              // icon: { Icon: MdOutlineAlternateEmail },
            }}
          /> */}
        </div>
        <AnimatedInputElement
          options={{
            key: 'email',
            label: 'ایمیل',
            type: 'text',
            fieldError: [],
            // icon: { Icon: MdOutlineAlternateEmail },
          }}
        />
        <AnimatedInputElement
          options={{
            key: 'email',
            label: 'ایمیل',
            type: 'text',
            fieldError: [],
            // icon: { Icon: MdOutlineAlternateEmail },
          }}
        />
        {/* <FileUpload onFileChange={handleFileChange} /> */}
        <FileUploads isMulti={true} onFileChange={handleFilesChange} />
        <button type="submit">Submit</button>
      </form>
      {imagePath ? (
        <Image src={imagePath} width={500} height={500} alt="Picture of the author" unoptimized />
      ) : null}
      <Button onClick={handleDownloadFile} variant="contained">
        Contained
      </Button>
      <Image
        src="http://localhost/api/files/test.jpg"
        width={500}
        height={500}
        alt="Picture of the author"
        unoptimized
      />
    </div>
  );
};

export default Sales;
