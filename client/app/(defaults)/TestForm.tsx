'use client';

import AdvancedUploadFileForm from '@/components/modules/upload-files/example/AdvancedUploadFileForm';
import SimpleUploadFileForm from '@/components/modules/upload-files/example/SimpleUploadFileForm';

const TestForm = () => {
  return (
    <>
      {/* <SimpleUploadFileForm /> */}
      <AdvancedUploadFileForm id="1" />
      {/* <AdvancedUploadFileForm id="2" /> */}
    </>
  );
};

export default TestForm;
