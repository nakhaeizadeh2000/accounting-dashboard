// hooks/useArticleOperations.ts
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} from '@/store/features/article/article.api';
import {
  setFilter,
  resetFilter,
  setLastViewedArticleId,
} from '@/store/features/article/articleSlice';
import { CreateArticleDto, UpdateArticleDto } from '@/store/features/article/article.model';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/redux.hook';
import { ARTICLE_ROUTES } from '..';

/**
 * Custom hook for common article operations
 */
export const useArticleOperations = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Access Redux state
  const currentFilter = useAppSelector((state) => state.article.currentFilter);
  const currentArticle = useAppSelector((state) => state.article.currentArticle);
  const lastViewedArticleId = useAppSelector((state) => state.article.lastViewedArticleId);

  // RTK Query mutations
  const [createArticleMutation] = useCreateArticleMutation();
  const [updateArticleMutation] = useUpdateArticleMutation();
  const [deleteArticleMutation] = useDeleteArticleMutation();

  /**
   * Create a new article
   */
  const createArticle = useCallback(
    async (data: CreateArticleDto) => {
      try {
        const result = await createArticleMutation(data).unwrap();

        if (result.success && result.data) {
          // Navigate to the view page for the new article
          router.push(ARTICLE_ROUTES.VIEW(result.data.id));
          return { success: true, article: result.data };
        }

        return { success: false, error: 'Failed to create article' };
      } catch (err) {
        if (isResponseCatchError(err)) {
          return {
            success: false,
            error: err.data.message || 'Error creating article',
            validationErrors: err.data.validationErrors,
          };
        }

        return { success: false, error: 'Unknown error occurred' };
      }
    },
    [createArticleMutation, router],
  );

  /**
   * Update an existing article
   */
  const updateArticle = useCallback(
    async (id: number, data: UpdateArticleDto) => {
      try {
        const result = await updateArticleMutation({ id, article: data }).unwrap();

        if (result.success && result.data) {
          return { success: true, article: result.data };
        }

        return { success: false, error: 'Failed to update article' };
      } catch (err) {
        if (isResponseCatchError(err)) {
          return {
            success: false,
            error: err.data.message || 'Error updating article',
            validationErrors: err.data.validationErrors,
          };
        }

        return { success: false, error: 'Unknown error occurred' };
      }
    },
    [updateArticleMutation],
  );

  /**
   * Delete an article
   */
  const deleteArticle = useCallback(
    async (id: number) => {
      try {
        const result = await deleteArticleMutation({ id }).unwrap();

        if (result.success) {
          // If we deleted the current article, navigate back to the list
          if (currentArticle?.id === id) {
            router.push(ARTICLE_ROUTES.LIST);
          }

          return { success: true };
        }

        return { success: false, error: 'Failed to delete article' };
      } catch (err) {
        if (isResponseCatchError(err)) {
          return {
            success: false,
            error: err.data.message || 'Error deleting article',
          };
        }

        return { success: false, error: 'Unknown error occurred' };
      }
    },
    [deleteArticleMutation, currentArticle, router],
  );

  /**
   * View an article
   */
  const viewArticle = useCallback(
    (id: number) => {
      dispatch(setLastViewedArticleId(id));
      router.push(ARTICLE_ROUTES.VIEW(id));
    },
    [dispatch, router],
  );

  /**
   * Edit an article
   */
  const editArticle = useCallback(
    (id: number) => {
      router.push(ARTICLE_ROUTES.EDIT(id));
    },
    [router],
  );

  /**
   * Navigate to article creation page
   */
  const createNewArticle = useCallback(() => {
    router.push(ARTICLE_ROUTES.CREATE);
  }, [router]);

  /**
   * Update filter criteria
   */
  const updateFilter = useCallback(
    (newFilter: Partial<typeof currentFilter>) => {
      dispatch(setFilter(newFilter));
    },
    [dispatch],
  );

  /**
   * Reset filter to defaults
   */
  const clearFilter = useCallback(() => {
    dispatch(resetFilter());
  }, [dispatch]);

  return {
    // State
    currentFilter,
    currentArticle,
    lastViewedArticleId,

    // Operations
    createArticle,
    updateArticle,
    deleteArticle,
    viewArticle,
    editArticle,
    createNewArticle,
    updateFilter,
    clearFilter,
  };
};

export default useArticleOperations;
