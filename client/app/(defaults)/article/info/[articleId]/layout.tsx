// app/article/info/[articleId]/layout.tsx
'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import BtnNavigationComponent from '@/components/modules/tab-navigation/BtnNavigationComponent';
import { usePathname, useParams } from 'next/navigation';
import { createArticleInfoTabs } from '../../components/ArticleTabNavigation';

interface ArticleInfoLayoutProps {
  children: ReactNode;
}

const ArticleInfoLayout = ({ children }: ArticleInfoLayoutProps) => {
  const pathname = usePathname();
  const params = useParams<{ articleId: string }>();
  const [currentTab, setCurrentTab] = useState<number | undefined>();

  // Generate tabs for this specific article
  const articleInfoTabs = createArticleInfoTabs(params.articleId);

  // Find the active tab based on the current path
  useEffect(() => {
    articleInfoTabs.forEach((item, index) => {
      // We need to check for partial matches since edit route has additional path segments
      if (pathname === item.link || (pathname.includes('/edit') && item.link.includes('/edit'))) {
        setCurrentTab(index);
      }
    });
  }, [pathname, articleInfoTabs]);

  return (
    <BtnNavigationComponent currentTab={currentTab} btn={articleInfoTabs}>
      {children}
    </BtnNavigationComponent>
  );
};

export default ArticleInfoLayout;
