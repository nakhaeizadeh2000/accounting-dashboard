// app/article/main/layout.tsx
'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import BtnNavigationComponent from '@/components/modules/tab-navigation/BtnNavigationComponent';
import { usePathname } from 'next/navigation';
import { articleMainTabs } from '../components/ArticleTabNavigation';

interface ArticleMainLayoutProps {
  children: ReactNode;
}

const ArticleMainLayout = ({ children }: ArticleMainLayoutProps) => {
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState<number | undefined>();

  // Find the active tab based on the current path
  useEffect(() => {
    articleMainTabs.forEach((item, index) => {
      if (item.link === pathname) {
        setCurrentTab(index);
      }
    });
  }, [pathname]);

  return (
    <BtnNavigationComponent currentTab={currentTab} btn={articleMainTabs}>
      {children}
    </BtnNavigationComponent>
  );
};

export default ArticleMainLayout;
