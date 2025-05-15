// app/article/main/add/page.tsx
import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import the ArticleAddFormComponent to reduce initial bundle size
const ArticleAddForm = dynamic(() => import('../../components/ArticleAddFormComponent'), {
  ssr: false,
  loading: () => <div className="p-6 text-center">در حال بارگذاری فرم ایجاد مقاله...</div>,
});

// Export metadata for this page
export const metadata: Metadata = {
  title: 'ایجاد مقاله جدید',
  description: 'فرم ایجاد مقاله جدید در سیستم مدیریت محتوا',
};

const ArticleAddPage = () => {
  return <ArticleAddForm />;
};

export default ArticleAddPage;
