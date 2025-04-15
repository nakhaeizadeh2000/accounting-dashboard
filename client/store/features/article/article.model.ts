import { ResponseFileDto } from '../files/file.model';

// Base interface for article data
export interface ArticleData {
  title: string;
  content: string;
  authorId: string;
  fileIds?: string[];
}

// Interface for creating a new article
export type CreateArticleDto = ArticleData;

// Interface for updating an existing article
export type UpdateArticleDto = Partial<ArticleData>;

// Interface for an individual article in responses
export interface ResponseArticleDto {
  id: number;
  title: string;
  content: string;
  authorId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  files?: ResponseFileDto[];
}

// Interface for paginated article response
export interface ArticlePaginatedResponseDto {
  items: ResponseArticleDto[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

// Form data interfaces
export interface ArticleFormData {
  title: string;
  content: string;
  fileIds?: string[];
}

// Type for form errors
export type ArticleFormErrors = {
  title?: string[];
  content?: string[];
  fileIds?: string[];
  formErrors?: string[];
};
