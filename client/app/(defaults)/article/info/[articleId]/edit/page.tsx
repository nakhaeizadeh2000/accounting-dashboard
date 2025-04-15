// app/article/info/[articleId]/edit/page.tsx
'use client';

import React from 'react';
import { useGetArticleByIdQuery } from '@/store/features/article/article.api';
import ArticleFormComponent from '../../../components/ArticleFormComponent';
import ButtonLoading from '@/components/modules/loadings/ButtonLoading';
import { Alert, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

interface ArticleEditPageProps {
  params: {
    articleId: string;
  };
}

const ArticleEditPage = ({ params }: ArticleEditPageProps) => {
  const router = useRouter();
  const articleId = parseInt(params.articleId, 10);

  // Fetch article data
  const { data, isLoading, error } = useGetArticleByIdQuery({ id: articleId });

  // Handle navigation back to article list
  const handleBackToList = () => {
    router.push('/article/main/list');
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <ButtonLoading colorClassName="bg-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">در حال بارگذاری اطلاعات مقاله...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات مقاله
        </Alert>
        <Button variant="contained" color="primary" onClick={handleBackToList}>
          بازگشت به لیست مقالات
        </Button>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="p-6">
        <Alert severity="warning" className="mb-4">
          مقاله مورد نظر یافت نشد
        </Alert>
        <Button variant="contained" color="primary" onClick={handleBackToList}>
          بازگشت به لیست مقالات
        </Button>
      </div>
    );
  }

  return <ArticleFormComponent initialArticle={data.data} isEditMode={true} />;
};

export default ArticleEditPage;
