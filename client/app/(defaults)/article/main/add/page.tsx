// app/article/main/add/page.tsx
import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import the component with no SSR to avoid hydration issues with client data fetching
const ArticleForm = dynamic(() => import('../../components/ArticleFormComponent'), {
  ssr: false,
  loading: () => <div className="p-6 text-center">در حال بارگذاری فرم ایجاد مقاله...</div>,
});

// Export metadata for this page
export const metadata: Metadata = {
  title: 'ایجاد مقاله جدید',
  description: 'فرم ایجاد مقاله جدید',
};

const ArticleAddPage = () => {
  return <ArticleForm isEditMode={false} />;
};

export default ArticleAddPage;
