'use client';

import React from 'react';
import { Alert, Backdrop, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import ArticleFormComponent from './ArticleFormComponent';

const ArticleCreateComponent: React.FC = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Handle global errors in rendering
  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    console.error(errorMsg);
  };

  // Handle redirection back to list
  const handleGoBack = () => {
    setIsRedirecting(true);
    router.push('/article/main/list');
  };

  // Use error boundary in case of component errors
  React.useEffect(() => {
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
      handleError('خطایی در بارگذاری فرم رخ داده است. لطفاً صفحه را مجدداً بارگذاری کنید.');
    });
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <button
          onClick={handleGoBack}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          بازگشت به لیست مقالات
        </button>
      </div>
    );
  }

  return (
    <>
      <ArticleFormComponent isEditMode={false} />

      {/* Loading overlay when redirecting */}
      <Backdrop
        open={isRedirecting}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default ArticleCreateComponent;
