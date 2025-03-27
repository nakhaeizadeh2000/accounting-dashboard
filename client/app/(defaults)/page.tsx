import MultiFileUpload from '@/components/modules/upload-files/MultiFileUpload';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SalsetDatees Admin',
};

const Sales = () => {
  return (
    <>
      <MultiFileUpload id="1" />
    </>
  );
};

export default Sales;
