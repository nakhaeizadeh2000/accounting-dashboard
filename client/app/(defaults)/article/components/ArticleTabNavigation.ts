// app/article/ArticleTabNavigation.ts
import { btnNavigation } from '@/components/modules/tab-navigation/btn-navigation.model';
import { FiList, FiPlus } from 'react-icons/fi';
import { FiEdit3, FiInfo, FiArrowRight } from 'react-icons/fi';
import { ARTICLE_ROUTES } from '..';

// Tab navigation for the main article section
export const articleMainTabs: btnNavigation[] = [
  {
    label: 'لیست مقالات',
    link: ARTICLE_ROUTES.LIST,
    Icon: FiList,
  },
  {
    label: 'ایجاد مقاله',
    link: ARTICLE_ROUTES.CREATE,
    Icon: FiPlus,
  },
];

// Helper function to create tabs for an article with a specific ID
export const createArticleInfoTabs = (articleId: string | number): btnNavigation[] => [
  {
    label: 'بازگشت به لیست',
    link: ARTICLE_ROUTES.LIST,
    Icon: FiArrowRight,
  },
  {
    label: 'اطلاعات مقاله',
    link: ARTICLE_ROUTES.VIEW(articleId),
    Icon: FiInfo,
  },
  {
    label: 'ویرایش مقاله',
    link: ARTICLE_ROUTES.EDIT(articleId),
    Icon: FiEdit3,
  },
];
