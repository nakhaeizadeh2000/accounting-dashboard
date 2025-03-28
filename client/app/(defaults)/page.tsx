import { Metadata } from 'next';

import ExampleMultiUploadFile from '@/components/modules/upload-files/example/ExampleMultiUploadFile';

export const metadata: Metadata = {
  title: 'SalsetDatees Admin',
};

const Sales = () => {
  return (
    <>
      <ExampleMultiUploadFile />
      {/* <TestForm /> */}
      {/* <ErfanTestForm /> */}
    </>
  );
};

export default Sales;
