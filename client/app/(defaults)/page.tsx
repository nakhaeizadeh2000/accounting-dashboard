import FileUploadExample from '@/components/modules/upload-files-new/examples/FileUploadExample';
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
      {/* <FullExampleUsage /> */}
      <FileUploadExample />
    </>
  );
};

export default Sales;
