// app/article/main/list/page.tsx
import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import the component with no SSR to avoid hydration issues with client data fetching
const EnhancedArticleList = dynamic(() => import('../../components/EnhancedArticleListComponent'), {
  ssr: false,
  loading: () => <div className="p-6 text-center">در حال بارگذاری لیست مقالات...</div>,
});

// Export metadata for this page
export const metadata: Metadata = {
  title: 'لیست مقالات',
  description: 'مشاهده و مدیریت لیست مقالات',
};

const ArticleListPage = () => {
  return <EnhancedArticleList />;
};

export default ArticleListPage;
