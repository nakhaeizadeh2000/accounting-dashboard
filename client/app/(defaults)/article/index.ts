import { Route } from 'next';

// Define routes info for easy access
export const ARTICLE_ROUTES = {
  LIST: '/article/main/list' as Route,
  CREATE: '/article/main/add' as Route,
  VIEW: (id: number | string) => `/article/info/${id}` as Route,
  EDIT: (id: number | string) => `/article/info/${id}/edit` as Route,
};
