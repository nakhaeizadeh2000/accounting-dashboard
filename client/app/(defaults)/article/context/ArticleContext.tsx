'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  ResponseArticleDto,
  ArticlePaginatedResponseDto,
} from '@/store/features/article/article.model';
import { useGetArticlesQuery, useGetArticleByIdQuery } from '@/store/features/article/article.api';
import { ArticleFilterFormData } from '@/schemas/validations/article/article.schema';

// Define the context shape
interface ArticleContextType {
  // State
  currentArticle: ResponseArticleDto | null;
  articleList: ArticlePaginatedResponseDto | null;
  isLoading: boolean;
  error: any;
  filters: ArticleFilterFormData;
  selectedArticles: ResponseArticleDto[];

  // Actions
  setFilters: (filters: ArticleFilterFormData) => void;
  selectArticle: (articleId: number) => void;
  clearSelectedArticle: () => void;
  refreshData: () => void;
  setSelectedArticles: (articles: ResponseArticleDto[]) => void;
}

// Create the context
const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

// Context provider component
export const ArticleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null);
  const [filters, setFilters] = useState<ArticleFilterFormData>({
    page: 1,
    limit: 10,
  });
  const [selectedArticles, setSelectedArticles] = useState<ResponseArticleDto[]>([]);

  // Fetch article list using RTK Query
  const {
    data: articleListData,
    isLoading: isLoadingList,
    error: listError,
    refetch: refetchList,
  } = useGetArticlesQuery(
    {
      page: filters.page || 1,
      limit: filters.limit || 10,
    },
    {
      // Skip initial fetch if no filters are set to avoid unnecessary requests
      skip: filters === undefined,
    },
  );

  // Fetch single article if an ID is selected
  const {
    data: articleData,
    isLoading: isLoadingArticle,
    error: articleError,
    refetch: refetchArticle,
  } = useGetArticleByIdQuery(
    {
      id: currentArticleId as number,
    },
    {
      // Skip if no article is selected
      skip: currentArticleId === null,
    },
  );

  // Select an article by ID
  const selectArticle = useCallback((articleId: number) => {
    setCurrentArticleId(articleId);
  }, []);

  // Clear selected article
  const clearSelectedArticle = useCallback(() => {
    setCurrentArticleId(null);
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: ArticleFilterFormData) => {
    setFilters(newFilters);
  }, []);

  // Refresh data
  const refreshData = useCallback(() => {
    if (currentArticleId) {
      refetchArticle();
    } else {
      refetchList();
    }
  }, [currentArticleId, refetchArticle, refetchList]);

  // Determine loading state
  const isLoading = isLoadingList || isLoadingArticle;

  // Determine error state
  const error = listError || articleError;

  // Context value
  const value: ArticleContextType = {
    currentArticle: articleData?.data || null,
    articleList: articleListData?.data || null,
    isLoading,
    error,
    filters,
    selectedArticles,
    setFilters: updateFilters,
    selectArticle,
    clearSelectedArticle,
    refreshData,
    setSelectedArticles,
  };

  return <ArticleContext.Provider value={value}>{children}</ArticleContext.Provider>;
};

// Hook for consuming the article context
export const useArticles = (): ArticleContextType => {
  const context = useContext(ArticleContext);

  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }

  return context;
};
