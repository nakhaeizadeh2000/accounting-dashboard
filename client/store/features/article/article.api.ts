// app/store/features/article/article.api.ts
import { baseApi } from '@/store/api';
import {
  ArticlePaginatedResponseDto,
  ResponseArticleDto,
  CreateArticleDto,
  UpdateArticleDto,
} from './article.model';
import { BaseResponse } from '@/store/features/base-response.model';

export const articleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get paginated articles list
    getArticles: builder.query<
      BaseResponse<ArticlePaginatedResponseDto>,
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => `article?page=${page}&limit=${limit}`,
      providesTags: ['Article'],
    }),

    // Get a single article by ID
    getArticleById: builder.query<BaseResponse<ResponseArticleDto>, { id: number }>({
      query: ({ id }) => `article/${id}`,
      providesTags: (result, error, arg) => [{ type: 'Article', id: arg.id.toString() }],
    }),

    // Create a new article
    createArticle: builder.mutation<BaseResponse<ResponseArticleDto>, CreateArticleDto>({
      query: (newArticle) => ({
        url: 'article',
        method: 'POST',
        body: newArticle,
      }),
      invalidatesTags: ['Article'],
    }),

    // Update an existing article
    updateArticle: builder.mutation<
      BaseResponse<ResponseArticleDto>,
      { id: number; article: UpdateArticleDto }
    >({
      query: ({ id, article }) => ({
        url: `article/${id}`,
        method: 'PATCH',
        body: article,
      }),
      invalidatesTags: (result, error, arg) => [
        'Article',
        { type: 'Article', id: arg.id.toString() },
      ],
    }),

    // Delete an article
    deleteArticle: builder.mutation<BaseResponse<void>, { id: number }>({
      query: ({ id }) => ({
        url: `article/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Article'],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} = articleApi;
