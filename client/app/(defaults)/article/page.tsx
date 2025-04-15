// app/article/page.tsx
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

// Export metadata for this page
export const metadata: Metadata = {
  title: 'مدیریت مقالات',
  description: 'صفحه مدیریت مقالات',
};

// This component redirects from /article to /article/main/list
export default function ArticleRootPage() {
  redirect('/article/main/list');
}
