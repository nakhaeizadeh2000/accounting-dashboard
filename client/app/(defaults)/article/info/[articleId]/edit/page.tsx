// app/article/info/[articleId]/edit/page.tsx
import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import the ArticleEditFormComponent to reduce initial bundle size
const ArticleEditForm = dynamic(() => import('../../../components/ArticleEditFormComponent'), {
  ssr: false,
  loading: () => <div className="p-6 text-center">در حال بارگذاری فرم ویرایش مقاله...</div>,
});

// Generate metadata for this page
export async function generateMetadata({
  params,
}: {
  params: { articleId: string };
}): Promise<Metadata> {
  return {
    title: `ویرایش مقاله ${params.articleId}`,
    description: `فرم ویرایش اطلاعات و محتوای مقاله ${params.articleId}`,
  };
}

interface ArticleEditPageProps {
  params: {
    articleId: string;
  };
}

const ArticleEditPage = ({ params }: ArticleEditPageProps) => {
  const articleId = parseInt(params.articleId, 10);

  return <ArticleEditForm articleId={articleId} />;
};

export default ArticleEditPage;
