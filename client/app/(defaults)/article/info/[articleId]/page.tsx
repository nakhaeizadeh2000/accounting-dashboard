import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import the Redux-based article detail component
const ArticleDetail = dynamic(() => import('../../components/ArticleDetailComponent'), {
  ssr: false,
  loading: () => <div className="p-6 text-center">در حال بارگذاری اطلاعات مقاله...</div>,
});

// Generate metadata for this page
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
