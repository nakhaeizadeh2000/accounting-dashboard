import FullExampleUsage from '@/components/modules/upload-files/example/FullExampleUsage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SalsetDatees Admin',
};

const Sales = () => {
  return (
    <>
      {/* <MultiFileUpload id="1" /> */}
      {/* <MultiFileUploadExample /> */}
      {/* <AdvancedUploadFileForm id="1" /> */}
      <FullExampleUsage />
    </>
  );
};

export default Sales;
