// app/article/layout.tsx
import React from 'react';
import { Metadata } from 'next';

// Define metadata for the article section
export const metadata: Metadata = {
  title: 'مدیریت مقالات',
  description: 'سیستم مدیریت مقالات - امکان ایجاد، ویرایش و مدیریت مقالات سایت',
};

interface ArticleLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout for the entire article module
 * This layout wraps the article context provider around all article routes
 */
export default function ArticleLayout({ children }: ArticleLayoutProps) {
  return <section data-section="article-module">{children}</section>;
}
