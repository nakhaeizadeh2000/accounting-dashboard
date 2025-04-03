import { Metadata } from 'next';

import ExampleMultiUploadFile from '@/components/modules/upload-files/example/ExampleMultiUploadFile';
import ExampleSingleUploadFile from '@/components/modules/upload-files/example/ExampleSingleUploadFile';
import SimpleFileManager from '@/components/modules/files-manager/eamples/SimpleFileManager';

export const metadata: Metadata = {
  title: 'SalsetDatees Admin',
};

const Sales = () => {
  return (
    <>
      {/* Single File Upload Example */}
      <ExampleSingleUploadFile />

      {/* Multi File Upload Example */}
      <ExampleMultiUploadFile />
      <SimpleFileManager />

      {/* Commented out test components */}
      {/* <TestForm /> */}
      {/* <ErfanTestForm /> */}
    </>
  );
};

export default Sales;
