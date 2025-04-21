// app/article/info/[articleId]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import the component with no SSR to avoid hydration issues with client data fetching
const ArticleDetail = dynamic(() => import('../../components/ArticleDetailComponent'), {
  ssr: false,
  loading: () => <div className="p-6 text-center">در حال بارگذاری اطلاعات مقاله...</div>,
});

// Generate metadata for this page - this function is called during static generation
export async function generateMetadata({
  params,
}: {
  params: { articleId: string };
}): Promise<Metadata> {
  return {
    title: `مقاله شماره ${params.articleId}`,
    description: `جزئیات و اطلاعات مقاله شماره ${params.articleId}`,
  };
}

interface ArticleDetailPageProps {
  params: {
    articleId: string;
  };
}

const ArticleDetailPage = ({ params }: ArticleDetailPageProps) => {
  const articleId = parseInt(params.articleId, 10);

  return <ArticleDetail articleId={articleId} />;
};

export default ArticleDetailPage;
