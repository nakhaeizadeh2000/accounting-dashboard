'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  CreateArticleDto,
  UpdateArticleDto,
  ResponseArticleDto,
} from '@/store/features/article/article.model';
import {
  useCreateArticleMutation,
  useUpdateArticleMutation,
} from '@/store/features/article/article.api';
import { useRouter } from 'next/navigation';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { ItemType } from '@/components/modules/drop-downs/drop-down.type';
import { ARTICLE_ROUTES } from '../index';

interface ArticleFormState {
  title: string;
  content: string;
  fileIds: string[];
}

interface ArticleFormErrors {
  title?: string[];
  content?: string[];
  fileIds?: string[];
  formErrors?: string[];
}

interface UseArticleEditorOptions {
  initialArticle?: ResponseArticleDto;
  isEditMode?: boolean;
}

export function useArticleEditor(options: UseArticleEditorOptions = {}) {
  const { initialArticle, isEditMode = false } = options;
  const router = useRouter();

  // Form state
  const [formState, setFormState] = useState<ArticleFormState>({
    title: initialArticle?.title || '',
    content: initialArticle?.content || '',
    fileIds: initialArticle?.files?.map((f) => f.id) || [],
  });

  // Selected author
  const [selectedAuthor, setSelectedAuthor] = useState<ItemType[]>(
    initialArticle ? [{ value: initialArticle.authorId, label: initialArticle.authorId }] : [],
  );

  // Form errors
  const [errors, setErrors] = useState<ArticleFormErrors>({});

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // RTK Query mutations
  const [createArticle, { isLoading: isCreating }] = useCreateArticleMutation();
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  // Update form state when initialArticle changes (for edit mode)
  useEffect(() => {
    if (initialArticle && isEditMode) {
      setFormState({
        title: initialArticle.title,
        content: initialArticle.content,
        fileIds: initialArticle.files?.map((f) => f.id) || [],
      });

      setSelectedAuthor([
        {
          value: initialArticle.authorId,
          label: initialArticle.authorId,
        },
      ]);
    }
  }, [initialArticle, isEditMode]);

  // Handle input changes
  const handleInputChange = useCallback(
    (name: keyof ArticleFormState, value: any) => {
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error for this field when user types
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors],
  );

  // Handle author selection
  const handleAuthorSelect = useCallback(
    (authors: ItemType[]) => {
      setSelectedAuthor(authors);

      // Clear form errors if there was an author-related error
      if (errors.formErrors) {
        setErrors((prev) => ({
          ...prev,
          formErrors: undefined,
        }));
      }
    },
    [errors],
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: ArticleFormErrors = {};

    if (!formState.title.trim()) {
      newErrors.title = ['عنوان مقاله الزامی است'];
    } else if (formState.title.length < 3) {
      newErrors.title = ['عنوان مقاله باید حداقل 3 کاراکتر باشد'];
    }

    if (!formState.content.trim()) {
      newErrors.content = ['محتوای مقاله الزامی است'];
    } else if (formState.content.length < 10) {
      newErrors.content = ['محتوای مقاله باید حداقل 10 کاراکتر باشد'];
    }

    if (!isEditMode && !selectedAuthor.length) {
      newErrors.formErrors = ['انتخاب نویسنده الزامی است'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState, selectedAuthor, isEditMode]);

  // Submit form
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      setIsSubmitSuccess(false);

      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      try {
        if (isEditMode && initialArticle) {
          // Update existing article
          const updateData: UpdateArticleDto = {};

          // Only include changed fields
          if (formState.title !== initialArticle.title) {
            updateData.title = formState.title;
          }

          if (formState.content !== initialArticle.content) {
            updateData.content = formState.content;
          }

          // Always include fileIds to ensure proper file relationships
          updateData.fileIds = formState.fileIds;

          const result = await updateArticle({
            id: initialArticle.id,
            article: updateData,
          }).unwrap();

          if (result.success) {
            setIsSubmitSuccess(true);

            // Navigate to article detail page after a short delay
            setTimeout(() => {
              router.push(ARTICLE_ROUTES.VIEW(initialArticle.id));
            }, 500);
          }
        } else {
          // Create new article
          if (!selectedAuthor.length) {
            setErrors({
              formErrors: ['انتخاب نویسنده الزامی است'],
            });
            setIsSubmitting(false);
            return;
          }

          const createData: CreateArticleDto = {
            title: formState.title,
            content: formState.content,
            authorId: selectedAuthor[0].value.toString(),
            fileIds: formState.fileIds,
          };

          const result = await createArticle(createData).unwrap();

          if (result.success) {
            setIsSubmitSuccess(true);

            // Navigate to article list page after a short delay
            setTimeout(() => {
              router.push(ARTICLE_ROUTES.LIST);
            }, 500);
          }
        }
      } catch (err) {
        if (isResponseCatchError(err)) {
          // Handle validation errors from API
          if (err.data.validationErrors) {
            setErrors(err.data.validationErrors);
          } else {
            setErrors({
              formErrors: err.data.message || ['خطا در ذخیره مقاله'],
            });
          }
        } else {
          setErrors({
            formErrors: ['خطای ناشناخته در ارتباط با سرور'],
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      isEditMode,
      initialArticle,
      formState,
      selectedAuthor,
      updateArticle,
      createArticle,
      router,
    ],
  );

  // Handle cancellation
  const handleCancel = useCallback(() => {
    if (isEditMode && initialArticle) {
      router.push(ARTICLE_ROUTES.VIEW(initialArticle.id));
    } else {
      router.push(ARTICLE_ROUTES.LIST);
    }
  }, [isEditMode, initialArticle, router]);

  return {
    formState,
    selectedAuthor,
    errors,
    isSubmitting: isSubmitting || isCreating || isUpdating,
    isSubmitSuccess,
    handleInputChange,
    handleAuthorSelect,
    handleSubmit,
    handleCancel,
  };
}
