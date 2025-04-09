import { Metadata } from 'next';

import SimpleFileManager from '@/components/modules/files-manager/eamples/SimpleFileManager';
import { ExampleMultiUploadFile, ExampleSingleUploadFile } from '@/components/modules/upload-files';

export const metadata: Metadata = {
  title: 'SalsetDatees Admin',
};

const Sales = () => {
  return (
    <>
      <ExampleSingleUploadFile />
      <ExampleMultiUploadFile />
      <SimpleFileManager />
    </>
  );
};

export default Sales;
