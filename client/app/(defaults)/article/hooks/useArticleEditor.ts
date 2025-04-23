'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
import { ItemType } from '@/components/modules/drop-down-legacy/drop-down.type';
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

interface ArticleFormTouched {
  title: boolean;
  content: boolean;
  fileIds: boolean;
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

  // Track which fields have been touched (for validation)
  const [touched, setTouched] = useState<ArticleFormTouched>({
    title: false,
    content: false,
    fileIds: false,
  });

  // Selected author - use a ref to prevent re-renders that cause the dropdown error
  const authorRef = useRef<ItemType[]>(
    initialArticle ? [{ value: initialArticle.authorId, label: initialArticle.authorId }] : [],
  );
  const [selectedAuthor, setSelectedAuthor] = useState<ItemType[]>(authorRef.current);

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

      // Create a new author object with consistent properties
      const authorObject = {
        value: initialArticle.authorId,
        label: initialArticle.authorId,
      };

      setSelectedAuthor([authorObject]);
      authorRef.current = [authorObject];

      // In edit mode, consider fields as touched for validation
      setTouched({
        title: true,
        content: true,
        fileIds: true,
      });
    }
  }, [initialArticle, isEditMode]);

  // Handle input changes
  const handleInputChange = useCallback(
    (name: keyof ArticleFormState, value: any) => {
      // Update form state
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Mark field as touched
      setTouched((prev) => ({
        ...prev,
        [name]: true,
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
      // Update the ref first to avoid rendering issues
      authorRef.current = authors;

      // Update state directly - this should be safe if we're managing state well
      setSelectedAuthor(authors);

      // Clear form errors if there was an author-related error
      if (errors.formErrors) {
        setErrors((prev) => ({
          ...prev,
          formErrors: prev.formErrors?.filter((err) => !err.includes('نویسنده')),
        }));
      }
    },
    [errors],
  );

  // Validate a single field
  const validateField = useCallback(
    (name: keyof ArticleFormState): boolean => {
      let isValid = true;
      const fieldErrors: string[] = [];

      switch (name) {
        case 'title':
          if (!formState.title.trim()) {
            fieldErrors.push('عنوان مقاله الزامی است');
            isValid = false;
          } else if (formState.title.trim().length < 3) {
            fieldErrors.push('عنوان مقاله باید حداقل 3 کاراکتر باشد');
            isValid = false;
          } else if (formState.title.length > 255) {
            fieldErrors.push('عنوان مقاله نمی‌تواند بیشتر از 255 کاراکتر باشد');
            isValid = false;
          }
          break;

        case 'content':
          if (!formState.content.trim()) {
            fieldErrors.push('محتوای مقاله الزامی است');
            isValid = false;
          } else if (formState.content.trim().length < 10) {
            fieldErrors.push('محتوای مقاله باید حداقل 10 کاراکتر باشد');
            isValid = false;
          }
          break;

        // Add validation for fileIds if needed in the future
        case 'fileIds':
          // Files are optional, so no validation required
          break;
      }

      // Update errors state
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors.length > 0 ? fieldErrors : undefined,
      }));

      return isValid;
    },
    [formState],
  );

  // Validate the whole form
  const validateForm = useCallback((): boolean => {
    // Mark all fields as touched
    setTouched({
      title: true,
      content: true,
      fileIds: true,
    });

    // Validate each field
    const isTitleValid = validateField('title');
    const isContentValid = validateField('content');

    // No need to validate fileIds since they're optional

    // For new articles, check if author is selected
    let isAuthorValid = true;
    let hasFormErrors = false;

    if (!isEditMode && authorRef.current.length === 0) {
      isAuthorValid = false;
      hasFormErrors = true;

      setErrors((prev) => ({
        ...prev,
        formErrors: [...(prev.formErrors || []), 'انتخاب نویسنده الزامی است'],
      }));
    }

    return isTitleValid && isContentValid && isAuthorValid && !hasFormErrors;
  }, [validateField, isEditMode]);

  // Submit form
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
      }

      // Reset submission status at the beginning of a new submission
      setIsSubmitSuccess(false);
      setIsSubmitting(true);

      // Clear any previous form errors
      setErrors((prev) => ({
        ...prev,
        formErrors: undefined,
      }));

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
          }
        } else {
          // Create new article
          if (!authorRef.current.length) {
            setErrors({
              formErrors: ['انتخاب نویسنده الزامی است'],
            });
            setIsSubmitting(false);
            return;
          }

          const createData: CreateArticleDto = {
            title: formState.title,
            content: formState.content,
            authorId: authorRef.current[0].value.toString(),
            fileIds: formState.fileIds,
          };

          const result = await createArticle(createData).unwrap();

          if (result.success) {
            setIsSubmitSuccess(true);
          }
        }
      } catch (err) {
        if (isResponseCatchError(err)) {
          // Handle validation errors from API
          if (err.data.validationErrors) {
            setErrors(err.data.validationErrors);
          } else {
            // Handle message as array or string
            const errorMessage = err.data.message;
            const errorMessages = Array.isArray(errorMessage)
              ? errorMessage
              : [errorMessage || 'خطا در ذخیره مقاله'];

            setErrors({
              formErrors: errorMessages,
            });
          }
        } else {
          console.error('Unknown error:', err);
          setErrors({
            formErrors: ['خطای ناشناخته در ارتباط با سرور'],
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, isEditMode, initialArticle, formState, updateArticle, createArticle],
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
    touched,
    isSubmitting: isSubmitting || isCreating || isUpdating,
    isSubmitSuccess,
    handleInputChange,
    handleAuthorSelect,
    validateField,
    validateForm,
    handleSubmit,
    handleCancel,
  };
}
