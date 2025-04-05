import BadgesComponents from '@/components/modules/badges/BadgesComponents';
import { Metadata } from 'next';

import ExampleMultiUploadFile from '@/components/modules/upload-files/example/ExampleMultiUploadFile';
import ExampleSingleUploadFile from '@/components/modules/upload-files/example/ExampleSingleUploadFile';

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

      {/* Commented out test components */}
      {/* <TestForm /> */}
      {/* <ErfanTestForm /> */}
    </>
  );
};

export default Sales;
